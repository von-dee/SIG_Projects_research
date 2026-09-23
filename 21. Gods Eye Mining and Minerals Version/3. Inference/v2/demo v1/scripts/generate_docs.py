"""
Mining Intelligence Atlas — HTML Generator
Produces 15 HTML pages: 1 home + 12 category + 1 combinations + 1 methodology
"""
import os
import sys
from pathlib import Path

# Allow importing the source_data module
sys.path.insert(0, str(Path(__file__).parent))
from source_data import CATEGORIES, COMBINATIONS

OUT_DIR = Path("/home/z/my-project/download/mining-intelligence-docs")
OUT_DIR.mkdir(parents=True, exist_ok=True)

# ============ Helpers ============
def esc(s):
    return (s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")

def method_badge(method):
    if "Static" in method: return '<span class="badge badge--static">01 Static</span>'
    if "Live" in method: return '<span class="badge badge--live">02 Live</span>'
    if "Keyed" in method: return '<span class="badge badge--keyed">03 Keyed</span>'
    if "ALREADY" in method.upper(): return '<span class="badge badge--integrated">✓ Integrated</span>'
    return f'<span class="badge badge--format">{esc(method)}</span>'

def highlight_code(code):
    """Simple syntax highlighting for JS/JSON snippets."""
    s = esc(code)
    # Strings
    import re
    s = re.sub(r'(&#39;|&quot;|\'|")(.*?)(\1)', r'<span class="tok-str">\1\2\3</span>', s)
    # Comments
    s = re.sub(r'(//.*?)(\n|$)', r'<span class="tok-com">\1</span>\2', s)
    # Keywords
    for kw in ['fetch','new','const','let','var','function','return','if','else','async','await','class']:
        s = re.sub(rf'\b({kw})\b', r'<span class="tok-key">\1</span>', s)
    # Numbers
    s = re.sub(r'\b(\d+)\b', r'<span class="tok-num">\1</span>', s)
    return s

# ============ Topbar ============
def topbar(current_id=""):
    nav_links = [
        ("index.html", "Home"),
        ("personas.html", "Personas"),
        ("combinations.html", "Combinations"),
        ("methodology.html", "Methodology"),
    ]
    nav_html = ""
    for href, label in nav_links:
        active = 'class="topbar__link" style="color:var(--text-0);"' if (href.replace(".html","").lower() == current_id) else 'class="topbar__link"'
        nav_html += f'<a href="{href}" {active}>{label}</a>\n'
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

# ============ Sidebar ============
def sidebar(current_id=""):
    # Section: Categories
    cat_links = ""
    for c in CATEGORIES:
        active = 'is-active' if c["id"] == current_id else ''
        cat_links += f'''<a href="{c["id"]}.html" class="sidebar__link {active}" data-target="{c["id"]}">
          <span class="sidebar__link-dot" style="background:{c["color"]};color:{c["color"]}"></span>
          <span>{c["title"]}</span>
          <span class="sidebar__link-count">{len(c["sources"])}</span>
        </a>'''
    # Section: Top-level
    top_links = ""
    for href, label in [("index.html","Overview"), ("personas.html","Personas"), ("combinations.html","Combinations"), ("methodology.html","Methodology")]:
        active = 'is-active' if href.replace(".html","").lower() == current_id else ''
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

# ============ Source card ============
def source_card(idx, source):
    badges = method_badge(source["method"]) + f' <span class="badge badge--format">{esc(source["format"])}</span>'
    insights_html = "".join(f"<li>{esc(i)}</li>" for i in source["insights"])
    return f'''<article class="source-card" data-method="{source["method"].split()[0].lower()}">
  <header class="source-card__header">
    <span class="source-card__num">{idx:02d}</span>
    <h3 class="source-card__title">{esc(source["name"])}</h3>
    <div class="source-card__badges">{badges}</div>
    <span class="source-card__chevron">▸</span>
  </header>
  <div class="source-card__body">
    <h4>Integration Path</h4>
    <p>{esc(source["integration"])}</p>
    <h4>Advanced Insights</h4>
    <ul>{insights_html}</ul>
    <h4>Deep-Dive Composite</h4>
    <div class="insight-box">
      <div class="insight-box__label">Advanced insight</div>
      <div class="insight-box__text">{esc(source["advanced"])}</div>
    </div>
    <h4>Implementation Snippet</h4>
    <table class="spec-table">
      <tr><td>Layer file</td><td><code>{esc(source["file"])}</code></td></tr>
      <tr><td>Method</td><td>{esc(source["method"])}</td></tr>
      <tr><td>Format</td><td>{esc(source["format"])}</td></tr>
    </table>
    <div class="code-block">
      <div class="code-block__header">
        <span class="code-block__file">📄 {esc(source["file"])}</span>
        <span class="code-block__lang">JavaScript</span>
      </div>
      <pre><code>{highlight_code(source["snippet"])}</code></pre>
    </div>
  </div>
</article>'''

# ============ Page template ============
def page(filename, title, current_id, hero_html, content_html, accent_color=None):
    accent_css = f'<style>:root{{--accent:{accent_color};--accent-soft:rgba({hex_to_rgb(accent_color)},0.14);--accent-glow:rgba({hex_to_rgb(accent_color)},0.35);}}</style>' if accent_color else ''
    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title} — Mining Intelligence Atlas</title>
  <meta name="description" content="Documentation of advanced insights from {len(CATEGORIES)} data categories and 125 mining-intelligence sources." />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/styles.css" />
  {accent_css}
