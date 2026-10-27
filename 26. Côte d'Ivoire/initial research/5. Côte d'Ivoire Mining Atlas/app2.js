/* Remaining pages and boot */
PAGES.minerals = {
  title: "Minerals",
  lede: "Estimated potential and development status by commodity. Potential figures are government and industry estimates.",
  render() {
    return `<div class="grid two">${MINERALS.map(m => `<div class="panel"><div style="display:flex;justify-content:space-between;gap:8px;align-items:baseline"><h2>${m.name}</h2><span class="pill ${m.name === "Gold" ? "gold" : ""}">${m.status}</span></div>
    <p class="kpi" style="margin:8px 0"><b style="font-size:1.3rem">${m.potential}</b><span>Estimated potential</span></p><p style="margin:0">${m.detail}</p></div>`).join("")}</div>
    <div class="panel"><h2>Manganese vs nickel</h2><p style="margin:0">The note calls manganese the second pillar by established output. A 2026 report calls nickel the second most exploited metal. Both can hold, by volume and value respectively, but the note does not give figures to settle it. Listed as an open item.</p></div>`;
  }
};

let pf = { type: "All" };
PAGES.players = {
  title: "Key players",
  lede: "Operators, developers and state bodies. Filter by role or use the search box above.",
  render() {
    const types = ["All", ...new Set(PLAYERS.map(p => p.type))];
    return `<div class="chips" id="ptypes">${types.map(t => `<button class="btn" aria-pressed="${pf.type === t}" data-t="${t}">${t}</button>`).join("")}</div>
    <div class="tablewrap"><table><thead><tr><th>Company</th><th>Role</th><th>Assets</th><th>Notes</th></tr></thead><tbody id="prows"></tbody></table></div>`;
  },
  after() {
    const draw = () => { $("#prows").innerHTML = PLAYERS.filter(p => (pf.type === "All" || p.type === pf.type) && (!S.q || JSON.stringify(p).toLowerCase().includes(S.q)))
      .map(p => `<tr><td><b>${p.name}</b></td><td><span class="pill">${p.type}</span></td><td>${p.assets}</td><td>${p.note}</td></tr>`).join("") || `<tr><td colspan="4">No players match.</td></tr>`; };
    draw(); PAGES.players.redraw = draw;
    $$("#ptypes button").forEach(b => b.onclick = () => { pf.type = b.dataset.t; $$("#ptypes button").forEach(x => x.setAttribute("aria-pressed", x === b)); draw(); });
  }
};

PAGES.regulation = {
  title: "Regulation",
  lede: "The 2014 Mining Code is still the working framework. A revision is expected. Have counsel verify before relying on any term here.",
  render() {
    return `<div class="grid two"><div class="panel"><h2>Legal framework</h2><ul style="margin:0;padding-left:18px;display:grid;gap:6px">${LAWS.map(l => `<li>${l}</li>`).join("")}</ul></div>
    <div class="panel"><h2>Institutions and process</h2><p style="margin:0 0 8px">The Council of Ministers grants and withdraws mining titles: four exploration permits on 22 July 2026 and three on 5 August 2026. An e-cadastre portal has digitalised title management since September 2025.</p>
    ${barChart(PERMITS.map(p => ({ l: String(p.y), v: p.grants })), { h: 170, unit: " grants", max: 200 })}<p class="note">Permits granted per year. Applications: 189 (2023), 203 (2024), 225 (2025).</p></div></div>
    <h2>Title regime</h2><div class="tablewrap"><table><thead><tr><th>Title</th><th>Duration</th><th>Key conditions</th><th>Basis</th></tr></thead><tbody>${TITLES.map(t => `<tr><td><b>${t.t}</b></td><td>${t.d}</td><td>${t.r}</td><td>${t.src}</td></tr>`).join("")}</tbody></table></div>
    <h2>Fiscal terms</h2><div class="grid two">${FISCAL.map(f => `<div class="panel"><h3>${f.k}</h3><p style="margin:6px 0 0">${f.v}</p></div>`).join("")}</div>
    <div class="grid two"><div class="panel"><h2>Revision of the Code</h2><p style="margin:0">Announced July 2024 to raise state profits. A draft was planned for the Government Secretariat General in November 2025. No evidence of enactment was found. Expect a larger state share, local content rules and possibly local processing requirements.</p></div>
    <div class="panel"><h2>Policy direction</h2><ul style="margin:0;padding-left:18px;display:grid;gap:6px"><li><b>PIRME 2026-2040:</b> local processing and industrial upgrading.</li><li><b>Local content:</b> 94% of employees Ivorian by 2019. Gaps in supply and subcontracting.</li><li><b>SIMEP:</b> semi-industrial mines, gold buying office and a refinery of about 100 t/yr in Abidjan.</li><li><b>ASM:</b> 100 local technical committees set up 2014-2024.</li></ul></div></div>`;
  }
};

