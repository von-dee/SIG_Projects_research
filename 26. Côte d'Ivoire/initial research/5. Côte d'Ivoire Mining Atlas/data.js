/* Data layer. Figures come from the 21 Oct 2026 sector note. "n/d" = not disclosed in the note. */
const OZ = 31.1035; // grams per troy ounce

const MINES = [
  { id:"ity", name:"Ity", metal:"Gold", owner:"Endeavour Mining", region:"West", stage:"Producing", lat:6.8, lon:-8.1,
    stakes:"Endeavour 85% · State 10% · SODEMI 5%", out:"319 koz (2025)", koz:319, guide:"285–330 koz (2026 guidance)",
    note:"Largest-producer group, more than 25% of national output (Endeavour, all mines).", holiday:"n/d" },
  { id:"lafigue", name:"Lafigué", metal:"Gold", owner:"Endeavour Mining", region:"North", stage:"Producing", lat:8.4, lon:-4.4,
    stakes:"Endeavour majority · State + SODEMI (split n/d)", out:"n/d", koz:null, guide:"170–195 koz (2026 guidance)",
    note:"Dabakala area. SODEMI holds a minority stake.", holiday:"n/d" },
  { id:"youare", name:"Yaouré", metal:"Gold", owner:"Perseus Mining", region:"Centre", stage:"Producing", lat:6.9, lon:-5.7,
    stakes:"Perseus (state stake n/d)", out:"239,637 oz (2024)", koz:239.6, guide:"n/d",
    note:"Moving into underground mining. Higher royalties now apply.", holiday:"Expired 31 Dec 2025" },
  { id:"sissingue", name:"Sissingué", metal:"Gold", owner:"Perseus Mining", region:"North", stage:"Producing", lat:10.2, lon:-5.9,
    stakes:"Perseus (state stake n/d)", out:"69,406 oz (2024)", koz:69.4, guide:"n/d",
    note:"Perseus paid about $20M of additional royalties, including earlier periods.", holiday:"n/d" },
  { id:"bonikro", name:"Bonikro", metal:"Gold", owner:"Allied Gold", region:"Centre", stage:"Producing", lat:6.6, lon:-5.3,
    stakes:"Allied Gold (state stake n/d)", out:"n/d", koz:null, guide:"n/d",
    note:"Mine life extended to 2036, seven years past the earlier 2029 closure date.", holiday:"n/d" },
  { id:"agbaou", name:"Agbaou", metal:"Gold", owner:"Allied Gold", region:"Centre", stage:"Producing", lat:6.45, lon:-5.5,
    stakes:"Allied Gold (state stake n/d)", out:"n/d", koz:null, guide:"n/d", note:"", holiday:"n/d" },
  { id:"seguela", name:"Séguéla", metal:"Gold", owner:"Fortuna Mining (Sango)", region:"North", stage:"Producing", lat:7.96, lon:-6.67,
    stakes:"Fortuna (state stake n/d)", out:"about 2.6 t (H1 2026)", koz:null, guide:"Expansion study: over 200 koz/yr",
    note:"Acquired via Roxgold Sango.", holiday:"n/d" },
  { id:"tongon", name:"Tongon", metal:"Gold", owner:"Atlantic Group (Ivorian)", region:"North", stage:"Producing", lat:9.9, lon:-5.9,
    stakes:"Atlantic Group (state stake n/d)", out:"n/d", koz:null, guide:"n/d",
    note:"Bought from Barrick, completed Dec 2025: up to $305M ($192M cash, $113M contingent on gold price and resource conversion).", holiday:"n/d" },
  { id:"kone", name:"Koné", metal:"Gold", owner:"Montage Gold", region:"North", stage:"Ramp-up", lat:9.5, lon:-6.0,
    stakes:"Montage 90% · State 10%", out:"First gold 26 Sep 2026 (about 1,140 oz)", koz:null, guide:"223 koz/yr average over 16 years (2024 study)",
    note:"Oxide circuit commercial production Q4 2026. Hard-rock circuit Q2 2027.", holiday:"n/d" },
  { id:"assafou", name:"Assafou (Tanda-Iguela)", metal:"Gold", owner:"Endeavour Mining", region:"East", stage:"Development", lat:7.8, lon:-3.2,
    stakes:"Endeavour (stakes n/d)", out:"First gold H2 2028", koz:null, guide:"n/d", note:"Near the Ghana border.", holiday:"n/d" },
  { id:"mn-bond", name:"Bondoukou", metal:"Manganese", owner:"Taurian group", region:"East", stage:"Producing", lat:8.0, lon:-2.8,
    stakes:"n/d", out:"Declining ore grade", koz:null, guide:"Ministry: 1.14 Mt (2025), 1.25 Mt (2026), national", note:"Output fell 12% nationally in 2024.", holiday:"n/d" },
  { id:"mn-lag", name:"Lagnonkaha", metal:"Manganese", owner:"Shiloh Manganèse", region:"North", stage:"Producing", lat:9.7, lon:-5.2,
    stakes:"n/d", out:"Declining ore grade", koz:null, guide:"n/d", note:"Grade decline at Shiloh cut 2024 output.", holiday:"n/d" },
  { id:"mn-guit", name:"Guitry (Lauzoua-Mokta)", metal:"Manganese", owner:"Compagnie Minière du Littoral", region:"South", stage:"Producing", lat:5.5, lon:-5.2,
    stakes:"n/d", out:"n/d", koz:null, guide:"n/d", note:"", holiday:"n/d" },
  { id:"mn-kan", name:"Kaniasso", metal:"Manganese", owner:"n/d", region:"North-west", stage:"Producing", lat:9.85, lon:-7.55,
    stakes:"n/d", out:"n/d", koz:null, guide:"n/d", note:"One of four mines operating at end-2024.", holiday:"n/d" },
  { id:"mn-odi", name:"Odienné (IMMSA)", metal:"Manganese", owner:"Ivoire Manganèse Mines SA", region:"North-west", stage:"Restart pending", lat:9.5, lon:-7.57,
    stakes:"n/d", out:"Not producing", koz:null, guide:"n/d", note:"The national recovery depends on this restart.", holiday:"n/d" },
  { id:"ni-foung", name:"Foungouesso / Moyango", metal:"Nickel", owner:"Compagnie Minière du Bafing", region:"West", stage:"Producing", lat:7.7, lon:-7.6,
    stakes:"n/d", out:"Open pit, Biankouma-Touba area", koz:null, guide:"n/d", note:"Polynickel backed. Nickel is now described as the second most exploited metal (2026 report).", holiday:"n/d" },
  { id:"ni-sip", name:"Sipilou", metal:"Nickel", owner:"NOCI / IC Nickel", region:"West", stage:"Development", lat:7.5, lon:-8.0,
    stakes:"n/d", out:"Production due from 2026 (unconfirmed)", koz:null, guide:"n/d", note:"Nickel-cobalt. Timing unconfirmed.", holiday:"n/d" },
  { id:"ni-sam", name:"Samapleu", metal:"Nickel", owner:"Sama Resources (with SODEMI)", region:"West", stage:"Development", lat:7.2, lon:-7.9,
    stakes:"n/d", out:"n/d", koz:null, guide:"n/d", note:"Nickel-copper project.", holiday:"n/d" },
  { id:"bx-bong", name:"Bongouanou", metal:"Bauxite", owner:"Lagune Exploitation Bongouanou", region:"East", stage:"Producing", lat:6.65, lon:-4.2,
    stakes:"n/d", out:"Exported to China", koz:null, guide:"n/d", note:"The Bénéné deposit is estimated at 35 Mt of ore (Moronou).", holiday:"n/d" },
  { id:"au-afema", name:"Afema", metal:"Gold", owner:"n/d", region:"South-east", stage:"Exploration", lat:5.9, lon:-3.0,
    stakes:"n/d", out:"n/d", koz:null, guide:"n/d", note:"Near the Ghana border.", holiday:"n/d" },
  { id:"au-did", name:"Didievi", metal:"Gold", owner:"Montage Gold", region:"Centre", stage:"Exploration", lat:7.1, lon:-4.9,
    stakes:"n/d", out:"n/d", koz:null, guide:"n/d", note:"Montage's next project after Koné.", holiday:"n/d" }
];

