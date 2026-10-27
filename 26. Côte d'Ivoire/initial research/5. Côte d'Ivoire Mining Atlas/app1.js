/* Core: state, helpers, router, shell, first pages */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const store = {
  get(k, d) { try { const v = localStorage.getItem("cim_" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem("cim_" + k, JSON.stringify(v)); } catch (e) {} }
};
const S = { units: store.get("units", "koz"), watch: new Set(store.get("watch", [])), q: "", theme: store.get("theme", "system") };
const PAGES = {};
const NAV = [
  ["Intelligence", [["overview", "Overview"], ["mines", "Mines & projects"], ["map", "Map"], ["pipeline", "Pipeline"], ["minerals", "Minerals"], ["players", "Players"]]],
  ["Regime", [["regulation", "Regulation"], ["fiscal", "Fiscal calculator"], ["regional", "Regional comparison"]]],
  ["Outlook", [["scenarios", "2030 scenarios"], ["risks", "Risk register"], ["watch", "Next 12 months"], ["sources", "Sources & open items"]]]
];
const ids = NAV.flatMap(g => g[1].map(p => p[0]));
const fmt = n => Number(n).toLocaleString("en-US", { maximumFractionDigits: 1 });
const kozToView = k => S.units === "koz" ? fmt(k) + " koz" : fmt(k * OZ / 1000) + " t";
const stageClass = s => ({ Producing: "good", "Ramp-up": "good", Development: "warn", "Restart pending": "warn", Study: "warn", Transition: "warn", Planned: "warn", Exploration: "" }[s] || "");
const metalClass = m => m === "Gold" ? "gold" : "";
function toast(msg) { const t = document.createElement("div"); t.className = "toast"; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 1800); }
function toggleWatch(id) {
  if (S.watch.has(id)) S.watch.delete(id); else S.watch.add(id);
  store.set("watch", [...S.watch]); renderNav(); route(true);
}
function applyTheme() {
  const r = document.documentElement;
  if (S.theme === "system") r.removeAttribute("data-theme"); else r.setAttribute("data-theme", S.theme);
}
function barChart(rows, { w = 520, h = 220, unit = "", color = "var(--chart1)", max } = {}) {
  const m = { l: 44, r: 12, t: 14, b: 28 }, iw = w - m.l - m.r, ih = h - m.t - m.b;
  const top = max || Math.ceil(Math.max(...rows.map(r => r.v)) / 10) * 10;
  const bw = iw / rows.length;
  let g = "";
  for (let i = 0; i <= 4; i++) {
    const v = top * i / 4, y = m.t + ih - ih * i / 4;
    g += `<line x1="${m.l}" x2="${w - m.r}" y1="${y}" y2="${y}" stroke="var(--line)"/><text x="${m.l - 6}" y="${y + 4}" text-anchor="end">${fmt(v)}</text>`;
  }
  rows.forEach((r, i) => {
    const bh = ih * r.v / top, x = m.l + i * bw + bw * .2, y = m.t + ih - bh;
    g += `<rect x="${x}" y="${y}" width="${bw * .6}" height="${bh}" rx="2" fill="${r.color || color}"><title>${r.l}: ${fmt(r.v)}${unit}</title></rect>
      <text x="${x + bw * .3}" y="${y - 4}" text-anchor="middle">${fmt(r.v)}</text><text x="${x + bw * .3}" y="${h - 8}" text-anchor="middle">${r.l}</text>`;
  });
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Bar chart">${g}</svg>`;
}