</head>
<body>
{topbar(current_id)}
<div class="layout">
{sidebar(current_id)}
<main class="main">
{hero_html}
{content_html}
</main>
</div>
<footer class="footer">
  Mining Intelligence Atlas · Generated <span data-last-modified></span> · {sum(len(c["sources"]) for c in CATEGORIES)} sources across {len(CATEGORIES)} categories · {len(COMBINATIONS)} cross-category combinations
</footer>
<script src="js/main.js"></script>
<script src="js/voice-assistant.js"></script>
</body>
</html>'''
    (OUT_DIR / filename).write_text(html, encoding="utf-8")
    print(f"  ✓ {filename} ({len(html):,} bytes)")

def hex_to_rgb(hex_color):
    h = hex_color.lstrip("#")
    r = int(h[0:2], 16)
    g = int(h[2:4], 16)
    b = int(h[4:6], 16)
    return f"{r},{g},{b}"

# ============ Build home page ============
def build_home():
    total_sources = sum(len(c["sources"]) for c in CATEGORIES)
    hero = f'''<section class="hero">
  <div class="hero__eyebrow">
    <span class="hero__eyebrow-dot"></span>
    Multi-Source Intelligence Documentation · v1.0
  </div>
  <h1 class="hero__title">
    Mining Intelligence<br/>
    <span class="hero__title-accent">Atlas</span>
  </h1>
  <p class="hero__subtitle">
    A full documentation of <strong>{total_sources} data sources</strong> across <strong>{len(CATEGORIES)} categories</strong>, the advanced
    insights each one unlocks, and the cross-category combinations that turn raw data into operational foresight. Every source
    includes its integration path, the analytical questions it can answer, and a worked example of how it transforms when
    layered with two, three, or four complementary feeds.
  </p>
  <div class="hero__stats">
    <div class="hero__stat">
      <div class="hero__stat-value" data-count="{total_sources}">0</div>
      <div class="hero__stat-label">Data Sources</div>
    </div>
    <div class="hero__stat">
      <div class="hero__stat-value" data-count="{len(CATEGORIES)}">0</div>
      <div class="hero__stat-label">Categories</div>
    </div>
    <div class="hero__stat">
      <div class="hero__stat-value" data-count="{len(COMBINATIONS)}">0</div>
      <div class="hero__stat-label">Combinations</div>
    </div>
    <div class="hero__stat">
      <div class="hero__stat-value">{sum(1 for c in CATEGORIES for s in c['sources'] if 'ALREADY' in s['method'].upper())}</div>
      <div class="hero__stat-label">Already Live</div>
    </div>
  </div>
</section>'''

    # Category grid
    cards = ""
    for c in CATEGORIES:
        cards += f'''<a href="{c["id"]}.html" class="category-card" style="--cat-color:{c["color"]}">
  <div class="category-card__icon">{c["icon"]}</div>
  <h3 class="category-card__title">{c["title"]}</h3>
  <p class="category-card__desc">{c["tagline"]}</p>
  <div class="category-card__footer">
    <span><span class="category-card__count">{len(c["sources"])}</span> sources</span>
    <span class="category-card__arrow">→</span>
  </div>
</a>'''

    content = f'''
<section class="section" id="categories">
  <div class="section__header">
    <h2 class="section__title"><span class="section__title-num">01</span>Source Categories</h2>
    <span class="section__meta">{len(CATEGORIES)} categories · {total_sources} sources</span>
  </div>
  <p class="lead">
    The atlas is organised into {len(CATEGORIES)} thematic categories — each one a self-contained layer of mining intelligence.
    Click any card to dive into the per-source insights, advanced analytics, integration snippets, and deep-dive composites
    that combine the category with others.
  </p>
  <div class="category-grid">
    {cards}
  </div>
</section>