const PROJECTS = [
  { name:"Koné", co:"Montage Gold", stage:"Ramp-up", first:"Gold poured 26 Sep 2026", note:"Oxide commercial Q4 2026, hard rock Q2 2027", capex:"n/d", funding:"n/d", pct:80 },
  { name:"Assafou", co:"Endeavour Mining", stage:"Development", first:"H2 2028", note:"First gold expected", capex:"n/d", funding:"n/d", pct:35 },
  { name:"Séguéla expansion", co:"Fortuna Mining", stage:"Study", first:"n/d", note:"Could support over 200 koz/yr", capex:"n/d", funding:"n/d", pct:15 },
  { name:"Yaouré underground", co:"Perseus Mining", stage:"Transition", first:"In progress", note:"Open pit to underground", capex:"n/d", funding:"n/d", pct:50 },
  { name:"Sipilou nickel-cobalt", co:"NOCI / IC Nickel", stage:"Development", first:"2026 (unconfirmed)", note:"Timing needs checking", capex:"n/d", funding:"n/d", pct:40 },
  { name:"Samapleu", co:"Sama Resources", stage:"Development", first:"n/d", note:"Nickel-copper, SODEMI partner", capex:"n/d", funding:"n/d", pct:20 },
  { name:"Odienné manganese restart", co:"IMMSA", stage:"Restart pending", first:"n/d", note:"Key to the 1.25 Mt 2026 target", capex:"n/d", funding:"n/d", pct:25 },
  { name:"Abidjan gold refinery", co:"SIMEP (State 10%, SODEMI 39%) with StoneX", stage:"Planned", first:"After H1 2027", note:"About 100 t/yr capacity", capex:"n/d", funding:"n/d", pct:30 },
  { name:"Didievi", co:"Montage Gold", stage:"Exploration", first:"n/d", note:"Next project after Koné", capex:"n/d", funding:"n/d", pct:5 }
];