/* ---------- shell ---------- */
function renderNav() {
  const cur = location.hash.slice(1) || "overview";
  $("#nav").innerHTML = NAV.map(([g, items]) => `<div class="grp">${g}</div>` + items.map(([id, t]) =>
    `<a href="#${id}" ${cur === id ? 'aria-current="page"' : ""}><span>${t}</span>${id === "mines" && S.watch.size ? `<span class="badge">★${S.watch.size}</span>` : ""}</a>`).join("")).join("");
}
function route(keep) {
  let id = location.hash.slice(1) || "overview"; if (!ids.includes(id)) id = "overview";
  const p = PAGES[id]; if (!p) return;
  const sc = $(".main").scrollTop;
  $("#view").innerHTML = `<div><h1>${p.title}</h1><p class="lede">${p.lede}</p></div>` + p.render();
  if (p.after) p.after();
  renderNav(); $(".rail").classList.remove("open");
  document.title = "Côte d'Ivoire Mining Atlas";
  $(".main").scrollTop = keep === true ? sc : 0;
}
function drawer(html) {
  closeDrawer();
  const d = document.createElement("aside"); d.className = "drawer"; d.id = "drawer"; d.setAttribute("aria-label", "Detail");
  d.innerHTML = `<button class="btn" id="dclose" style="align-self:flex-end">Close</button>` + html;
  document.body.appendChild(d); $("#dclose").onclick = closeDrawer; $("#dclose").focus();
}
function closeDrawer() { const d = $("#drawer"); if (d) d.remove(); }
document.addEventListener("keydown", e => { if (e.key === "Escape") closeDrawer(); });
function mineDetail(id) {
  const m = MINES.find(x => x.id === id); if (!m) return;
  drawer(`<h2>${m.name}</h2><div class="chips"><span class="pill ${metalClass(m.metal)}">${m.metal}</span><span class="pill ${stageClass(m.stage)}">${m.stage}</span><span class="pill">${m.region}</span></div>
  <dl><dt>Operator</dt><dd>${m.owner}</dd><dt>Ownership</dt><dd>${m.stakes}</dd><dt>Output</dt><dd>${m.out}</dd><dt>Outlook</dt><dd>${m.guide}</dd><dt>Tax holiday</dt><dd>${m.holiday}</dd><dt>Notes</dt><dd>${m.note || "None in the source note."}</dd></dl>
  <p class="note">Coordinates on the map are approximate.</p>
  <button class="btn primary" id="dw">${S.watch.has(id) ? "Remove from watchlist" : "Add to watchlist"}</button>`);
  $("#dw").onclick = () => { toggleWatch(id); closeDrawer(); toast(S.watch.has(id) ? "Added to watchlist" : "Removed from watchlist"); };
}

/* ---------- pages ---------- */
PAGES.overview = {
  title: "Côte d'Ivoire mining at a glance",
  lede: "Gold leads, manganese and nickel follow. Read the four numbers first, then open a page from the left menu.",
  render() {
    const gold = MINES.filter(m => m.metal === "Gold" && m.stage === "Producing").length;
    return `<div class="grid">
      <div class="panel kpi"><b>59.33 t</b><span>Gold output, 2025</span><em>62 t expected 2026 · 63 t gov't</em></div>
      <div class="panel kpi"><b>14</b><span>Gold mines operating</span><em>Sources say 9, 13 or 14 · ${gold} listed here</em></div>
      <div class="panel kpi"><b>100 t</b><span>National gold target</span><em>Within a decade</em></div>
      <div class="panel kpi"><b>~600 t</b><span>Estimated gold potential</span><em>35% of West Africa's greenstone belts</em></div></div>
    <div class="grid two"><div class="panel"><h2>Gold output, tonnes</h2>${barChart(OUTPUT_HIST.map(o => ({ l: o.y + (o.y > 2025 ? "*" : ""), v: o.t, color: o.y > 2025 ? "var(--chart2)" : "var(--chart1)" })), { unit: " t" })}
      <p class="note">* Government projections. 2026 is 62 t in one source, 63 t in another.</p></div>
    <div class="panel"><h2>Key takeaways</h2><ul style="margin:0;padding-left:18px;display:grid;gap:8px">
      <li><b>Growth runway.</b> Koné (2026–27), Séguéla and Lafigué expansions, Assafou (2028) make 65 t plausible. 100 t looks like a stretch.</li>
      <li><b>Fiscal squeeze.</b> Higher royalties, expiring tax holidays and a Code revision raise the state take.</li>
      <li><b>Domestication.</b> Tongon sold to an Ivorian group. SODEMI stakes, SIMEP and local content rules.</li>
      <li><b>Slow diversification.</b> Manganese established, nickel emerging.</li>
      <li><b>Risks.</b> Stability clauses proved partial. Artisanal mining persists.</li></ul></div></div>
    <div class="panel"><h2>Coming up</h2><ul class="tl">${WATCH.slice(0, 4).map(w => `<li><time>${w.when}</time><span>${w.what}</span><span class="pill">${w.tag}</span></li>`).join("")}</ul></div>`;
  }
};