PAGES.fiscal = {
  title: "Fiscal calculator",
  lede: "Estimate how a year of gold sales splits between the company and the State. A simplified model with editable assumptions. Not tax advice.",
  render() {
    const f = (id, label, v, step = 1, min = 0) => `<label>${label}<input type="number" id="${id}" value="${v}" step="${step}" min="${min}"></label>`;
    return `<div class="grid two"><div class="panel"><h2>Assumptions</h2><div class="filters" style="align-items:stretch">
      ${f("c-koz", "Gold sold (koz)", 200)}${f("c-price", "Gold price ($/oz), example", 3000, 50)}${f("c-aisc", "All-in cost ($/oz), example", 1500, 50)}
      ${f("c-roy", "Royalty % (3 to 6)", 5, .5, 3)}${f("c-adv", "Extra ad valorem pts (2025 law)", 2, .5)}${f("c-cit", "Corporate tax % (assumption)", 25, 1)}
      ${f("c-carry", "State free carry %", 10, 1)}
      <label>Tax holiday<select id="c-hol"><option value="0">Expired</option><option value="1">Active</option></select></label></div>
      <p class="note">The 3 to 6% sliding royalty and 2-point increase come from the note. The tax rate, price and cost are examples. Set them yourself.</p></div>
    <div class="panel"><h2>Result, $ million</h2><div id="c-out"></div></div></div>`;
  },
  after() {
    const calc = () => {
      const g = id => parseFloat($("#" + id).value) || 0;
      const rev = g("c-koz") * 1000 * g("c-price") / 1e6, cost = g("c-koz") * 1000 * g("c-aisc") / 1e6;
      const roy = rev * (g("c-roy") + g("c-adv")) / 100, base = Math.max(0, rev - cost - roy);
      const cit = $("#c-hol").value === "1" ? 0 : base * g("c-cit") / 100, net = base - cit, carry = net * g("c-carry") / 100;
      const state = roy + cit + carry, co = net - carry;
      const rows = [["Revenue", rev], ["Operating costs", -cost], ["Royalty + ad valorem", -roy], ["Corporate tax", -cit], ["State free carry share", -carry], ["Company cash flow", co]];
      const sh = (v, c) => `<div style="margin-top:12px"><div style="display:flex;justify-content:space-between"><span>${c}</span><b class="num">${fmt(v)}</b></div></div>`;
      $("#c-out").innerHTML = `<table style="min-width:0"><tbody>${rows.map(r => `<tr><td>${r[0]}</td><td class="num">${fmt(r[1])}</td></tr>`).join("")}</tbody></table>
      <div class="kpi" style="margin-top:14px"><b>${rev ? fmt(state / rev * 100) : 0}%</b><span>State take as a share of revenue ($${fmt(state)} M)</span></div>
      <div class="bar" style="margin-top:8px" role="img" aria-label="State share"><i style="width:${rev ? Math.min(100, state / (state + co) * 100) : 0}%;background:var(--gold)"></i></div>
      <p class="note">${rev ? fmt(state / Math.max(1, state + co) * 100) : 0}% of value after costs goes to the State.</p>`;
    };
    $$(".panel input, #c-hol").forEach(i => i.oninput = calc); calc();
  }
};

