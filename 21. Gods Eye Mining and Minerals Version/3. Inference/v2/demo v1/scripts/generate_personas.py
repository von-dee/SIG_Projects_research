"""
Mining Intelligence Atlas — Persona Page Generator
Builds personas.html: interactive persona selector + detail panel.
"""
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from source_data import CATEGORIES, COMBINATIONS
from personas_data import PERSONAS, STAGES

OUT_DIR = Path("/home/z/my-project/download/mining-intelligence-docs")

# Build lookup tables
CAT_BY_ID = {c["id"]: c for c in CATEGORIES}
CAT_BY_SOURCE = {}  # source_name -> category
for c in CATEGORIES:
    for s in c["sources"]:
        CAT_BY_SOURCE[s["name"]] = c
COMBO_BY_TITLE = {combo["title"]: combo for combo in COMBINATIONS}
COMBO_INDEX = {combo["title"]: i + 1 for i, combo in enumerate(COMBINATIONS)}


def esc(s):
    return (s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


def topbar(current_id=""):
    nav_links = [
        ("index.html", "Home"),
        ("personas.html", "Personas"),
        ("combinations.html", "Combinations"),
        ("methodology.html", "Methodology"),
    ]
    nav_html = ""
    for href, label in nav_links:
        is_active = href.replace(".html", "").lower() == current_id
        cls = 'class="topbar__link"' + (' style="color:var(--text-0)"' if is_active else '')
        nav_html += f'<a href="{href}" {cls}>{label}</a>\n'
    return f'''<div class="progress-bar"></div>
<header class="topbar">
  <a href="index.html" class="topbar__brand">
    <div class="topbar__brand-icon">⛏</div>
    <div class="topbar__brand-text">
      Mining Intelligence Atlas
      <small>125 sources · 60 personas · 10 combinations</small>
    </div>
  </a>
  <div class="topbar__search">
    <span class="topbar__search-icon">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
    </span>
    <input type="text" placeholder="Search sources, insights, combinations…  (press /)" />
  </div>
  <nav class="topbar__nav">
    {nav_html}
    <button class="topbar__menu-toggle" aria-label="Menu">☰</button>
  </nav>
</header>'''


def sidebar(current_id=""):
    cat_links = ""
    for c in CATEGORIES:
        active = 'is-active' if c["id"] == current_id else ''
        cat_links += f'''<a href="{c["id"]}.html" class="sidebar__link {active}" data-target="{c["id"]}">
          <span class="sidebar__link-dot" style="background:{c["color"]};color:{c["color"]}"></span>
          <span>{c["title"]}</span>
          <span class="sidebar__link-count">{len(c["sources"])}</span>
        </a>'''
    top_links = ""
    for href, label in [("index.html", "Overview"), ("personas.html", "Personas"), ("combinations.html", "Combinations"), ("methodology.html", "Methodology")]:
        active = 'is-active' if href.replace(".html", "").lower() == current_id else ''
        top_links += f'<a href="{href}" class="sidebar__link {active}"><span>{label}</span></a>'
    return f'''<aside class="sidebar">
  <div class="sidebar__section">
    <div class="sidebar__title">Atlas</div>
    {top_links}
  </div>
  <div class="sidebar__section">
    <div class="sidebar__title">Categories</div>
    {cat_links}
  </div>
</aside>'''


# ============================================================
# Build personas.html
# ============================================================
def build_personas():
    total_inferences = sum(len(p["inferences"]) for p in PERSONAS)
    total_source_refs = sum(len(p["sources"]) for p in PERSONAS)
    total_combo_refs = sum(len(p["combinations"]) for p in PERSONAS)

    hero = f'''<section class="persona-hero">
  <div class="hero__eyebrow">
    <span class="hero__eyebrow-dot"></span>
    Persona-Driven Intelligence Tool · {len(PERSONAS)} mining value-chain roles
  </div>
  <h1 class="persona-hero__title">
    Pick a <span class="hero__title-accent">persona</span>.<br/>
    Get the data stack & inferences that role needs.
  </h1>
  <p class="persona-hero__subtitle">
    Select from <strong>{len(PERSONAS)} mining-sector value-chain personas</strong> across {len(STAGES)} functional stages.
    For each role we recommend a curated <strong>source stack</strong> (drawn from the 125-source atlas), identify the
    <strong>cross-category combinations</strong> that apply, and surface <strong>persona-specific inferences</strong> —
    each one tied to the exact source combination that produces it.
  </p>
  <div class="persona-hero__stats">
    <div class="hero__stat">
      <div class="hero__stat-value" data-count="{len(PERSONAS)}">0</div>
      <div class="hero__stat-label">Personas</div>
    </div>
    <div class="hero__stat">
      <div class="hero__stat-value" data-count="{len(STAGES)}">0</div>
      <div class="hero__stat-label">Value-Chain Stages</div>
    </div>
    <div class="hero__stat">
      <div class="hero__stat-value" data-count="{total_inferences}">0</div>
      <div class="hero__stat-label">Persona Inferences</div>
    </div>
    <div class="hero__stat">
      <div class="hero__stat-value" data-count="{total_source_refs}">0</div>
      <div class="hero__stat-label">Source References</div>
    </div>
  </div>
</section>'''

    # ---- Build persona selector (left panel) ----
    # Group personas by stage
    by_stage = {}
    for p in PERSONAS:
        by_stage.setdefault(p["stage"], []).append(p)

    selector_groups = ""
    for stage_id, stage_name, stage_icon in STAGES:
        personas_in_stage = by_stage.get(stage_id, [])
        if not personas_in_stage:
            continue
        tiles = ""
        for p in personas_in_stage:
            tiles += f'''<button class="persona-tile" data-persona-id="{esc(p["id"])}" data-search="{esc(p["name"] + " " + p["summary"] + " " + " ".join(p["kpis"]))}">
  <span class="persona-tile__icon">{p["icon"]}</span>
  <span class="persona-tile__name">{esc(p["name"])}</span>
</button>'''
        selector_groups += f'''<div class="persona-selector__group" data-stage="{stage_id}">
  <div class="persona-selector__group-title">
    <span>{stage_icon}</span> {esc(stage_name)}
    <span class="persona-selector__group-count">{len(personas_in_stage)}</span>
  </div>
  {tiles}
</div>'''

    # Stage filter chips
    stage_chips = '<button class="chip is-active" data-stage-filter="all">All Stages</button>'
    for stage_id, stage_name, stage_icon in STAGES:
        stage_chips += f'<button class="chip" data-stage-filter="{stage_id}">{stage_icon} {esc(stage_name.split(" & ")[0].split(", ")[0])}</button>'

    # ---- Build persona detail (right panel) — rendered client-side ----
    # Pre-render each persona's detail as a hidden template
    persona_templates = ""
    for p in PERSONAS:
        # Find stage
        stage_info = next((s for s in STAGES if s[0] == p["stage"]), None)
        stage_label = f'{stage_info[2]} {stage_info[1]}' if stage_info else p["stage"]

        # Decisions
        decisions_html = "".join(
            f'<div class="decision-card">{esc(d)}</div>' for d in p["decisions"]
        )

        # KPIs
        kpis_html = "".join(f'<span class="kpi-chip">{esc(k)}</span>' for k in p["kpis"])

        # Source stack — group sources by category
        sources_by_cat = {}
        for sname in p["sources"]:
            cat = CAT_BY_SOURCE.get(sname)
            if cat:
                sources_by_cat.setdefault(cat["id"], []).append(sname)
            else:
                sources_by_cat.setdefault("other", []).append(sname)

        source_stack_html = ""
        for cat in CATEGORIES:
            cat_sources = sources_by_cat.get(cat["id"], [])
            if not cat_sources:
                continue
            pills = ""
            for sname in cat_sources:
                pills += f'<a href="{cat["id"]}.html" class="source-pill" style="--cat-color:{cat["color"]}" title="{esc(sname)}"><span class="source-pill__dot"></span>{esc(sname)}</a>'
            source_stack_html += f'''<div class="source-stack__category">
  <div class="source-stack__cat-head" style="border-left:3px solid {cat["color"]}">
    <span class="source-stack__cat-icon">{cat["icon"]}</span>
    <span>{esc(cat["title"])}</span>
    <span class="source-stack__cat-count">{len(cat_sources)} source{"s" if len(cat_sources) > 1 else ""}</span>
  </div>
  <div class="source-stack__cat-body">{pills}</div>
</div>'''

        # Combinations
        combos_html = ""
        for ctitle in p["combinations"]:
            combo = COMBO_BY_TITLE.get(ctitle)
            if not combo:
                continue
            idx = COMBO_INDEX.get(ctitle, "?")
            combos_html += f'''<a href="combinations.html#combo-{idx}" class="combo-link">
  <div class="combo-link__num">COMBINATION {idx:02d}</div>
  <div class="combo-link__title">{esc(ctitle)}</div>
  <div class="combo-link__subtitle">{esc(combo["subtitle"])}</div>
</a>'''
        if not combos_html:
            combos_html = '<p class="muted" style="font-size:13px">No primary combinations recommended — see inferences below for source-level composites.</p>'

        # Inferences
        inferences_html = ""
        for inf_title, inf_formula, inf_text in p["inferences"]:
            # Parse formula: split by " + " or " × "
            formula_parts = []
            parts = inf_formula.replace(" × ", " + ").split(" + ")
            for i, part in enumerate(parts):
                part = part.strip()
                formula_parts.append(f'<span class="inference-card__formula-source">{esc(part)}</span>')
                if i < len(parts) - 1:
                    formula_parts.append('<span class="inference-card__formula-op">+</span>')
            formula_html = "".join(formula_parts)
            inferences_html += f'''<div class="inference-card">
  <div class="inference-card__title">{esc(inf_title)}</div>
  <div class="inference-card__formula">{formula_html}</div>
  <div class="inference-card__text">{esc(inf_text)}</div>
</div>'''

        # Compose persona template
        persona_templates += f'''<div class="persona-detail" data-persona-detail="{esc(p["id"])}" style="display:none">
  <div class="persona-detail__header">
    <div class="persona-detail__eyebrow">{esc(stage_label)}</div>
    <h2 class="persona-detail__title">
      <span class="persona-detail__title-icon">{p["icon"]}</span>
      {esc(p["name"])}
    </h2>
    <p class="persona-detail__summary">{esc(p["summary"])}</p>
  </div>

  <div class="persona-section">
    <div class="persona-section__title"><span class="persona-section__title-num">1</span>Key Decisions</div>
    <div class="decisions-grid">{decisions_html}</div>
  </div>

  <div class="persona-section">
    <div class="persona-section__title"><span class="persona-section__title-num">2</span>KPIs They Track</div>
    <div class="kpi-list">{kpis_html}</div>
  </div>

  <div class="persona-section">
    <div class="persona-section__title"><span class="persona-section__title-num">3</span>Recommended Source Stack</div>
    <p class="muted" style="font-size:12px;margin-bottom:var(--space-md)">{len(p["sources"])} sources drawn from the 125-source atlas — click any pill to open the full source documentation.</p>
    <div class="source-stack">{source_stack_html}</div>
  </div>

  <div class="persona-section">
    <div class="persona-section__title"><span class="persona-section__title-num">4</span>Applicable Cross-Category Combinations</div>
    <div class="combo-links">{combos_html}</div>
  </div>

  <div class="persona-section">
    <div class="persona-section__title"><span class="persona-section__title-num">5</span>Persona-Specific Inferences</div>
    <p class="muted" style="font-size:12px;margin-bottom:var(--space-md)">{len(p["inferences"])} inferences — each one tied to the exact source combination that produces it.</p>
    <div class="inference-list">{inferences_html}</div>
  </div>
</div>'''

    # Empty state when no persona selected
    empty_state = '''<div class="persona-detail is-empty" data-persona-detail="__empty__">
  <div class="persona-detail__empty">
    <div class="persona-detail__empty-icon">👆</div>
    <div class="persona-detail__empty-text">
      Select a persona from the left to see the recommended data stack, applicable combinations, and persona-specific inferences.
    </div>
  </div>
</div>'''

    # Compose layout
    layout = f'''<div class="persona-layout">
  <div class="persona-selector">
    <div class="persona-selector__head">
      <div class="persona-selector__title">Persona Selector</div>
      <div class="persona-selector__search">
        <span class="persona-selector__search-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </span>
        <input type="text" id="persona-search" placeholder="Search by role, KPI, or decision…" />
      </div>
      <div class="persona-selector__filters">{stage_chips}</div>
    </div>
    <div class="persona-selector__list" id="persona-list">
      {selector_groups}
    </div>
  </div>

  <div>
    {empty_state}
    {persona_templates}
  </div>
</div>'''

    # Persona interaction JS (inline, runs after main.js)
    persona_js = '''<script>
(function () {
  'use strict';

  const tiles = document.querySelectorAll('.persona-tile');
  const details = document.querySelectorAll('[data-persona-detail]');
  const searchInput = document.getElementById('persona-search');
  const stageChips = document.querySelectorAll('.persona-selector__filters .chip');
  const groups = document.querySelectorAll('.persona-selector__group');

  let activeStageFilter = 'all';

  function selectPersona(id) {
    tiles.forEach(t => t.classList.toggle('is-active', t.dataset.personaId === id));
    details.forEach(d => {
      d.style.display = (d.dataset.personaDetail === id) ? 'block' : 'none';
    });
    // Update accent color based on persona stage
    const tile = document.querySelector('.persona-tile.is-active');
    // Scroll detail to top
    const detail = document.querySelector('[data-persona-detail="' + id + '"]');
    if (detail) detail.scrollTop = 0;
    // Update URL hash
    if (history.replaceState) history.replaceState(null, '', '#' + id);
  }

  function applyFilters() {
    const q = (searchInput.value || '').trim().toLowerCase();
    tiles.forEach(tile => {
      const stage = tile.closest('.persona-selector__group').dataset.stage;
      const stageMatch = (activeStageFilter === 'all' || stage === activeStageFilter);
      const text = (tile.dataset.search || '').toLowerCase();
      const qMatch = !q || text.includes(q);
      tile.style.display = (stageMatch && qMatch) ? '' : 'none';
    });
    // Hide empty groups
    groups.forEach(g => {
      const visible = g.querySelectorAll('.persona-tile:not([style*="display: none"])');
      g.style.display = visible.length ? '' : 'none';
    });
  }

  tiles.forEach(tile => {
    tile.addEventListener('click', () => selectPersona(tile.dataset.personaId));
  });

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  stageChips.forEach(chip => {
    chip.addEventListener('click', () => {
      stageChips.forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      activeStageFilter = chip.dataset.stageFilter;
      applyFilters();
    });
  });

  // Auto-select from URL hash or first persona
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    const target = document.querySelector('[data-persona-id="' + hash + '"]');
    if (target) {
      selectPersona(hash);
      target.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }
  }
  // Default: select first persona
  if (tiles.length) selectPersona(tiles[0].dataset.personaId);
})();
</script>'''

    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Mining Personas — Mining Intelligence Atlas</title>
  <meta name="description" content="Interactive persona-driven tool: select from 60 mining value-chain personas and get a curated data stack, applicable combinations, and persona-specific inferences." />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/styles.css" />
</head>
<body>
{topbar("personas")}
<div class="layout">
{sidebar("personas")}
<main class="main">
{hero}
{layout}
</main>
</div>
<footer class="footer">
  Mining Intelligence Atlas · Generated <span data-last-modified></span> · {len(PERSONAS)} personas across {len(STAGES)} value-chain stages · {total_inferences} persona-specific inferences
</footer>
<script src="js/main.js"></script>
<script src="js/voice-assistant.js"></script>
{persona_js}
</body>
</html>'''

    (OUT_DIR / "personas.html").write_text(html, encoding="utf-8")
    print(f"  ✓ personas.html ({len(html):,} bytes)")


if __name__ == "__main__":
    print("Building personas.html…")
    build_personas()
    print(f"\n✓ Done. {len(PERSONAS)} personas generated.")