let mf = { metal: "All", stage: "All", region: "All", sort: "name", dir: 1, watch: false };
PAGES.mines = {
  title: "Mines & projects",
  lede: "Every operating mine and project in the note. Select a row for ownership and notes, star the ones you track.",
  render() {
    const opt = (k, arr) => `<option>All</option>` + [...new Set(arr)].sort().map(v => `<option ${mf[k] === v ? "selected" : ""}>${v}</option>`).join("");
    return `<div class="filters">
      <label>Metal<select id="f-metal">${opt("metal", MINES.map(m => m.metal))}</select></label>
      <label>Stage<select id="f-stage">${opt("stage", MINES.map(m => m.stage))}</select></label>
      <label>Region<select id="f-region">${opt("region", MINES.map(m => m.region))}</select></label>
      <button class="btn" id="f-watch" aria-pressed="${mf.watch}">★ Watchlist only</button>
      <button class="btn" id="f-units" aria-pressed="false">Units: ${S.units === "koz" ? "koz" : "tonnes"}</button></div>
    <div class="tablewrap"><table><thead><tr><th></th>
      ${[["name", "Mine"], ["metal", "Metal"], ["owner", "Operator"], ["stage", "Stage"], ["region", "Region"]].map(([k, t]) => `<th data-sort="${k}">${t}${mf.sort === k ? (mf.dir > 0 ? " ▲" : " ▼") : ""}</th>`).join("")}
      <th class="num">Latest output</th></tr></thead><tbody id="mrows"></tbody></table></div><p class="note" id="mcount"></p>`;
  },
  after() {
    const draw = () => {
      let rows = MINES.filter(m => (mf.metal === "All" || m.metal === mf.metal) && (mf.stage === "All" || m.stage === mf.stage) && (mf.region === "All" || m.region === mf.region) && (!mf.watch || S.watch.has(m.id)) &&
        (!S.q || (m.name + m.owner + m.metal + m.region + m.note).toLowerCase().includes(S.q)));
      rows.sort((a, b) => String(a[mf.sort]).localeCompare(String(b[mf.sort])) * mf.dir);
      $("#mrows").innerHTML = rows.map(m => `<tr class="click" data-id="${m.id}"><td><button class="star ${S.watch.has(m.id) ? "on" : ""}" data-star="${m.id}" aria-label="Toggle watchlist for ${m.name}">★</button></td>
        <td><b>${m.name}</b></td><td><span class="pill ${metalClass(m.metal)}">${m.metal}</span></td><td>${m.owner}</td><td><span class="pill ${stageClass(m.stage)}">${m.stage}</span></td><td>${m.region}</td>
        <td class="num">${m.koz ? kozToView(m.koz) : m.out}</td></tr>`).join("") || `<tr><td colspan="7">No mines match these filters.</td></tr>`;
      $("#mcount").textContent = rows.length + " of " + MINES.length + " sites";
      $$("#mrows tr.click").forEach(tr => tr.onclick = e => { const s = e.target.closest("[data-star]"); if (s) { toggleWatch(s.dataset.star); return; } mineDetail(tr.dataset.id); });
    };
    draw();
    const bind = (id, k) => $(id).onchange = e => { mf[k] = e.target.value; draw(); };
    bind("#f-metal", "metal"); bind("#f-stage", "stage"); bind("#f-region", "region");
    $("#f-watch").onclick = e => { mf.watch = !mf.watch; e.target.setAttribute("aria-pressed", mf.watch); draw(); };
    $("#f-units").onclick = () => { S.units = S.units === "koz" ? "t" : "koz"; store.set("units", S.units); route(true); };
    $$("th[data-sort]").forEach(th => th.onclick = () => { const k = th.dataset.sort; mf.dir = mf.sort === k ? -mf.dir : 1; mf.sort = k; route(true); });
    PAGES.mines.redraw = draw;
  }
};