<section class="section" id="how-to-read">
  <div class="section__header">
    <h2 class="section__title"><span class="section__title-num">02</span>How to Read This Atlas</h2>
  </div>
  <p class="lead">
    Each category page contains a series of expandable <strong>source cards</strong>. Inside each card you'll find:
  </p>
  <div class="method-grid">
    <div class="method-card">
      <div class="method-card__num">01</div>
      <h3 class="method-card__title">Integration Path</h3>
      <p class="method-card__desc">Step-by-step recipe for adding the source to your stack — whether it's a one-time static bundle, a live API poll, or a server-brokered key exchange.</p>
    </div>
    <div class="method-card">
      <div class="method-card__num">02</div>
      <h3 class="method-card__title">Advanced Insights</h3>
      <p class="method-card__desc">Three to four analytical questions each source can answer on its own — the kind of insight that goes beyond "show me the data" and into "what decision does this enable".</p>
    </div>
    <div class="method-card">
      <div class="method-card__num">03</div>
      <h3 class="method-card__title">Deep-Dive Composite</h3>
      <p class="method-card__desc">A worked example of how the source becomes exponentially more powerful when layered with two or three others — the "1 + 1 = 3" effect that defines real intelligence.</p>
    </div>
    <div class="method-card">
      <div class="method-card__num">04</div>
      <h3 class="method-card__title">Implementation Snippet</h3>
      <p class="method-card__desc">The actual JavaScript file and code pattern used in the live Cesium globe — drop-in reference for engineers building the same stack.</p>
    </div>
  </div>
</section>

<section class="section" id="combinations-preview">
  <div class="section__header">
    <h2 class="section__title"><span class="section__title-num">03</span>Cross-Category Combinations</h2>
    <span class="section__meta"><a href="combinations.html" style="color:var(--accent);text-decoration:none">View all {len(COMBINATIONS)} →</a></span>
  </div>
  <p class="lead">
    The real intelligence lives in the <strong>combinations</strong> — workflows that pull from 4–8 sources across 3–5 categories
    to answer a single operational question. Each combination is illustrated with a flow diagram and a worked real-world example.
  </p>
  <div class="method-grid">'''
    for i, combo in enumerate(COMBINATIONS[:6]):
        content += f'''<a href="combinations.html#combo-{i+1}" class="method-card" style="text-decoration:none;color:inherit">
        <div class="method-card__num">{i+1:02d}</div>
        <h3 class="method-card__title">{esc(combo["title"])}</h3>
        <p class="method-card__desc">{esc(combo["subtitle"])}</p>
      </a>'''
    content += '</div>\n</section>\n'

    # Personas preview section
    # Import personas for the preview
    try:
        from personas_data import PERSONAS, STAGES as PERSONA_STAGES
        # Pick a curated set of 8 representative personas
        preview_ids = [
            "target-gen-geologist", "mine-general-manager", "tailings-engineer",
            "commodities-trader", "equity-research-analyst", "esg-analyst",
            "mining-cadastre-officer", "investigative-reporter"
        ]
        preview_personas = [p for p in PERSONAS if p["id"] in preview_ids]
        # Preserve order
        preview_personas.sort(key=lambda p: preview_ids.index(p["id"]))
        persona_cards = ""
        for p in preview_personas:
            stage_info = next((s for s in PERSONA_STAGES if s[0] == p["stage"]), None)
            stage_short = stage_info[1].split(" & ")[0].split(", ")[0] if stage_info else ""
            persona_cards += f'''<a href="personas.html#{p["id"]}" class="method-card" style="text-decoration:none;color:inherit">
        <div class="method-card__num" style="font-size:18px">{p["icon"]}</div>
        <h3 class="method-card__title">{esc(p["name"])}</h3>
        <p class="method-card__desc">{esc(stage_short)} · {len(p["sources"])} sources · {len(p["inferences"])} inferences</p>
      </a>'''
        content += f'''
<section class="section" id="personas-preview">
  <div class="section__header">
    <h2 class="section__title"><span class="section__title-num">04</span>Persona-Driven Intelligence</h2>
    <span class="section__meta"><a href="personas.html" style="color:var(--accent);text-decoration:none">View all {len(PERSONAS)} →</a></span>
  </div>
  <p class="lead">
    Select from <strong>{len(PERSONAS)} mining value-chain personas</strong> across {len(PERSONA_STAGES)} functional stages —
    each one curated with the source stack, applicable combinations, and persona-specific inferences that role needs.
  </p>
  <div class="method-grid">
    {persona_cards}
  </div>
</section>'''
    except ImportError:
        pass

    page("index.html", "Mining Intelligence Atlas", "index", hero, content)

# ============ Build category page ============
def build_category(cat):
    hero = f'''<section class="hero">
  <div class="hero__eyebrow" style="color:{cat["color"]};border-color:{cat["color"]};background:rgba({hex_to_rgb(cat["color"])},0.14)">
    <span class="hero__eyebrow-dot" style="background:{cat["color"]}"></span>
    {cat["icon"]} {cat["title"]} · {len(cat["sources"])} sources
  </div>
  <h1 class="hero__title">{cat["title"]}</h1>
  <p class="hero__subtitle">{cat["description"]}</p>
  <div class="hero__stats">
    <div class="hero__stat">
      <div class="hero__stat-value" data-count="{len(cat["sources"])}">0</div>
      <div class="hero__stat-label">Sources</div>
    </div>
    <div class="hero__stat">
      <div class="hero__stat-value">{sum(1 for s in cat["sources"] if "Static" in s["method"])}</div>
      <div class="hero__stat-label">Static Bundles</div>
    </div>
    <div class="hero__stat">
      <div class="hero__stat-value">{sum(1 for s in cat["sources"] if "Live" in s["method"] and "ALREADY" not in s["method"].upper())}</div>
      <div class="hero__stat-label">Live APIs</div>
    </div>
    <div class="hero__stat">
      <div class="hero__stat-value">{sum(1 for s in cat["sources"] if "Keyed" in s["method"])}</div>
      <div class="hero__stat-label">Keyed Brokers</div>
    </div>
  </div>