const MINERALS = [
  { name:"Gold", status:"Dominant", potential:"About 600 t", detail:"Output 23.54 t (2015), 59.33 t (2025), 62 t expected 2026 (government projection 63 t, 65 t in 2027). 14 industrial mines in operation by the ministry's count. Target 100 t/yr within a decade." },
  { name:"Manganese", status:"Established", potential:"12 Mt", detail:"8th in world output in 2024 (1.8% of global). Four mines at end-2024. Peak 1.33 Mt in 2020, down 12% in 2024. Ministry: 1.14 Mt in 2025, 1.25 Mt in 2026." },
  { name:"Nickel", status:"Emerging", potential:"260 Mt (laterite)", detail:"Foungouesso and Moyango open pits (Biankouma-Touba). Sipilou nickel-cobalt due from 2026 (unconfirmed). Samapleu nickel-copper is in development." },
  { name:"Bauxite", status:"Small producer", potential:"Bénéné: 35 Mt ore", detail:"Lagune Exploitation Bongouanou exports to China." },
  { name:"Iron ore", status:"Undeveloped", potential:"About 4,000 Mt (west)", detail:"Large infrastructure and capital needs." },
  { name:"Diamonds", status:"Artisanal only", potential:"11 M carats", detail:"Ban lifted in 2014. Kimberley Process compliant." },
  { name:"Critical minerals", status:"Exploration", potential:"Unquantified", detail:"Copper, lithium, coltan, cobalt, some rare earths. Permits for lithium, nickel, cobalt and rare earths granted from 2024, more lithium and rare earths in Jan 2025." }
];

const PLAYERS = [
  { name:"Endeavour Mining", type:"Gold producer", assets:"Ity, Lafigué, Assafou", note:"UK/LSE. More than 25% of national output." },
  { name:"Perseus Mining", type:"Gold producer", assets:"Yaouré, Sissingué", note:"ASX/TSX. 309,043 oz in 2024." },
  { name:"Allied Gold", type:"Gold producer", assets:"Bonikro, Agbaou", note:"Reported Zijin takeover needs verification." },
  { name:"Fortuna Mining", type:"Gold producer", assets:"Séguéla (via Roxgold Sango)", note:"Roxgold is part of Fortuna, not a separate operator." },
  { name:"Atlantic Group", type:"Gold producer", assets:"Tongon", note:"Ivorian private group. Bought from Barrick for up to $305M." },
  { name:"Montage Gold", type:"Gold developer", assets:"Koné (90%), Didievi", note:"TSX. State holds 10% of Koné." },
  { name:"Barrick / Avesoro", type:"Explorer", assets:"Exploration permits (Aug 2026)", note:"Barrick sold Tongon but kept exploration interests." },
  { name:"Compagnie Minière du Littoral", type:"Manganese", assets:"Lauzoua-Mokta", note:"" },
  { name:"Taurian group", type:"Manganese", assets:"Bondoukou", note:"" },
  { name:"Shiloh Manganèse", type:"Manganese", assets:"Lagnonkaha", note:"" },
  { name:"Ivoire Manganèse Mines SA", type:"Manganese", assets:"Odienné", note:"Restart pending." },
  { name:"Compagnie Minière du Bafing", type:"Nickel", assets:"Foungouesso, Moyango, Sipilou North licence (sister company)", note:"Polynickel." },
  { name:"NOCI / IC Nickel", type:"Nickel", assets:"Sipilou", note:"" },
  { name:"Sama Resources", type:"Nickel", assets:"Samapleu", note:"Partner: SODEMI." },
  { name:"Lagune Exploitation Bongouanou", type:"Bauxite", assets:"Bongouanou", note:"" },
  { name:"SODEMI", type:"State", assets:"Minority stakes across mines", note:"State mining company." },
  { name:"SIMEP", type:"State", assets:"Semi-industrial mines, gold buying office, refinery", note:"State 10%, SODEMI 39%." },
  { name:"GPMCI", type:"Industry body", assets:"", note:"Mining industry association." }
];