PAGES.regional = {
  title: "Regional comparison",
  lede: "How Côte d'Ivoire compares with its neighbours. Cells marked n/d were not in the source note.",
  render() {
    return `<div class="tablewrap"><table><thead><tr><th>Country</th><th>Gold output</th><th>Royalty / terms</th><th>State carry</th><th>Export / refining</th><th>Security</th></tr></thead><tbody>
    ${REGION.map(r => `<tr><td><b>${r.c}</b></td><td>${r.out}</td><td>${r.roy}</td><td>${r.carry}</td><td>${r.exp}</td><td>${r.sec}</td></tr>`).join("")}</tbody></table></div>
    <div class="grid two"><div class="panel"><h2>What it means</h2><p style="margin:0">Mali's convention dispute and Burkina Faso's tighter terms push investors toward Côte d'Ivoire. GlobalData expects it to become West Africa's third-largest gold producer in 2026, ahead of Mali. That depends on Mali's forecast 28% rebound, so it is fragile.</p></div>
    <div class="panel"><h2>Scale gap with Ghana</h2><p style="margin:0">Ghana's formal artisanal purchases alone reached up to 54 t in H1 2026. The gap is mostly small-scale formalisation, not industrial output. Côte d'Ivoire and Ghana monitor pollution of the Bia and Tanoé rivers together.</p></div></div>`;
  }
};