</section>'''

    # Filter bar
    filter_html = '''<div class="filter-bar">
  <button class="chip is-active" data-filter="all">All Sources</button>
  <button class="chip" data-filter="01">01 Static</button>
  <button class="chip" data-filter="02">02 Live</button>
  <button class="chip" data-filter="03">03 Keyed</button>
  <span style="margin-left:auto;display:flex;gap:8px">
    <button class="chip" data-action="expand-all">Expand all</button>
    <button class="chip" data-action="collapse-all">Collapse all</button>
  </span>
</div>'''

    cards = "".join(source_card(i+1, s) for i, s in enumerate(cat["sources"]))

    # Prev / Next
    idx = CATEGORIES.index(cat)
    prev_cat = CATEGORIES[idx - 1] if idx > 0 else None
    next_cat = CATEGORIES[idx + 1] if idx < len(CATEGORIES) - 1 else None
    nav_html = '<div class="page-nav">'
    if prev_cat:
        nav_html += f'<a href="{prev_cat["id"]}.html" class="page-nav__link"><div class="page-nav__label">← Previous</div><div class="page-nav__title">{prev_cat["icon"]} {esc(prev_cat["title"])}</div></a>'
    else:
        nav_html += '<a href="index.html" class="page-nav__link"><div class="page-nav__label">← Back</div><div class="page-nav__title">Atlas Overview</div></a>'
    if next_cat:
        nav_html += f'<a href="{next_cat["id"]}.html" class="page-nav__link page-nav__link--next"><div class="page-nav__label">Next →</div><div class="page-nav__title">{esc(next_cat["title"])} {next_cat["icon"]}</div></a>'
    nav_html += '</div>'

    content = f'''
<section class="section" id="overview">
  <div class="section__header">
    <h2 class="section__title"><span class="section__title-num">§</span>Source Inventory</h2>
    <span class="section__meta">{len(cat["sources"])} sources · click any card to expand</span>
  </div>
  {filter_html}
  {cards}
</section>
{nav_html}'''

    page(f"{cat['id']}.html", cat["title"], cat["id"], hero, content, accent_color=cat["color"])

# ============ Build combinations page ============
def build_combinations():
    hero = '''<section class="hero">
  <div class="hero__eyebrow">
    <span class="hero__eyebrow-dot"></span>
    Cross-Category Insight Combinations · 10 worked examples
  </div>
  <h1 class="hero__title">
    Where the <span class="hero__title-accent">magic</span> happens
  </h1>
  <p class="hero__subtitle">
    Each individual source answers a narrow question. Combine 4–8 sources across 3–5 categories and you start answering
    operational questions no single dataset can touch: which tailings dam will fail next, which commodity will spike
    next quarter, which M&A deal will close, which mining asset is climate-resilient. These are the 10 combinations
    that define modern mining intelligence.
  </p>
</section>'''

    cards = ""
    for i, combo in enumerate(COMBINATIONS):
        flow_nodes = "".join(
            f'<div class="combo-card__flow-node" style="--cat-color:{n["color"]}"><i style="background:{n["color"]}"></i>{esc(n["label"])}</div>'
            f'<span class="combo-card__flow-arrow">→</span>'
            for n in combo["flow"]
        )
        # remove trailing arrow
        if flow_nodes.endswith('<span class="combo-card__flow-arrow">→</span>'):
            flow_nodes = flow_nodes[:-len('<span class="combo-card__flow-arrow">→</span>')]
        src_tags = "".join(f'<span class="tag">{esc(s)}</span>' for s in combo["sources"])

        cards += f'''<article class="combo-card" id="combo-{i+1}">
  <div class="combo-card__num">{i+1:02d}</div>
  <h2 class="combo-card__title">{esc(combo["title"])}</h2>
  <div class="combo-card__subtitle">{esc(combo["subtitle"])}</div>
  <p class="combo-card__desc">{esc(combo["description"])}</p>
  <div class="tag-list">{src_tags}</div>
  <div class="combo-card__flow">{flow_nodes}</div>
  <div class="combo-card__insight">
    <div class="combo-card__insight-title">Real-World Insight</div>
    <div class="combo-card__insight-text">{esc(combo["insight"])}</div>
  </div>