const TITLES = [
  { t:"Exploration permit", d:"4 years", r:"Applicant must be incorporated in Côte d'Ivoire.", src:"2014 Code" },
  { t:"Exploitation permit", d:"n/d", r:"State may require a local partner. In practice a 10% free carry, with SODEMI often adding 5 to 10%.", src:"2014 Code" },
  { t:"Mining convention", d:"Per project", r:"Negotiated for each major project. Endeavour expects a 10% free carry.", src:"2014 Code" },
  { t:"Small-scale, semi-mechanised, quarry", d:"n/d", r:"Limits and fees not in the note. Counsel to verify.", src:"Open item" }
];

const FISCAL = [
  { k:"Gold royalty", v:"Sliding 3% to 6% of sales, plus a profit share tied to the State's stake" },
  { k:"2025 Finance Law", v:"Ad valorem tax on gold raised by 2 percentage points. Tax annex disapplies Code Art. 164 (fiscal stability) for these revisions." },
  { k:"Corporate tax holiday", v:"Five years from first commercial production under the 2014 Code. Yaouré's ended 31 Dec 2025." },
  { k:"State free carry", v:"10% non-contributing interest, plus SODEMI 5% to 10% in some mines" }
];

const LAWS = [
  "Mining Code, Law 2014-138 of 24 March 2014, decree 2014-97 of 25 June 2014",
  "UEMOA Community Mining Code (Regulation 02/2023/CM/UEMOA)",
  "Environment Code (1996), Water Code (1998), Rural Land Code (1998), Forestry Code (2014)",
  "Investment Code (2018), customs code, Kimberley Process certificate rules"
];

const PERMITS = [ // applications vs grants
  { y:2023, apps:225-36, grants:151 }, { y:2024, apps:203, grants:160 }, { y:2025, apps:225, grants:171 }
];
PERMITS[0].apps = 189;

const OUTPUT_HIST = [ { y:2015, t:23.54 }, { y:2025, t:59.33 }, { y:2026, t:62 }, { y:2027, t:65 } ];

const REGION = [
  { c:"Côte d'Ivoire", out:"59.33 t (2025). Africa's 7th largest in 2024.", roy:"3% to 6% sliding, +2 pts ad valorem (2025)", carry:"10% free carry", exp:"No raw gold export ban. Refinery planned.", sec:"Comparatively stable. Northern border watched." },
  { c:"Ghana", out:"187 t (2025). Africa's largest.", roy:"n/d", carry:"n/d", exp:"Formal ASM purchases up to 54 t in H1 2026", sec:"n/d" },
  { c:"Mali", out:"n/d. 2025 disruption, forecast 28% rebound.", roy:"n/d", carry:"n/d", exp:"Building refineries", sec:"Convention dispute. Sahel insecurity." },
  { c:"Burkina Faso", out:"n/d", roy:"Terms tightened", carry:"n/d", exp:"n/d", sec:"Sahel insecurity" },
  { c:"Guinea", out:"n/d", roy:"n/d", carry:"n/d", exp:"Raw gold export ban from June 2026, local refining required", sec:"n/d" }
];

const RISKS = [
  { n:"Fiscal stability not guaranteed", cat:"Fiscal", l:5, i:4, d:"2025 royalty rise overrode Code Art. 164. Holidays expiring." },
  { n:"Mining Code revision", cat:"Regulatory", l:4, i:4, d:"Draft was due at the Government Secretariat Nov 2025. Status unconfirmed. Expect larger state share and local content." },
  { n:"Northern border spillover", cat:"Security", l:3, i:4, d:"Burkina Faso and Mali border. Affects Tongon, Koné, Sissingué." },
  { n:"Illegal and artisanal mining", cat:"Social", l:5, i:3, d:"Persistent. Pollution of Bia and Tanoé rivers." },
  { n:"Manganese grade decline", cat:"Operational", l:4, i:3, d:"Shiloh and Bondoukou grades falling. Odienné restart pending." },
  { n:"100 t target shortfall", cat:"Strategic", l:4, i:3, d:"Needs more large projects than the current pipeline." },
  { n:"Land and community disputes", cat:"Social", l:3, i:3, d:"Resettlement and subcontracting expectations at larger projects." },
  { n:"Power, roads and port logistics", cat:"Infrastructure", l:3, i:3, d:"Reagents, fuel and ore movement to ports." },
  { n:"Gold price exposure", cat:"Market", l:3, i:4, d:"Drives state revenue and the Tongon contingent payments." },
  { n:"Policy continuity after the 2025 election", cat:"Political", l:2, i:3, d:"Analyst view, no source in the note." }
];