PAGES.scenarios = {
  title: "2030 gold scenarios",
  lede: "Can the pipeline reach 100 t? Pick a preset or move the sliders. Values are analyst assumptions built from the note, not forecasts.",
  render() {
    const sl = (id, label, min, max, step, v) => `<label>${label}<output id="o-${id}">${v}</output><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${v}"></label>`;
    return `<div class="grid two"><div class="panel"><h2>Assumptions</h2><div class="chips" id="presets" style="margin-bottom:12px"><button class="btn" data-p="down">Downside</button><button class="btn" data-p="base" aria-pressed="true">Base</button><button class="btn" data-p="up">Upside</button></div>
      <div class="sliders">${sl("s-base", "2026 output (t)", 55, 70, .5, 62)}${sl("s-dep", "Annual decline in existing mines (%)", 0, 8, .5, 3)}${sl("s-kone", "Koné full rate (t/yr)", 0, 10, .1, 6.9)}${sl("s-assa", "Assafou by 2030 (t/yr)", 0, 10, .5, 4)}${sl("s-seg", "Séguéla expansion (t/yr)", 0, 6, .1, 1.7)}${sl("s-new", "Other new projects by 2030 (t/yr)", 0, 30, 1, 3)}</div>
      <p class="note">Koné: 223 koz/yr is about 6.9 t. Assafou, Séguéla and other values are not sized in the note.</p></div>
    <div class="panel"><h2>Output path, tonnes</h2><div id="sc-chart"></div><div class="kpi"><b id="sc-res">-</b><span id="sc-gap"></span></div></div></div>`;
  },
  after() {
    const P = { down: [58, 5, 5, 2, 0, 0], base: [62, 3, 6.9, 4, 1.7, 3], up: [64, 2, 7.5, 6, 3, 8] };
    const ids = ["s-base", "s-dep", "s-kone", "s-assa", "s-seg", "s-new"];
    const ramp = { kone: { 2026: .05, 2027: .6, 2028: 1, 2029: 1, 2030: 1 }, assa: { 2026: 0, 2027: 0, 2028: .1, 2029: .6, 2030: 1 }, seg: { 2026: 0, 2027: .33, 2028: .66, 2029: 1, 2030: 1 }, nw: { 2026: 0, 2027: 0, 2028: .3, 2029: .65, 2030: 1 } };
    const run = () => {
      const v = ids.map(i => parseFloat($("#" + i).value)); ids.forEach((i, k) => $("#o-" + i.slice(2) === "#o-" ? "" : "#o-" + i).textContent = v[k]);
      const pts = [2026, 2027, 2028, 2029, 2030].map(y => ({ y, t: v[0] * Math.pow(1 - v[1] / 100, y - 2026) + v[2] * ramp.kone[y] + v[3] * ramp.assa[y] + v[4] * ramp.seg[y] + v[5] * ramp.nw[y] }));
      const w = 520, h = 240, m = { l: 40, r: 16, t: 16, b: 28 }, X = i => m.l + i * (w - m.l - m.r) / 4, Y = t => m.t + (h - m.t - m.b) * (1 - (t - 40) / 70);
      let g = [40, 60, 80, 100].map(t => `<line x1="${m.l}" x2="${w - m.r}" y1="${Y(t)}" y2="${Y(t)}" stroke="var(--line)"/><text x="${m.l - 6}" y="${Y(t) + 4}" text-anchor="end">${t}</text>`).join("");
      g += `<line x1="${m.l}" x2="${w - m.r}" y1="${Y(100)}" y2="${Y(100)}" stroke="var(--bad)" stroke-dasharray="5 4"/><text x="${w - m.r}" y="${Y(100) - 5}" text-anchor="end">100 t target</text>`;
      g += `<polyline fill="none" stroke="var(--chart1)" stroke-width="3" points="${pts.map((p, i) => X(i) + "," + Y(p.t)).join(" ")}"/>` +
        pts.map((p, i) => `<circle cx="${X(i)}" cy="${Y(p.t)}" r="4" fill="var(--chart1)"><title>${p.y}: ${fmt(p.t)} t</title></circle><text x="${X(i)}" y="${h - 8}" text-anchor="middle">${p.y}</text><text x="${X(i)}" y="${Y(p.t) - 9}" text-anchor="middle">${fmt(p.t)}</text>`).join("");
      $("#sc-chart").innerHTML = `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Projected output 2026 to 2030">${g}</svg>`;
      const e = pts[4].t; $("#sc-res").textContent = fmt(e) + " t in 2030"; $("#sc-gap").textContent = e >= 100 ? "Reaches the 100 t target" : fmt(100 - e) + " t short of the 100 t target";
    };
    ids.forEach(i => $("#" + i).oninput = () => { $$("#presets button").forEach(b => b.removeAttribute("aria-pressed")); run(); });
    $$("#presets button").forEach(b => b.onclick = () => { P[b.dataset.p].forEach((x, k) => $("#" + ids[k]).value = x); $$("#presets button").forEach(x => x.setAttribute("aria-pressed", x === b)); run(); });
    run();
  }
};

let rk = { cat: "All" };
PAGES.risks = {
  title: "Risk register",
  lede: "Ten risks scored on likelihood and impact (1 to 5). Scores are an analyst view built on the note. Select a number in the grid for detail.",
  render() {
    const cats = ["All", ...new Set(RISKS.map(r => r.cat))];
    let heat = `<div class="heat"><div class="ax"></div>${[1, 2, 3, 4, 5].map(l => `<div class="ax">L${l}</div>`).join("")}`;
    for (let i = 5; i >= 1; i--) { heat += `<div class="ax">I${i}</div>`; for (let l = 1; l <= 5; l++) { const sc = i * l; heat += `<div style="background:color-mix(in srgb, var(${sc >= 15 ? "--bad" : sc >= 8 ? "--warn" : "--good"}) 22%, var(--surface2))">${RISKS.map((r, k) => r.l === l && r.i === i && (rk.cat === "All" || r.cat === rk.cat) ? `<button class="dot" data-k="${k}" aria-label="${r.n}">${k + 1}</button>` : "").join("")}</div>`; } }
    heat += "</div>";
    return `<div class="chips" id="rcats">${cats.map(c => `<button class="btn" aria-pressed="${rk.cat === c}" data-c="${c}">${c}</button>`).join("")}</div>
    <div class="grid two"><div class="panel"><h2>Heat map</h2>${heat}</div>
    <div class="tablewrap"><table style="min-width:0"><thead><tr><th>#</th><th>Risk</th><th class="num">Score</th></tr></thead><tbody>${RISKS.map((r, k) => ({ r, k })).filter(x => rk.cat === "All" || x.r.cat === rk.cat).sort((a, b) => b.r.l * b.r.i - a.r.l * a.r.i).map(({ r, k }) => `<tr class="click" data-k="${k}"><td>${k + 1}</td><td><b>${r.n}</b><div class="note">${r.cat}</div></td><td class="num"><span class="pill ${r.l * r.i >= 15 ? "bad" : r.l * r.i >= 8 ? "warn" : "good"}">${r.l * r.i}</span></td></tr>`).join("")}</tbody></table></div></div>`;
  },
  after() {
    const show = k => { const r = RISKS[k]; drawer(`<h2>${r.n}</h2><div class="chips"><span class="pill">${r.cat}</span><span class="pill">Likelihood ${r.l}</span><span class="pill">Impact ${r.i}</span></div><p>${r.d}</p>`); };
    $$("[data-k]").forEach(e => e.onclick = () => show(+e.dataset.k));
    $$("#rcats button").forEach(b => b.onclick = () => { rk.cat = b.dataset.c; route(true); });
  }
};