</article>'''

    content = f'''
<section class="section" id="combinations">
  <div class="section__header">
    <h2 class="section__title"><span class="section__title-num">§</span>10 Cross-Category Combinations</h2>
    <span class="section__meta">{len(COMBINATIONS)} worked examples</span>
  </div>
  {cards}
</section>'''

    page("combinations.html", "Combinations", "combinations", hero, content)

# ============ Build methodology page ============
def build_methodology():
    hero = '''<section class="hero">
  <div class="hero__eyebrow">
    <span class="hero__eyebrow-dot"></span>
    Methodology · Integration Patterns · Architecture
  </div>
  <h1 class="hero__title">
    How the <span class="hero__title-accent">atlas</span> is built
  </h1>
  <p class="hero__subtitle">
    Three integration patterns, twelve category layers, one Cesium globe. This page documents the engineering methodology
    behind the atlas: how each source type is wired in, how API keys are brokered, how layers compose, and how to extend
    the atlas with new sources.
  </p>
</section>'''

    # The four integration methods
    methods = [
        ("01", "01 Static", "Bundle a file in local_data/", "Used for CSV/GeoJSON/shapefile datasets that change yearly or slower. Download the source, convert with ogr2ogr to GeoJSON if needed, and bundle as a static asset served alongside the JavaScript bundle. Best for: USGS MRDS, SAMINDABA, ARDF, WDPA, Global Heat Flow. Pros: zero runtime cost, instant load, offline-capable. Cons: stale data between manual refreshes, larger bundle size.", "#f5a623"),
        ("02", "02 Live", "Poll a public API", "Used for free, no-key APIs that update frequently (minutes to days). The browser or server polls the endpoint on a fixed cadence (every 30s to 24h depending on source). Best for: USGS Earthquakes, Open-Meteo, OpenSky, AISStream (via WS), UN Comtrade. Pros: always current, no key management. Cons: rate limits, network dependency, can be slow.", "#4fc3f7"),
        ("03", "03 Keyed", "Broker through server with POWER UP panel", "Used for APIs requiring keys (free or paid). The user supplies keys via a settings panel; keys are stored encrypted and used server-side as a proxy. The browser never sees the key. Best for: Sentinel Hub, Planet Labs, ICEYE, Maxar, Fastmarkets, S&P Global. Pros: protects user keys, enables paid APIs, allows rate-limit management. Cons: requires server infrastructure, adds latency.", "#ab47bc"),
        ("04", "04 AI", "Describe in natural language to a coding agent", "Emerging pattern: the user describes the desired layer in natural language ('show me copper porphyry prospects in Chile'), and an AI agent composes the right combination of layers on the fly. Not yet wired in this build, but the architecture is designed to support it via the layer composition API.", "#66bb6a"),
    ]

    method_cards = ""
    for num, name, pattern, desc, color in methods:
        method_cards += f'''<div class="method-card" style="--cat-color:{color};border-color:rgba({hex_to_rgb(color)},0.3)">
  <div class="method-card__num" style="background:rgba({hex_to_rgb(color)},0.14);color:{color};border-color:{color}">{num}</div>
  <h3 class="method-card__title" style="color:{color}">{name}</h3>
  <p class="method-card__desc"><strong>{pattern}.</strong> {desc}</p>
</div>'''

    content = f'''
<section class="section" id="patterns">
  <div class="section__header">
    <h2 class="section__title"><span class="section__title-num">01</span>Integration Patterns</h2>
    <span class="section__meta">4 patterns · 125 sources mapped</span>
  </div>
  <p class="lead">
    Every source in the atlas uses one of four integration patterns. The pattern determines the engineering approach,
    the operational cost, the freshness of the data, and the security model. Choosing the right pattern for a new
    source is the first architectural decision.
  </p>
  <div class="method-grid">
    {method_cards}
  </div>
</section>

<section class="section" id="architecture">
  <div class="section__header">
    <h2 class="section__title"><span class="section__title-num">02</span>Architecture Overview</h2>
  </div>
  <p class="lead">
    The atlas runs as a single-page Cesium application with a Node.js broker layer for keyed APIs. The browser
    renders the globe and the layer overlays; the broker manages API key encryption, rate-limit enforcement,
    and response caching.
  </p>
  <div class="code-block">
    <div class="code-block__header">
      <span class="code-block__file">📐 System Architecture</span>
      <span class="code-block__lang">Diagram</span>
    </div>
    <pre><code><span class="tok-com">┌──────────────────────────────────────────────────────────────────┐</span>