const WATCH = [
  { when:"Q4 2026", what:"Koné oxide circuit commercial production", tag:"Project" },
  { when:"H1 2027", what:"Mining Code revision: confirm draft status", tag:"Regulatory" },
  { when:"Q2 2027", what:"Koné hard-rock circuit", tag:"Project" },
  { when:"After H1 2027", what:"Abidjan refinery start (about 100 t/yr)", tag:"Policy" },
  { when:"2026-27", what:"Odienné manganese restart", tag:"Project" },
  { when:"2027", what:"Government output projection of 65 t", tag:"Output" },
  { when:"H2 2028", what:"Assafou first gold", tag:"Project" }
];

const OPEN_ITEMS = [
  "Output for 2026: ministry says 62 t in one source and 63 t in another. Label by source before use.",
  "Mine count: 9, 13 and 14 all appear. The map and table list every site in this app.",
  "Mining's share of GDP: 3.4% in 2022 (incl. oil and gas). The 6% by 2025 target is unconfirmed.",
  "Whether a new Mining Code has been enacted.",
  "Allied Gold ownership, including the reported Zijin takeover.",
  "Sipilou production timing.",
  "Exact State and SODEMI stakes at Lafigué and other mines.",
  "Reserves, all-in sustaining costs, capex and title fees. None are in the note.",
  "Doropo (AngloGold Ashanti) and Afema (Turaco Gold) are missing from the source note."
];

const SOURCES = [
  ["Mining Weekly, gold output 2026","https://www.miningweekly.com/article/gold-output-in-cte-divoire-set-to-climb-in-2026-as-mines-expand-2026-06-11"],
  ["Ecofin, Perseus Yaouré underground","https://www.ecofinagency.com/news-industry/2608-58362-cote-divoire-perseus-enters-yaoures-underground-era-with-its-tax-holiday-gone-and-royalties-higher"],
  ["Mining Weekly, Barrick Tongon sale","https://www.miningweekly.com/article/barrick-completes-sale-of-tongon-mine-for-up-to-305m-2025-12-02"],
  ["Mining Weekly, Montage first gold","https://www.miningweekly.com/article/montage-pours-first-gold-at-cte-divoire-mine-ahead-of-schedule-2026-09-28"],
  ["Mining Weekly, code revision (2024)","https://www.miningweekly.com/article/cte-divoire-to-revise-mining-code-to-increase-state-profits-2024-07-02"],
  ["Fasken, Mining Code 2014","https://www.fasken.com/en/knowledge/2014/03/miningbulletin-20140318"],
  ["Ecofin, Ghana vs Côte d'Ivoire","https://www.ecofinagency.com/news-industry/1507-57423-ghana-s-formal-artisanal-gold-sector-could-produce-twice-cote-d-ivoire-s-2026-gold-output"],
  ["Ecofin, Guinea raw gold export ban","https://www.ecofinagency.com/news-industry/2206-56669-guinea-bans-raw-gold-exports-mandates-local-refining-before-shipment"],
  ["Capmad, SIMEP launch","https://www.capmad.com/post/mamadou-sangafowa-coulibaly-launches-simep-to-anchor-ivorian-gold-in-the-global-value-chain"],
  ["Economie ivoirienne, mining overview","https://economie-ivoirienne.ci/activites-sectorielles/vue-densemble-du-secteur-mine.html"],
  ["USGS, Côte d'Ivoire","https://www.usgs.gov/centers/national-minerals-information-center/cote-divoire"]
];

const COUNTRY = [[-7.5,4.35],[-4.5,5.2],[-3.1,5.1],[-2.5,6.2],[-3.0,7.5],[-2.7,9.0],[-3.0,10.6],[-5.5,10.4],[-6.2,10.5],[-7.5,10.4],[-8.6,10.2],[-8.3,9.5],[-8.0,8.5],[-8.5,7.6],[-8.5,6.9],[-7.5,6.1]];