PAGES.map = {
  title: "Map of mines and projects",
  lede: "A schematic map. Positions are approximate and the outline is simplified. Use the metal filter, then select a dot.",
  render() {
    const metals = ["All", ...new Set(MINES.map(m => m.metal))];
    return `<div class="chips" id="mapchips">${metals.map(m => `<button class="btn" aria-pressed="${(window._mm || "All") === m}" data-m="${m}">${m}</button>`).join("")}</div>
    <div class="panel"><svg id="mapsvg" class="chart" viewBox="0 0 560 520" role="img" aria-label="Schematic map of Côte d'Ivoire mines"></svg>
    <div class="legend"><span><i style="background:var(--chart2)"></i>Gold</span><span><i style="background:var(--chart1)"></i>Manganese</span><span><i style="background:var(--chart3)"></i>Nickel</span><span><i style="background:var(--chart4)"></i>Bauxite</span></div></div>`;
  },
  after() {
    const X = lon => 30 + (lon + 8.7) / 6.3 * 500, Y = lat => 20 + (10.8 - lat) / 6.5 * 470;
    const col = { Gold: "var(--chart2)", Manganese: "var(--chart1)", Nickel: "var(--chart3)", Bauxite: "var(--chart4)" };
    const draw = () => {
      const f = window._mm || "All";
      $("#mapsvg").innerHTML = `<polygon points="${COUNTRY.map(p => X(p[0]) + "," + Y(p[1])).join(" ")}" fill="var(--surface2)" stroke="var(--line)" stroke-width="2"/>` +
        MINES.filter(m => f === "All" || m.metal === f).map(m => `<g class="mp" data-id="${m.id}" tabindex="0" role="button" aria-label="${m.name}" style="cursor:pointer">
        <circle cx="${X(m.lon)}" cy="${Y(m.lat)}" r="${m.stage === "Producing" ? 8 : 6}" fill="${col[m.metal]}" fill-opacity="${m.stage === "Producing" || m.stage === "Ramp-up" ? 1 : .45}" stroke="var(--fg)" stroke-width="${S.watch.has(m.id) ? 2.5 : 1}"/>
        <text x="${X(m.lon) + 11}" y="${Y(m.lat) + 4}">${m.name.split(" ")[0]}</text></g>`).join("");
      $$(".mp").forEach(g => { g.onclick = () => mineDetail(g.dataset.id); g.onkeydown = e => { if (e.key === "Enter") mineDetail(g.dataset.id); }; });
    };
    draw();
    $$("#mapchips button").forEach(b => b.onclick = () => { window._mm = b.dataset.m; $$("#mapchips button").forEach(x => x.setAttribute("aria-pressed", x === b)); draw(); });
  }
};

PAGES.pipeline = {
  title: "Project pipeline",
  lede: "What adds volume and when. Capex and funding are not in the source note and show as n/d. The bar shows relative maturity, an analyst estimate.",
  render() {
    return `<div class="tablewrap"><table><thead><tr><th>Project</th><th>Company</th><th>Stage</th><th>First production</th><th>Maturity</th><th>Capex</th><th>Funding</th></tr></thead><tbody>
    ${PROJECTS.map(p => `<tr><td><b>${p.name}</b><div class="note">${p.note}</div></td><td>${p.co}</td><td><span class="pill ${stageClass(p.stage)}">${p.stage}</span></td><td>${p.first}</td>
    <td style="min-width:110px"><div class="bar" role="img" aria-label="${p.pct}% maturity"><i style="width:${p.pct}%"></i></div></td><td>${p.capex}</td><td>${p.funding}</td></tr>`).join("")}</tbody></table></div>`;
  }
};