<span class="tok-com">│  Browser (Cesium Globe)                                          │</span>
<span class="tok-com">│  ├─ mapStackController.js   ← basemap + WMS layers              │</span>
<span class="tok-com">│  ├─ mines.js                ← MRDS, ARDF, SAMINDABA billboards  │</span>
<span class="tok-com">│  ├─ tailings.js             ← ICMM + GTR dam polygons           │</span>
<span class="tok-com">│  ├─ vessels.js              ← AIS WebSocket stream              │</span>
<span class="tok-com">│  ├─ earthquakes.js          ← USGS GeoJSON poll                 │</span>
<span class="tok-com">│  ├─ fires.js                ← NASA FIRMS poll                   │</span>
<span class="tok-com">│  └─ ... {sum(len(c["sources"]) for c in CATEGORIES)} layer files total              │</span>
<span class="tok-com">│                                                                  │</span>
<span class="tok-com">│  keySetup.js → user keys stored in encrypted localStorage       │</span>
<span class="tok-com">└────────────────────────┬─────────────────────────────────────────┘</span>
                         <span class="tok-key">│ fetch /api/&lt;source&gt;/...</span>
                         <span class="tok-key">▼</span>
<span class="tok-com">┌──────────────────────────────────────────────────────────────────┐</span>
<span class="tok-com">│  Node.js Broker (Express)                                       │</span>
<span class="tok-com">│  ├─ Key decryption (per-user vault)                             │</span>
<span class="tok-com">│  ├─ Rate-limit enforcement (per source per user)                │</span>
<span class="tok-com">│  ├─ Response cache (Redis, 5min–24h TTL by source)              │</span>
<span class="tok-com">│  └─ Outbound to: Sentinel Hub, Planet, ICEYE, Maxar, S&P, ...  │</span>
<span class="tok-com">└──────────────────────────────────────────────────────────────────┘</span></code></pre>
  </div>
</section>

<section class="section" id="layer-composition">
  <div class="section__header">
    <h2 class="section__title"><span class="section__title-num">03</span>Layer Composition API</h2>
  </div>
  <p class="lead">
    Every layer in the atlas is wired through the same <code>mapStackController.js</code> registry. Adding a new
    source is a matter of declaring its metadata and providing a load function. The controller handles z-ordering,
    visibility toggles, opacity, and the legend.
  </p>
  <div class="code-block">
    <div class="code-block__header">
      <span class="code-block__file">📄 mapStackController.js — registry entry</span>
      <span class="code-block__lang">JavaScript</span>
    </div>
    <pre><code><span class="tok-com">// Registering a new layer in the atlas</span>