PAGES.watch = {
  title: "Next 12 months",
  lede: "Dated events that move the picture, plus the sites on your watchlist.",
  render() {
    const w = MINES.filter(m => S.watch.has(m.id));
    return `<div class="panel"><h2>Calendar</h2><ul class="tl">${WATCH.map(x => `<li><time>${x.when}</time><span>${x.what}</span><span class="pill">${x.tag}</span></li>`).join("")}</ul></div>
    <div class="panel"><h2>Your watchlist</h2>${w.length ? `<ul class="tl">${w.map(m => `<li><time>${m.region}</time><span><b>${m.name}</b> · ${m.owner}<div class="note">${m.out}</div></span><button class="btn" data-open="${m.id}">Open</button></li>`).join("")}</ul>` : `<p class="note" style="margin:0">Nothing starred yet. Open Mines &amp; projects and select a star. Your list stays in this browser.</p>`}</div>`;
  },
  after() { $$("[data-open]").forEach(b => b.onclick = () => mineDetail(b.dataset.open)); }
};

PAGES.sources = {
  title: "Sources & open items",
  lede: "Where the numbers come from and what still needs checking before you rely on them.",
  render() {
    return `<div class="grid two"><div class="panel"><h2>Open items</h2><ul style="margin:0;padding-left:18px;display:grid;gap:8px">${OPEN_ITEMS.map(o => `<li>${o}</li>`).join("")}</ul></div>
    <div class="panel"><h2>Sources</h2><ul style="margin:0;padding-left:18px;display:grid;gap:6px">${SOURCES.map(s => `<li><a href="${s[1]}" target="_blank" rel="noopener">${s[0]}</a></li>`).join("")}</ul>
    <p class="note">Units: 1 troy ounce = 31.1035 g. 1 koz = 1,000 oz = 0.0311 t. Several figures are ministry projections or trade press, not audited data.</p></div></div>`;
  }
};

/* ---------- boot ---------- */
applyTheme(); renderNav();
$("#theme").onclick = () => { S.theme = S.theme === "system" ? "dark" : S.theme === "dark" ? "light" : "system"; store.set("theme", S.theme); applyTheme(); $("#theme").textContent = "Theme: " + S.theme; };
$("#theme").textContent = "Theme: " + S.theme;
$("#menu").onclick = () => $(".rail").classList.toggle("open");
$("#q").oninput = e => {
  S.q = e.target.value.trim().toLowerCase();
  const cur = location.hash.slice(1) || "overview";
  if (cur === "players") PAGES.players.redraw && PAGES.players.redraw();
  else if (cur === "mines") PAGES.mines.redraw && PAGES.mines.redraw();
  else if (S.q) location.hash = "#mines";
};
window.addEventListener("hashchange", () => { closeDrawer(); route(); });
route();
