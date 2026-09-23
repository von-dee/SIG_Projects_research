"""
Generate a compact knowledge-base JSON for the voice assistant.
This is embedded in the LLM system prompt so the assistant can answer
questions about sources, personas, and combinations without RAG.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from source_data import CATEGORIES, COMBINATIONS
from personas_data import PERSONAS, STAGES

OUT = Path("/home/z/my-project/public/knowledge.json")

kb = {
    "site_name": "Mining Intelligence Atlas",
    "tagline": "125 sources · 60 personas · 10 combinations",
    "base_url": "",  # relative
    "pages": [
        {"id": "index", "url": "index.html", "title": "Home — Mining Intelligence Atlas", "description": "Overview of all 12 categories and 125 sources"},
        {"id": "personas", "url": "personas.html", "title": "Personas — Interactive persona-driven intelligence tool", "description": "60 mining value-chain personas with curated source stacks and inferences"},
        {"id": "combinations", "url": "combinations.html", "title": "Combinations — 10 cross-category insight workflows", "description": "Worked examples of multi-source intelligence combinations"},
        {"id": "methodology", "url": "methodology.html", "title": "Methodology — Integration patterns and architecture", "description": "How the atlas is built: 4 integration patterns, layer composition, key brokering"},
    ],
    "categories": [],
    "personas": [],
    "combinations": [],
}

# Categories — compact (id, title, url, sources with name+method only)
for c in CATEGORIES:
    kb["categories"].append({
        "id": c["id"],
        "title": c["title"],
        "icon": c["icon"],
        "url": f'{c["id"]}.html',
        "source_count": len(c["sources"]),
        "tagline": c["tagline"],
        "description": c["description"][:400] + ("..." if len(c["description"]) > 400 else ""),
        "sources": [{"name": s["name"], "method": s["method"], "format": s["format"]} for s in c["sources"]],
    })

# Personas — compact
for p in PERSONAS:
    stage_info = next((s for s in STAGES if s[0] == p["stage"]), None)
    kb["personas"].append({
        "id": p["id"],
        "name": p["name"],
        "stage": p["stage"],
        "stage_name": stage_info[1] if stage_info else p["stage"],
        "icon": p["icon"],
        "url": f'personas.html#{p["id"]}',
        "summary": p["summary"],
        "decisions": p["decisions"],
        "kpis": p["kpis"],
        "sources": p["sources"],
        "combinations": p["combinations"],
        "inference_titles": [inf[0] for inf in p["inferences"]],
    })

# Combinations — compact
for i, combo in enumerate(COMBINATIONS):
    kb["combinations"].append({
        "index": i + 1,
        "title": combo["title"],
        "subtitle": combo["subtitle"],
        "url": f'combinations.html#combo-{i+1}',
        "sources": combo["sources"],
        "insight_short": combo["insight"][:300] + ("..." if len(combo["insight"]) > 300 else ""),
    })

OUT.write_text(json.dumps(kb, indent=2, ensure_ascii=False), encoding="utf-8")
print(f"✓ Generated {OUT} ({OUT.stat().st_size:,} bytes)")
print(f"  Categories: {len(kb['categories'])}")
print(f"  Personas:   {len(kb['personas'])}")
print(f"  Combinations: {len(kb['combinations'])}")