<span class="tok-key">const</span> <span class="tok-var">layerRegistry</span> = &#123;
  <span class="tok-prop">usgsMrds</span>: &#123;
    <span class="tok-prop">id</span>: <span class="tok-str">'usgs-mrds'</span>,
    <span class="tok-prop">title</span>: <span class="tok-str">'USGS MRDS Mines'</span>,
    <span class="tok-prop">category</span>: <span class="tok-str">'mineral-deposits'</span>,
    <span class="tok-prop">method</span>: <span class="tok-str">'01-static'</span>,
    <span class="tok-prop">visible</span>: <span class="tok-num">false</span>,
    <span class="tok-prop">opacity</span>: <span class="tok-num">1.0</span>,
    <span class="tok-prop">loader</span>: <span class="tok-key">async</span> () <span class="tok-key">=&gt;</span> &#123;
      <span class="tok-key">const</span> <span class="tok-var">res</span> = <span class="tok-key">await</span> <span class="tok-fn">fetch</span>(<span class="tok-str">'./data/local_data/mrds/mrds.geojson'</span>);
      <span class="tok-key">const</span> <span class="tok-var">geojson</span> = <span class="tok-key">await</span> <span class="tok-var">res</span>.<span class="tok-fn">json</span>();
      <span class="tok-key">return</span> <span class="tok-key">await</span> Cesium.GeoJsonDataSource.<span class="tok-fn">load</span>(<span class="tok-var">geojson</span>, &#123;
        <span class="tok-prop">markerSize</span>: <span class="tok-num">8</span>,
        <span class="tok-prop">markerColor</span>: Cesium.Color.<span class="tok-fn">fromCssColorString</span>(<span class="tok-str">'#f5a623'</span>)
      &#125;);
    &#125;
  &#125;,

  <span class="tok-prop">sentinelHubWms</span>: &#123;
    <span class="tok-prop">id</span>: <span class="tok-str">'sentinel-hub-true-color'</span>,
    <span class="tok-prop">title</span>: <span class="tok-str">'Sentinel-2 True Color'</span>,
    <span class="tok-prop">category</span>: <span class="tok-str">'earth-observation'</span>,
    <span class="tok-prop">method</span>: <span class="tok-str">'03-keyed'</span>,
    <span class="tok-prop">requiresKey</span>: <span class="tok-str">'sentinel-hub'</span>,
    <span class="tok-prop">loader</span>: () <span class="tok-key">=&gt;</span> <span class="tok-key">new</span> Cesium.<span class="tok-fn">WebMapServiceImageryProvider</span>(&#123;
      <span class="tok-prop">url</span>: <span class="tok-str">'/api/sh/wms'</span>,  <span class="tok-com">// brokered server-side</span>
      <span class="tok-prop">layers</span>: <span class="tok-str">'TRUE_COLOR'</span>,
      <span class="tok-prop">parameters</span>: &#123; <span class="tok-prop">transparent</span>: <span class="tok-key">true</span> &#125;
    &#125;)
  &#125;
&#125;;</code></pre>
  </div>
</section>

<section class="section" id="key-brokering">
  <div class="section__header">
    <h2 class="section__title"><span class="section__title-num">04</span>Key Brokering Pattern</h2>
  </div>
  <p class="lead">
    The 03-Keyed pattern is the most engineering-intensive. The user's API key never leaves their browser in plaintext:
    it's encrypted with a server-derived session key, stored in encrypted localStorage, and only decrypted server-side
    when making the outbound call. The browser receives only the proxied response.
  </p>
  <div class="code-block">
    <div class="code-block__header">
      <span class="code-block__file">📄 server/routes/sh.js — Sentinel Hub broker</span>
      <span class="code-block__lang">JavaScript</span>
    </div>
    <pre><code><span class="tok-key">import</span> express <span class="tok-key">from</span> <span class="tok-str">'express'</span>;
<span class="tok-key">import</span> &#123; decryptUserKey &#125; <span class="tok-key">from</span> <span class="tok-str">'../vault.js'</span>;
<span class="tok-key">import</span> &#123; rateLimit &#125; <span class="tok-key">from</span> <span class="tok-str">'../middleware/rateLimit.js'</span>;
<span class="tok-key">import</span> NodeCache <span class="tok-key">from</span> <span class="tok-str">'node-cache'</span>;

<span class="tok-key">const</span> <span class="tok-var">cache</span> = <span class="tok-key">new</span> <span class="tok-fn">NodeCache</span>(&#123; <span class="tok-prop">stdTTL</span>: <span class="tok-num">300</span> &#125;);  <span class="tok-com">// 5 min cache</span>
<span class="tok-key">const</span> <span class="tok-var">router</span> = <span class="tok-fn">express.Router</span>();

<span class="tok-com">// All /api/sh/* routes require authenticated user + rate limit</span>
<span class="tok-var">router</span>.<span class="tok-fn">use</span>(<span class="tok-fn">rateLimit</span>(&#123; <span class="tok-prop">windowMs</span>: <span class="tok-num">60000</span>, <span class="tok-prop">max</span>: <span class="tok-num">30</span> &#125;));

<span class="tok-var">router</span>.<span class="tok-fn">get</span>(<span class="tok-str">'/wms'</span>, <span class="tok-key">async</span> (req, res) <span class="tok-key">=&gt;</span> &#123;
  <span class="tok-key">const</span> &#123; <span class="tok-prop">bbox</span>, <span class="tok-prop">width</span>, <span class="tok-prop">height</span>, <span class="tok-prop">layers</span>, <span class="tok-prop">time</span> &#125; = <span class="tok-var">req</span>.<span class="tok-prop">query</span>;

  <span class="tok-com">// Cache key includes user + bbox + layer + time window</span>
  <span class="tok-key">const</span> <span class="tok-var">cacheKey</span> = <span class="tok-str">`$&#123;req.user.id&#125;:$&#123;layers&#125;:$&#123;bbox&#125;:$&#123;time&#125;`</span>;
  <span class="tok-key">const</span> <span class="tok-var">cached</span> = <span class="tok-var">cache</span>.<span class="tok-fn">get</span>(<span class="tok-var">cacheKey</span>);
  <span class="tok-key">if</span> (<span class="tok-var">cached</span>) <span class="tok-key">return</span> <span class="tok-var">res</span>.<span class="tok-fn">set</span>(<span class="tok-str">'content-type'</span>, <span class="tok-str">'image/png'</span>).<span class="tok-fn">send</span>(<span class="tok-var">cached</span>);

  <span class="tok-com">// Decrypt user's SH instance ID server-side</span>
  <span class="tok-key">const</span> <span class="tok-var">instanceId</span> = <span class="tok-key">await</span> <span class="tok-fn">decryptUserKey</span>(<span class="tok-var">req</span>.<span class="tok-prop">user</span>.<span class="tok-prop">id</span>, <span class="tok-str">'sentinel-hub'</span>);

  <span class="tok-com">// Forward to Sentinel Hub with user's key</span>
  <span class="tok-key">const</span> <span class="tok-var">upstream</span> = <span class="tok-key">await</span> <span class="tok-fn">fetch</span>(<span class="tok-str">`https://services.sentinel-hub.com/ogc/wms/$&#123;instanceId&#125;`</span>, &#123;
    <span class="tok-prop">method</span>: <span class="tok-str">'POST'</span>,
    <span class="tok-prop">body</span>: <span class="tok-key">new</span> URLSearchParams(&#123; bbox, width, height, layers, time, ... &#125;)
  &#125;);

  <span class="tok-key">const</span> <span class="tok-var">buf</span> = <span class="tok-key">await</span> <span class="tok-var">upstream</span>.<span class="tok-fn">arrayBuffer</span>();
  <span class="tok-var">cache</span>.<span class="tok-fn">set</span>(<span class="tok-var">cacheKey</span>, Buffer.<span class="tok-fn">from</span>(<span class="tok-var">buf</span>));
  <span class="tok-var">res</span>.<span class="tok-fn">set</span>(<span class="tok-str">'content-type'</span>, <span class="tok-str">'image/png'</span>).<span class="tok-fn">send</span>(Buffer.<span class="tok-fn">from</span>(<span class="tok-var">buf</span>));
&#125;);

<span class="tok-key">export</span> <span class="tok-key">default</span> <span class="tok-var">router</span>;</code></pre>
  </div>
</section>

<section class="section" id="extending">
  <div class="section__header">
    <h2 class="section__title"><span class="section__title-num">05</span>Extending the Atlas</h2>
  </div>
  <p class="lead">
    Adding a new source to the atlas follows a fixed 5-step recipe. The pattern is the same whether the source is a
    free public API or a paid commercial feed.
  </p>
  <div class="method-grid">
    <div class="method-card">
      <div class="method-card__num">1</div>
      <h3 class="method-card__title">Classify</h3>
      <p class="method-card__desc">Determine the integration pattern (01 static / 02 live / 03 keyed). Free + no key = 02. Free + key = 03. Slow-changing = 01.</p>
    </div>
    <div class="method-card">
      <div class="method-card__num">2</div>
      <h3 class="method-card__title">Bundle / Wire</h3>
      <p class="method-card__desc">For 01: download and convert. For 02: write the layer file with fetch(). For 03: register the key in keySetup.js and write the server broker route.</p>
    </div>
    <div class="method-card">
      <div class="method-card__num">3</div>
      <h3 class="method-card__title">Register</h3>
      <p class="method-card__desc">Add the layer entry to mapStackController.js with id, title, category, method, and loader function. The legend and toggle UI are auto-generated.</p>
    </div>
    <div class="method-card">
      <div class="method-card__num">4</div>
      <h3 class="method-card__title">Document</h3>
      <p class="method-card__desc">Add the source entry to this atlas with integration path, insights, and a deep-dive composite showing how it combines with others.</p>
    </div>
    <div class="method-card">
      <div class="method-card__num">5</div>
      <h3 class="method-card__title">Verify</h3>
      <p class="method-card__desc">Cross-check the source against 2-3 others in the same category. Discrepancies surface data quality issues worth flagging in the documentation.</p>
    </div>
  </div>
</section>

<section class="section" id="data-quality">
  <div class="section__header">
    <h2 class="section__title"><span class="section__title-num">06</span>Data Quality & Reconciliation</h2>
  </div>
  <p class="lead">
    No single source is authoritative. The atlas is designed for <strong>triangulation</strong> — every operational
    question should be answered by combining 2-3 sources and surfacing discrepancies. The discrepancies themselves
    are intelligence: they reveal under-reporting, over-reporting, smuggling, greenwashing, or analytical disagreement.
  </p>
  <div class="combo-card" style="margin-top: var(--space-lg)">
    <h3 class="combo-card__title" style="font-size:18px">Reconciliation Examples</h3>
    <p class="combo-card__desc" style="font-size:13px;margin-top:8px">
      <strong>Production:</strong> S&P MI vs. USGS Minerals Yearbook — large discrepancies surface undeclared depletion.<br>
      <strong>Trade:</strong> UN Comtrade vs. AIS vessel tracks — gaps surface off-book shipments (sanction evasion).<br>
      <strong>Reserves:</strong> EDGAR 10-K vs. USGS MCS country totals — discrepancies surface reporting errors.<br>
      <strong>ESG:</strong> MSCI vs. Sustainalytics — rating divergence surfaces methodology-gaming candidates.<br>
      <strong>Tailings:</strong> ICMM vs. GTR — duplicates removed by dam-name + lat/lon clustering.<br>
      <strong>Ownership:</strong> OpenCorporates vs. SEDAR+ filings — gaps surface offshore beneficial ownership.<br>
      <strong>Cost curves:</strong> MineSpans vs. CRU vs. WoodMac — high variance = analyst-disagreement hotspots.<br>
      <strong>Water:</strong> SASB withdrawal vs. USGS streamflow — flat withdrawal during drought = disclosure red flag.
    </p>
  </div>
</section>'''

    page("methodology.html", "Methodology", "methodology", hero, content)


# ============ Build all ============
if __name__ == "__main__":
    print("Building Mining Intelligence Atlas…")
    build_home()
    for cat in CATEGORIES:
        build_category(cat)
    build_combinations()
    build_methodology()
    print(f"\n✓ Done. {15} pages generated in {OUT_DIR}")
