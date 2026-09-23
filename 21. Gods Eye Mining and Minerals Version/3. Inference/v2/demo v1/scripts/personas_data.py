"""
Mining Intelligence Atlas — Persona Data
60 mining sector value-chain personas. Each persona includes:
  - decisions they make
  - KPIs they track
  - recommended sources (by name from the 125-source atlas)
  - applicable combinations (from the 10 cross-category combinations)
  - persona-specific inferences (each tied to the source combination that produces it)
"""

# Value chain stages
STAGES = [
    ("exploration",       "Exploration & Geology",            "🔍"),
    ("mining-ops",        "Mining Operations",                 "⛏️"),
    ("processing",        "Processing & Metallurgy",           "⚗️"),
    ("geotechnical",      "Geotechnical, Tailings & Water",    "🏗️"),
    ("hse",               "Health, Safety & Environment",     "🌱"),
    ("logistics",         "Logistics & Supply Chain",          "🚢"),
    ("commercial",        "Commercial, Trading & Markets",     "💹"),
    ("finance",           "Finance & Investment",              "💰"),
    ("esg",               "ESG & Sustainability",              "🌍"),
    ("government",        "Government & Regulation",           "🏛️"),
    ("risk",              "Insurance & Risk",                  "⚠️"),
    ("research",          "Academic & Research",               "📚"),
    ("media",             "Media & Journalism",                "📰"),
]

PERSONAS = [
    # ─── EXPLORATION ───────────────────────────────────────────
    {
        "id": "target-gen-geologist",
        "name": "Target Generation Geologist",
        "stage": "exploration",
        "icon": "🎯",
        "summary": "Generates grassroots exploration targets by combining regional geology, geophysics, and geochemistry at province scale. The first link in the discovery chain.",
        "decisions": [
            "Which 1° cells to prioritise for staking",
            "Which geophysical surveys to commission next",
            "Whether to walk away from a sub-economic belt",
            "How to allocate the annual exploration budget across commodities"
        ],
        "kpis": ["Targets per $M spent", "Prospectivity score per cell", "Conversion rate target → drill"],
        "sources": ["OneGeology", "EMAG2 v3", "BGI WGM", "Macrostrat", "EarthChem", "Global Heat Flow", "USGS NGMDB", "USGS SIP", "ASTER (NASA Earthdata)", "Mindat.org"],
        "combinations": ["Exploration Targeting for Blind Porphyry Cu"],
        "inferences": [
            ("Free 3-source porphyry Cu prospectivity map", "EMAG2 magnetics + BGI gravity + OneGeology bedrock", "Surfaces deep-crustal boundaries controlling deposit localisation — technique that historically predicted Olympic Dam IOCG."),
            ("LCT-pegmatite fertility ranking", "EarthChem granite geochemistry + Macrostrat stratigraphy + Global Heat Flow", "Compute per-1° cell fertility index: count samples with K/Rb < 100 and Rb > 400 ppm. Surfaces top 1% of Sn-prospective intrusions globally."),
            ("Metallogenic epoch dating", "USGS NGMDB geochronology + OneGeology bedrock + Mindat occurrences", "Age-histogram of dated intrusions reveals metallogenic epochs (e.g. Laramide 74–58 Ma in Arizona) without needing commercial data."),
            ("Blind intrusion detection", "EMAG2 magnetic anomalies + BGI gravity + ASTER SWIR alteration", "Magnetics + gravity reveal intrusion location beneath cover; ASTER confirms surface alteration halo — surfaces blind porphyry targets invisible in outcrop.")
        ]
    },
    {
        "id": "exploration-manager",
        "name": "Exploration Manager",
        "stage": "exploration",
        "icon": "🧭",
        "summary": "Runs multi-project exploration portfolios. Decides where to drill, when to walk away, and how to communicate LOM potential to the board.",
        "decisions": [
            "Phase-2 drill program go/no-go",
            "Project abandonment vs. continuation",
            "Joint-venture vs. sole-funding",
            "Annual budget reallocation across projects"
        ],
        "kpis": ["Discovery cost per ounce", "Resources added per $M", "Project IRR at PEA stage"],
        "sources": ["USGS MRDS", "ARDF (Alaska)", "NRCan Geoscience", "CGS (South Africa)", "GS Namibia", "SEGEMAR", "SGU (Sweden)", "NI 43-101 Registry", "Mindat.org", "EarthChem"],
        "combinations": ["Exploration Targeting for Blind Porphyry Cu"],
        "inferences": [
            ("Brownfield-density kernel", "USGS MRDS past-producer density + NI 43-101 filings", "High past-producer density with low active production signals rejuvenation opportunities — the cheapest discovery strategy."),
            ("Cross-border metallogenic comparison", "ARDF (Alaska) + NRCan MINCAN + Mindat localities", "Benchmark Alaska orogenic Au density against similar terrains in Yukon — surfaces trans-border continuity of greenstone belts."),
            ("Cu/As pathfinder z-score", "SGU till geochemistry + SGU bedrock WMS + ARDF occurrences", "Compute per-cell Cu/As z-score across the Skellefte field — surfaces VMS targets at the same thresholds that work in Namibia."),
            ("Puna Li salar viability", "SEGEMAR evaporite polygons + Sentinel-2 indices", "Difference between mapped evaporite area and remotely-sensed brine extent = proxy for brine saturation, an economic-viability filter invisible in static maps.")
        ]
    },
    {
        "id": "geochemist",
        "name": "Geochemist",
        "stage": "exploration",
        "icon": "🧪",
        "summary": "Designs and interprets geochemical surveys — lithogeochemistry, till, stream-sediment, soil-gas. Turns ppm numbers into deposit vectors.",
        "decisions": [
            "Which pathfinder elements to add to the assay suite",
            "Anomaly threshold for follow-up drilling",
            "Whether to commission isotopic analysis",
            "Sample spacing for regional vs. detailed surveys"
        ],
        "kpis": ["Anomaly contrast ratio", "Pathfinder signal-to-noise", "False-positive rate"],
        "sources": ["EarthChem", "Mindat.org", "SGU (Sweden)", "GeoIndex (BGS)", "Macrostrat", "USGS SIP"],
        "combinations": ["Exploration Targeting for Blind Porphyry Cu"],
        "inferences": [
            ("Lithogeochemical province mapping", "EarthChem 30M+ whole-rock analyses + Macrostrat stratigraphy", "Query by bbox and element to map fertility provinces at any scale — surfaces cryptic terrane boundaries bedrock maps miss."),
            ("Mineral-vector fingerprinting", "Mindat 1M+ localities + co-occurrence network analysis", "5,700-dim sparse vector of confirmed species per locality — cluster to discover mineralogical provinces that don't correspond to named metallogenic belts."),
            ("Till-geochem VMS screening", "SGU till Cu/As ratio + SGU airborne magnetic WMS", "Cu/As z-score across the Skellefte field — same thresholds work in Namibian Damara Belt, validating cross-continental transfer."),
            ("Borehole text-mining", "GeoIndex 1M+ borehole logs + NLP on lithology descriptions", "Extract hydrocarbon shows, mineralization mentions, and geotechnical RQD values from free-text logs — a free text-mining-derived geotechnical & mineral inventory of the UK subsurface.")
        ]
    },
    {
        "id": "geophysicist",
        "name": "Geophysicist",
        "stage": "exploration",
        "icon": "🧲",
        "summary": "Acquires and interprets magnetic, gravity, EM, radiometric, and seismic data. Maps the third dimension from the air and on the ground.",
        "decisions": [
            "Survey type (airborne mag vs. ground IP vs. marine seismic)",
            "Line spacing for regional vs. detailed surveys",
            "Inversion vs. forward modelling approach",
            "Anomaly prioritisation for drill testing"
        ],
        "kpis": ["Anomaly resolution", "Depth-of-investigation", "Interpretation confidence"],
        "sources": ["EMAG2 v3", "BGI WGM", "USGS SIP", "Geoscience Australia", "EarthScope (IRIS)", "Global Heat Flow"],
        "combinations": ["Exploration Targeting for Blind Porphyry Cu"],
        "inferences": [
            ("Basement-structure interpretation", "EMAG2 magnetics + BGI gravity + OneGeology bedrock", "Boundaries between gravity-magnetic domains correspond to crustal sutures — surfaces deep structural controls on mineralisation."),
            ("Passive-seismic exploration potential", "EarthScope IRIS station density + USGS earthquake catalog", "Mines near dense seismic networks can leverage public waveform data for hydrothermal-fluid monitoring — free geophysics."),
            ("High-F heat-producing granite mapping", "Global Heat Flow + BGI gravity + ASTER K-Th-U", "Heat-flow > 75 mW/m² + gravity low + mapped A-type granite = prime Sn-U-F prospectivity — flagged Rössing district before any occurrence data."),
            ("Concealed IOCG potential", "Geoscience Australia TMI + SEEBASE basement depth + MINEDEX occurrences", "TMI over SEEBASE basement depth has historically predicted the Olympic Dam IOCG pattern — now flags analogous settings under the Officer Basin.")
        ]
    },
    {
        "id": "remote-sensing-specialist",
        "name": "Remote Sensing Specialist",
        "stage": "exploration",
        "icon": "🛰️",
        "summary": "Uses satellite and airborne imagery for alteration mapping, structural interpretation, and exploration target screening.",
        "decisions": [
            "Which ASTER vs. Landsat vs. Sentinel-2 band ratios to apply",
            "Whether to commission hyperspectral vs. multispectral",
            "Anomaly threshold for follow-up",
            "Cloud-cover strategy for tropical regions"
        ],
        "kpis": ["Alteration mapping accuracy", "Cloud-free image availability", "Spectral resolution"],
        "sources": ["NASA Earthdata", "Sentinel Hub", "USGS EarthExplorer", "Maxar", "OpenAerialMap", "Copernicus Data Hub"],
        "combinations": ["Exploration Targeting for Blind Porphyry Cu", "Artisanal & Illegal Mining Detection"],
        "inferences": [
            ("ASTER alteration-favorability raster", "NASA Earthdata ASTER SWIR + SEGEMAR bedrock WMS + EarthChem fertility", "8 of the last 10 major Cu-Mo discoveries in the Andean belt — a free tool that commercial hyperspectral surveys would cost $50M to replicate."),
            ("WorldView-3 facility-scale mineral mapping", "Maxar SWIR bands + mapped known porphyry Cu deposits", "Phyllic vs. potassic alteration zones at meter scale — usually reserved for airborne hyperspectral surveys costing 100× more."),
            ("Post-disaster UAV rapid capture", "OpenAerialMap + USGS earthquake feed + NASA FIRMS", "Disaster-trigger pipeline: any mine within 50 km of M>5 earthquake gets 14-day UAV monitoring — only free source for sub-meter post-failure imagery."),
            ("Cloud-piercing SAR alteration", "Copernicus Data Hub Sentinel-1 + Sentinel-2 fusion", "5 m SAR + 10 m optical gives 2.5-day all-weather cadence — critical during tropical wet seasons when optical is cloud-blind.")
        ]
    },
    {
        "id": "drilling-engineer",
        "name": "Drilling Engineer",
        "stage": "exploration",
        "icon": "🔩",
        "summary": "Plans and executes drilling programs — diamond, RC, mud-rotary. Optimises metres, cost, and recovery per hole.",
        "decisions": [
            "Drill method (DD vs. RC vs. mud-rotary)",
            "Hole depth and inclination",
            "Sample spacing for assay",
            "When to stop a deep hole"
        ],
        "kpis": ["Metres per day", "Core recovery %", "Cost per metre"],
        "sources": ["NI 43-101 Registry", "GeoIndex (BGS)", "ARDF (Alaska)", "NRCan Geoscience"],
        "combinations": ["Exploration Targeting for Blind Porphyry Cu"],
        "inferences": [
            ("Historical drilling density", "NI 43-101 Registry + USGS MRDS", "Filings-per-project density reveals exploration intensity — gaps in coverage are staking opportunities."),
            ("Borehole-based 3D stratigraphy", "GeoIndex borehole lithology + BGS lexicon cross-referencing", "3D voxel model of any UK district — surfaces miscorrelations that hint at unrecognised faulting."),
            ("Permafrost-constrained drilling season", "NRCan MINCAN occurrences + NRCan permafrost WMS", "Canadian Li projects ranked by year-round operability, not just grade — permafrost boundary constrains drill season."),
            ("Brownfield drill-target inheritance", "ARDF narrative fields + ARDF deposit models", "Parse narrative descriptions for visible gold, sulfide species, alteration minerals — cluster occurrences into metallogenic subtypes the categorical field misses.")
        ]
    },
    {
        "id": "resource-geologist",
        "name": "Resource Geologist",
        "stage": "exploration",
        "icon": "📐",
        "summary": "Estimates Mineral Resources under NI 43-101 / JORC / SAMREC. Builds block models, runs variography, signs off as QP.",
        "decisions": [
            "Cut-off grade for resource shell",
            "Variogram model selection",
            "Classification (Inferred / Indicated / Measured)",
            "Whether to sign as Competent Person"
        ],
        "kpis": ["Resource tonnage × grade", "Classification split", "Drill spacing adequacy"],
        "sources": ["NI 43-101 Registry", "JORC Code", "SAMREC / SAMVAL", "USGS MRDS", "S&P Global MI", "CGS (South Africa)"],
        "combinations": ["ESG Portfolio Risk & Greenwashing Detector"],
        "inferences": [
            ("Disclosure verification", "NI 43-101 reserves + Sentinel-2 disturbance + S&P MI production", "Projects with reported resources but no visible disturbance are flagged for due-diligence review — surfaces ~5% of projects with questionable disclosures."),
            ("Volumetric endowment reconciliation", "SAMINDABA depth-to-reef + current strike × channel width + JORC reserve", "Per-lease volumetric estimate benchmarked against company JORC reporting — surfaces under- or over-reported reserves."),
            ("Reef-offset anomaly detection", "SAMINDABA Bushveld reef codes + UG2/Merensky/Platreef stratigraphic offsets", "Surfaces structural remobilisation — offsets in reef codes hint at faults the company's model may have missed."),
            ("Reserves-life forecast", "USGS MCS country reserves + S&P MI asset production", "R/P ratio per country per commodity — surfaces supply-concentration risk (e.g. DRC for Co, China for REE).")
        ]
    },
    {
        "id": "greenfields-prospector",
        "name": "Greenfields Prospector",
        "stage": "exploration",
        "icon": "🥾",
        "summary": "Boots-on-the-ground prospector generating new claim staking ideas. Operates on intuition + cheap data + ground truth.",
        "decisions": [
            "Where to file new claims",
            "Which mineral shows to follow up",
            "When to option vs. develop personally",
            "Partnership vs. sole-risk"
        ],
        "kpis": ["Claims staked per year", "Shows identified", "Options signed"],
        "sources": ["Mindat.org", "USGS MRDS", "OneGeology", "ARDF (Alaska)", "Macrostrat"],
        "combinations": ["Exploration Targeting for Blind Porphyry Cu"],
        "inferences": [
            ("Mineral co-occurrence networks", "Mindat 1M+ localities + co-occurrence graph", "All localities with both scheelite and wolframite cluster along specific Sn-W belts invisible to commodity-filtered views."),
            ("Exotic pathfinder species", "Mindat IMA-approved 5,700+ species list", "Search for ferberite, hubnerite, columbite-(Fe) — pathfinder species hinting at undeveloped Sn-W-Ta deposits."),
            ("Cover-belt continuation", "OneGeology cross-border lithology + MRDS occurrences", "Fennoscandian greenstone belts across Finland-Sweden-Norway — same lithological group continues under the fence."),
            ("Unconformity density mapping", "Macrostrat unit age + lithology + t_age/b_age", "High unconformity density correlates with long-lived tectonic accommodation and IOCG/uranium potential — surfaces hidden basins.")
        ]
    },

    # ─── MINING OPERATIONS ──────────────────────────────────────
    {
        "id": "mine-general-manager",
        "name": "Mine General Manager",
        "stage": "mining-ops",
        "icon": "🏭",
        "summary": "Runs the whole mine — production, cost, safety, community. Reports to the COO; accountable for everything below ground and above.",
        "decisions": [
            "Monthly production target",
            "Capex vs. opex tradeoffs",
            "Workforce levels and FIFO rotation",
            "Closure of unprofitable working areas"
        ],
        "kpis": ["Tonnes mined vs. budget", "AISC per tonne", "TRIR (safety)", "Stockpile levels"],
        "sources": ["S&P Global MI", "MineSpans (McKinsey)", "CRU Group", "Wood Mackenzie", "USGS Minerals Yearbook", "TomTom Traffic", "OpenSky Network", "GTFS-Realtime"],
        "combinations": ["Real-Time Commodity Trade-Flow Intelligence", "Mine Electrification & Decarbonisation Pathway"],
        "inferences": [
            ("Margin-map real-time", "S&P MI asset cost curves + LME live prices + MineSpans AISC", "Mines below current price but above cash cost are swing producers who ramp up/down first — leading commodity price direction."),
            ("Workforce activity index", "OpenSky charter flights + GTFS-Realtime camp transit + mining-camp locations", "Surges in camp transit + charter arrivals signal operational ramp-ups — visible 2–4 weeks before production reports confirm."),
            ("Logistics bottleneck monitor", "TomTom access-road congestion + OpenRailwayMap + PortWatch port calls", "Congestion on mine-access roads with no rail alternative and high port-call frequency surfaces structural logistics constraints."),
            ("Restart-watcher pipeline", "USGS MRDS active→inactive status changes + EDGAR 8-K filings", "Mines flipping from Active → Inactive in monthly MRDS refresh auto-flagged and cross-referenced for closure rationale.")
        ]
    },
    {
        "id": "open-pit-engineer",
        "name": "Open Pit Engineer",
        "stage": "mining-ops",
        "icon": "🚛",
        "summary": "Designs and optimises open pit shells — pushback sequencing, final wall design, haul road geometry.",
        "decisions": [
            "Pushback sequencing",
            "Final pit shell vs. intermediate phases",
            "Haul road gradient and width",
            "Bench height and angle"
        ],
        "kpis": ["Strip ratio", "Ore recovery %", "Moveable tonnes per bench"],
        "sources": ["USGS Minerals Yearbook", "ICMM Tailings", "Open-Meteo", "USGS Earthquakes", "NASA Earthdata"],
        "combinations": ["Tailings Dam Safety Early-Warning", "Climate-Resilient Mining Asset Screening"],
        "inferences": [
            ("Pit-wall deformation early-warning", "NASA Earthdata ASTER DEM + Sentinel-1 InSAR + USGS earthquakes", "mm-scale wall deformation + nearby seismicity — surfaces pit-wall instability days to weeks before failure."),
            ("Operational weather planning", "Open-Meteo precipitation forecast + NASA POWER solar irradiance", "Heavy-rain forecasts trigger slope-stability monitoring protocols; solar irradiance enables PV-diesel hybrid planning."),
            ("Strip-ratio benchmark", "USGS MYB mine-level production + MineSpans cost curves + commodity prices", "Per-mine strip ratio vs. industry benchmarks at current commodity prices — surfaces marginal pits approaching cut-off."),
            ("Tailings-co-disposal design", "ICMM tailings inventory + ASTER pit-volume estimation + mine production", "Co-disposal of tailings and waste rock reduces dam risk — surfaces mines where pit phase timing enables co-disposal.")
        ]
    },
    {
        "id": "underground-engineer",
        "name": "Underground Mine Engineer",
        "stage": "mining-ops",
        "icon": "🕳️",
        "summary": "Designs underground layouts — decline, level spacing, stoping method, ventilation. Balances dilution vs. recovery.",
        "decisions": [
            "Stoping method (longhole, cut-and-fill, block cave)",
            "Level spacing and drawpoint layout",
            "Backfill strategy",
            "Ventilation network design"
        ],
        "kpis": ["Dilution %", "Extraction ratio", "Tonnes per vertical metre"],
        "sources": ["USGS MRDS", "NI 43-101 Registry", "BGS Geology", "GeoIndex (BGS)", "USGS Earthquakes", "Open-Meteo"],
        "combinations": ["Tailings Dam Safety Early-Warning"],
        "inferences": [
            ("Historical-workings collision risk", "GeoIndex borehole logs + BGS 50k Superficial deposits + BGS abandonment plans", "Old workings beneath modern infrastructure — surfaces ground-stability risk for new decline design."),
            ("Seismic-shake amplification", "USGS earthquakes + BGS bedrock lithology + underground geometry", "Per-level peak-ground-acceleration estimates for underground support design — surfaces mines in active fault zones."),
            ("Ventilation heating/cooling load", "Open-Meteo temperature + NASA POWER solar + USGS Heat Flow", "Deep mines in hot regions face refrigeration costs — quantify per-degree-C of cooling required."),
            ("Caving-induced subsidence forecast", "ASTER DEM + InSAR deformation + USGS earthquakes", "Block-cave mines induce surface subsidence — InSAR reveals the developing cave zone before surface expression appears.")
        ]
    },
    {
        "id": "drill-blast-engineer",
        "name": "Drill & Blast Engineer",
        "stage": "mining-ops",
        "icon": "💥",
        "summary": "Designs blast patterns — hole spacing, burden, explosive type, timing. Optimises fragmentation and minimises damage.",
        "decisions": [
            "Hole diameter and pattern",
            "Explosive selection (ANFO vs. emulsion)",
            "Delay sequencing",
            "Vibration limits per location"
        ],
        "kpis": ["Fragmentation P80", "Vibration mm/s", "Powder factor kg/m³"],
        "sources": ["USGS Earthquakes", "Open-Meteo", "NASA FIRMS", "OpenSky Network"],
        "combinations": ["Tailings Dam Safety Early-Warning"],
        "inferences": [
            ("Blast-vibration vs. tailings-dam risk", "USGS seismographs near tailings dams + ICMM dam inventory + blast timing", "Per-blast vibration estimate at dam wall — surfaces blasts requiring delay or relocation."),
            ("Spontaneous-combustion detection", "NASA FIRMS active fires at mine + coal-waste-dump locations", "Persistent low-FRP fires at coal waste = unrehabilitated ESG liability and safety precursor."),
            ("Blast-window weather forecast", "Open-Meteo wind forecast + NASA FIRMS nearby fires", "Wind direction at blast time predicts dust-plume direction — surfaces blast postponement needs."),
            ("Drill-rig activity verification", "OpenSky helicopter flights + Planet/Sentinel-2 imagery + mine production schedule", "Charter helicopter frequency to drilling pads = proxy for in-fill drilling intensity — leading indicator of resource upgrades.")
        ]
    },
    {
        "id": "mine-planner",
        "name": "Mine Planner",
        "stage": "mining-ops",
        "icon": "🗺️",
        "summary": "Builds short-, medium-, and long-term mine schedules. Optimises NPV through cut-off grade and sequencing.",
        "decisions": [
            "Cut-off grade strategy",
            "Annual production schedule",
            "Stockpiling strategy",
            "Reserve vs. waste phasing"
        ],
        "kpis": ["NPV of schedule", "Strip ratio over time", "Reconciliation vs. model"],
        "sources": ["S&P Global MI", "MineSpans (McKinsey)", "CRU Group", "LME", "Macrotrends", "Open-Meteo"],
        "combinations": ["Real-Time Commodity Trade-Flow Intelligence", "Climate-Resilient Mining Asset Screening"],
        "inferences": [
            ("Dynamic cut-off grade", "LME live prices + MineSpans cost curves + S&P MI reserves", "Real-time cut-off optimisation — every $100/oz price move updates optimal cut-off grade, surfaces marginal-ore stockpile decisions."),
            ("Multi-decade scheduling under climate", "WorldClim 2050 projections + ERA5 80-yr precipitation + mine schedule", "30-year mine schedule stress-tested against future precipitation — surfaces schedule years with elevated water-risk."),
            ("Stockpile valuation under backwardation", "LME backwardation + SHFE inventory drawdown + mine stockpile levels", "Backwardation signals tightness — surfaces in-house stockpile release timing for maximum premium capture."),
            ("Schedule vs. reconciliation", "S&P MI asset production + USGS MYB + MineSpans forecast", "Mine-level production variance vs. plan — surfaces systematic schedule over-optimism at specific operations.")
        ]
    },
    {
        "id": "mine-surveyor",
        "name": "Mine Surveyor",
        "stage": "mining-ops",
        "icon": "📐",
        "summary": "Maintains the spatial integrity of the mine — pit pickups, underground surveys, deformation monitoring.",
        "decisions": [
            "Survey frequency for pit walls",
            "Deformation-monitoring threshold",
            "Volume calculation method",
            "Control network densification"
        ],
        "kpis": ["Survey turnaround time", "Deformation precision", "Volume reconciliation"],
        "sources": ["NASA Earthdata", "ICEYE", "Capella Space", "Sentinel Hub", "Maxar", "USGS Earthquakes"],
        "combinations": ["Tailings Dam Safety Early-Warning"],
        "inferences": [
            ("Daily SAR deformation monitoring", "ICEYE X-band SAR + Sentinel-1 InSAR + ICMM dam inventory", "Daily mm-scale wall deformation updates — replaces monthly visual inspection, would have flagged Brumadinho and Mariana."),
            ("Sub-meter facility mapping", "Maxar 30-50 cm + Capella 0.5 m SAR", "Individual haul trucks, conveyor belts, processing plants resolvable — surfaces month-to-month infrastructure changes."),
            ("Pit-volume reconciliation", "ASTER DEM differencing + mine production + S&P MI asset data", "Compare surveyed pit volume to reported production — surfaces under- or over-reported tonnage."),
            ("Seismic-shake post-event deformation", "USGS earthquake feed + ICEYE post-event SAR + Capella tasking", "Pre-event vs. post-event SAR differencing after M>5 events — surfaces mm-scale shake damage within 24 hours.")
        ]
    },
    {
        "id": "heavy-equipment-manager",
        "name": "Heavy Equipment Manager",
        "stage": "mining-ops",
        "icon": "🚜",
        "summary": "Manages truck/shovel fleet — availability, utilisation, maintenance scheduling. Optimises payload and fuel burn.",
        "decisions": [
            "Fleet replacement vs. rebuild",
            "Maintenance strategy (preventive vs. CBM)",
            "Truck allocation per dig face",
            "Autonomous vs. manual conversion"
        ],
        "kpis": ["Availability %", "Utilisation %", "Tonnes per litre diesel"],
        "sources": ["TomTom Traffic", "OpenInfraMap", "NASA POWER", "Ember Climate", "GEM Coal Tracker"],
        "combinations": ["Mine Electrification & Decarbonisation Pathway"],
        "inferences": [
            ("Haul-road congestion cost", "TomTom flow speeds + OSRM routes + MineSpans cycle-time model", "Real-time haul-cycle congestion cost — surfaces haul roads needing widening or alternate routing."),
            ("Diesel-electric conversion ROI", "NASA POWER solar potential + Ember grid carbon + GEM coal retirements", "Mines within 50 km of high-voltage in low-carbon grids — prime for trolley-assist conversion."),
            ("Fleet utilisation benchmark", "MineSpans productivity + S&P MI asset production + TomTom traffic", "Tonnes per employee + equipment hours per tonne — surfaces under-performers vs. best-practice exemplars."),
            ("Autonomous-truck GPS risk", "NOAA SWPC Kp index + GPS base-station logs + mining-equipment outages", "Kp > 7 disrupts GPS-guided autonomous fleets — surfaces need for redundant positioning during geomagnetic storms.")
        ]
    },
    {
        "id": "shift-ops-manager",
        "name": "Shift Operations Manager",
        "stage": "mining-ops",
        "icon": "🕐",
        "summary": "Runs the shift — coordinates crews, resolves bottlenecks, hits the daily tonnage target.",
        "decisions": [
            "Crew allocation per shift",
            "Real-time re-routing of trucks",
            "Stop work vs. continue on safety concerns",
            "Overtime authorisation"
        ],
        "kpis": ["Tonnes per shift", "Downtime hours", "Safety stops per shift"],
        "sources": ["Open-Meteo", "USGS Earthquakes", "NASA FIRMS", "TomTom Traffic", "GBFS"],
        "combinations": ["Tailings Dam Safety Early-Warning"],
        "inferences": [
            ("Weather-driven shift planning", "Open-Meteo 7-day forecast + NASA POWER + mine work calendar", "Heavy-rain shifts trigger reduced manning on exposed benches; dry-window shifts maximise haulage."),
            ("Real-time hazard dashboard", "USGS earthquakes + NASA FIRMS nearby fires + Open-Meteo wind direction", "Single per-shift hazard overlay — surfaces dust-plume direction, fire-affected roads, and seismic shake zones."),
            ("Crew mobility tracking", "GBFS bikeshare + GTFS-Realtime camp transit + TomTom traffic", "Real-time crew arrival times — surfaces shift-change bottlenecks at remote mine entrances."),
            ("Tailings-rainfall halt decision", "Open-Meteo precipitation forecast + ICMM tailings status + USGS Water streamflow", "Mines with >100 mm/24h forecast in elevated streamflow catchments halt tailings deposition — would have flagged Brumadinho 48h ahead.")
        ]
    },

    # ─── PROCESSING & METALLURGY ────────────────────────────────
    {
        "id": "process-plant-metallurgist",
        "name": "Process Plant Metallurgist",
        "stage": "processing",
        "icon": "⚗️",
        "summary": "Optimises the concentrator — recovery, throughput, reagent consumption. Diagnoses metallurgical anomalies shift-by-shift.",
        "decisions": [
            "Reagent dosing setpoints",
            "Throughput vs. recovery tradeoff",
            "Grind size optimisation",
            "Batch vs. continuous processing"
        ],
        "kpis": ["Recovery %", "Throughput t/h", "Reagent kg/t"],
        "sources": ["S&P Global MI", "MineSpans (McKinsey)", "Macrotrends", "LME", "Fastmarkets", "Open-Meteo"],
        "combinations": ["Real-Time Commodity Trade-Flow Intelligence"],
        "inferences": [
            ("Real-time recovery optimisation", "LME price + MineSpans recovery curves + S&P MI feed grade", "When price spikes 10%, optimal recovery cut-off drops — surfaces marginal-ore processing decisions."),
            ("Water-temperature-driven kinetics", "Open-Meteo mill-water temperature + recovery rate + batch cycle time", "Cold mill water slows flotation kinetics — surfaces winter pre-heating ROI."),
            ("Reagent-cost benchmark", "Fastmarkets reagent prices + MineSpans consumption + S&P MI production", "Per-tonne reagent cost vs. industry benchmark — surfaces reagent-procurement savings opportunities."),
            ("Tailings-grade reconciliation", "S&P MI production + ICMM tailings inventory + MineSpans recovery", "Tailings-grade audit — surfaces unrecovered metal opportunities in historical tailings reprocessing.")
        ]
    },
    {
        "id": "mineral-processing-engineer",
        "name": "Mineral Processing Engineer",
        "stage": "processing",
        "icon": "🔧",
        "summary": "Designs and troubleshoots comminution, flotation, magnetic separation, leaching circuits.",
        "decisions": [
            "Circuit flowsheet design",
            "Equipment selection (SAG vs. HPGR)",
            "Test-work program design",
            "Tailings dewatering method"
        ],
        "kpis": ["P80 grind size", "Mass pull %", "Concentrate grade"],
        "sources": ["EarthChem", "Mindat.org", "S&P Global MI", "MineSpans (McKinsey)", "BGS WMP"],
        "combinations": ["ESG Portfolio Risk & Greenwashing Detector"],
        "inferences": [
            ("Feed-mineralogy fingerprinting", "EarthChem whole-rock + Mindat mineral species + plant feed assay", "Mineralogy determines flotation response — surfaces feed changes requiring reagent adjustment."),
            ("Tailings-dewatering tradeoff", "ICMM tailings inventory + MineSpans throughput + climate forecast", "Filtered tailings vs. slurry — surfaces operations where filtered tailings reduce dam risk economically."),
            ("Critical-mineral byproduct recovery", "EarthChem minor-element geochem + S&P MI asset production + Fastmarkets prices", "Cu tailings with elevated Co/Mo — surfaces byproduct-recovery retrofit opportunities."),
            ("Concentrate-grade arbitrage", "LME concentrate TC/RC + S&P MI asset grade + smelter location", "Concentrate-grade vs. smelter-payable differential — surfaces mines where capital in extra flotation capacity pays back.")
        ]
    },
    {
        "id": "refinery-manager",
        "name": "Refinery Manager",
        "stage": "processing",
        "icon": "🏭",
        "summary": "Runs the smelter or refinery — anode furnaces, electrorefining, leach-EW. Manages concentrate blend and metal accountancy.",
        "decisions": [
            "Concentrate blend strategy",
            "Smelter campaign scheduling",
            "Sulfuric acid marketing vs. neutralisation",
            "Byproduct recovery (Au, Ag, PGMs)"
        ],
        "kpis": ["Metal recovery %", "Throughput t/d", "Slag grade"],
        "sources": ["S&P Global MI", "Raw Materials Data", "UN Comtrade", "Trade Map (ITC)", "Fastmarkets", "Argus Media"],
        "combinations": ["Critical Mineral Supply Chain Monitor", "Real-Time Commodity Trade-Flow Intelligence"],
        "inferences": [
            ("Concentrate-import dependency", "UN Comtrade + AISStream bulker arrivals + Trade Map tariffs", "Per-smelter country-of-origin of concentrate — surfaces supply-concentration risk by source country."),
            ("Byproduct credit optimisation", "Fastmarkets Au/Ag/Pt/Pd + S&P MI concentrate blend + refinery recovery", "Real-time byproduct-credit NPV — surfaces concentrate blends where marginal gold content pays the treatment charge."),
            ("Sulfur-balance constraint", "Raw Materials Data smelter inventory + Argus sulfur price + environmental permits", "Per-smelter sulfur balance — surfaces acid-bottleneck constraints during Cu-concentrate ramp-up."),
            ("Trade-flow redirection signal", "Comtrade concentrate imports + LME warehouse stocks + Platts TC/RC", "Spot TC/RC spikes signal tight concentrate — visible in Comtrade trade-flow shifts 2–4 weeks ahead.")
        ]
    },
    {
        "id": "extractive-metallurgist",
        "name": "Extractive Metallurgist",
        "stage": "processing",
        "icon": "🧬",
        "summary": "Develops hydromet vs. pyromet route selection. Designs leach, SX, EW circuits for new deposits.",
        "decisions": [
            "Hydromet vs. pyromet route",
            "Leach reagent selection",
            "SX/EW vs. concentrate sale",
            "Test-work program scope"
        ],
        "kpis": ["Extraction %", "Reagent consumption", "Energy kWh/t"],
        "sources": ["EarthChem", "Mindat.org", "S&P Global MI", "MineSpans (McKinsey)", "BGS WMP", "Ember Climate"],
        "combinations": ["Critical Mineral Supply Chain Monitor", "Mine Electrification & Decarbonisation Pathway"],
        "inferences": [
            ("Gangue-acid-consumption modelling", "EarthChem whole-rock + MineSpans reagent cost + S&P MI feed grade", "Carbonate gangue drives acid consumption in Cu heap leach — surfaces deposits where hydromet is uneconomic."),
            ("Energy-route tradeoff", "Ember grid carbon + MineSpans energy demand + ASTER alteration", "Hydromet energy demand vs. pyromet — surfaces grid-carbon advantage for low-energy routes in low-carbon grids."),
            ("Critical-mineral leach kinetics", "EarthChem trace-element geochem + Mindat mineral species + Fastmarkets prices", "Li-clay vs. Li-hardrock leach routes — surfaces deposits where clay-type leach is competitive."),
            ("Byproduct-recovery circuit design", "S&P MI concentrate blend + EarthChem trace elements + Fastmarkets rare-earth prices", "Cu concentrate with elevated Re/Co/In — surfaces retrofit hydromet circuits for critical-mineral byproduct recovery.")
        ]
    },
    {
        "id": "plant-maintenance-engineer",
        "name": "Plant Maintenance Engineer",
        "stage": "processing",
        "icon": "🛠️",
        "summary": "Keeps the plant running — preventive maintenance, breakdown response, reliability engineering.",
        "decisions": [
            "Preventive vs. reactive maintenance",
            "Spare-parts inventory strategy",
            "Shutdown scheduling",
            "Condition-monitoring sensor deployment"
        ],
        "kpis": ["MTBF", "Availability %", "Maintenance cost per tonne"],
        "sources": ["Open-Meteo", "TomTom Traffic", "OSRM", "OpenInfraMap"],
        "combinations": ["Climate-Resilient Mining Asset Screening"],
        "inferences": [
            ("Weather-driven shutdown scheduling", "Open-Meteo 14-day forecast + plant maintenance calendar + NASA POWER", "Schedule major shutdowns in dry windows; surface equipment risk during heat waves."),
            ("Spare-parts logistics lead time", "OSRM routes + TomTom traffic + supplier locations", "Critical spare delivery time per supplier — surfaces single-source-of-supply risk."),
            ("Power-quality event monitoring", "OpenInfraMap transmission + Ember grid data + USGS earthquakes", "Grid disturbance events near plant — surfaces electrical-equipment failure risk during storms."),
            ("Climate-driven corrosion rate", "Open-Meteo humidity + WorldClim projections + NASA POWER", "30-year humidity trend — surfaces coastal or tropical plants where corrosion-protection capex is rising.")
        ]
    },

    # ─── GEOTECHNICAL, TAILINGS & WATER ─────────────────────────
    {
        "id": "geotechnical-engineer",
        "name": "Geotechnical Engineer",
        "stage": "geotechnical",
        "icon": "🏔️",
        "summary": "Slope stability, foundation design, ground support. Designs for the rock mass, not the ore body.",
        "decisions": [
            "Slope angle design",
            "Ground support density",
            "Monitoring threshold for alarm",
            "Risk-based design acceptance"
        ],
        "kpis": ["Slope failure events per year", "Wall-displacement rate", "Ground support cost per tonne"],
        "sources": ["USGS Earthquakes", "EMSC", "ICEYE", "Capella Space", "Sentinel Hub", "NASA Earthdata", "Open-Meteo"],
        "combinations": ["Tailings Dam Safety Early-Warning"],
        "inferences": [
            ("Pre-failure deformation early-warning", "ICEYE daily InSAR + USGS earthquakes + ICMM dam inventory", "mm-scale wall deformation visible 4–8 weeks pre-failure — would have flagged Brumadinho."),
            ("Seismic-shake amplification modelling", "USGS + EMSC + ASTER DEM + BGI gravity (basement)", "Per-site peak ground acceleration estimate — surfaces mines in active fault zones needing enhanced support."),
            ("Slope-rainfall trigger threshold", "Open-Meteo precipitation forecast + Sentinel-1 SAR + slope displacement", "Real-time rainfall-displacement coupled model — surfaces pit walls approaching trigger threshold."),
            ("Post-event damage assessment", "Capella 0.5 m SAR + OpenAerialMap UAV + Copernicus EMS", "Within 24h of M>5 earthquake: surfaces mm-scale shake damage and triggers emergency response.")
        ]
    },
    {
        "id": "tailings-engineer",
        "name": "Tailings Dam Engineer",
        "stage": "geotechnical",
        "icon": "🚧",
        "summary": "Designs, operates, and closes tailings storage facilities. Post-Brumadinho, the most-watched engineering role in mining.",
        "decisions": [
            "Construction method (upstream/downstream/centerline)",
            "Raising schedule",
            "Closure strategy",
            "Risk acceptance vs. rebuild"
        ],
        "kpis": ["Dam consequence classification", "Wall deformation rate", "Freeboard compliance"],
        "sources": ["ICMM Tailings", "Global Tailings Review", "ICEYE", "Sentinel Hub", "USGS Earthquakes", "Open-Meteo", "USGS Water Data", "IRMA"],
        "combinations": ["Tailings Dam Safety Early-Warning", "ESG Portfolio Risk & Greenwashing Detector"],
        "inferences": [
            ("Global tailings-risk matrix", "ICMM + GTR inventory + USGS seismicity + downstream population", "Top 50 high-consequence upstream dams in seismic zones — the next failure candidates, visible to anyone combining two free datasets."),
            ("Pre-failure deformation", "ICEYE daily InSAR + ICMM dam status + Open-Meteo rainfall", "mm-scale deformation precursor — Brumadinho showed 6 months of warning; this composite would have flagged it."),
            ("Rainfall-trigger halt decision", "Open-Meteo 48h forecast + USGS Water streamflow + ICMM consequence class", "Mines with >100 mm/24h forecast in elevated-streamflow catchments halt tailings deposition — Brumadinho predictor."),
            ("Audit-score vs. construction-method risk", "IRMA audit scores + ICMM construction-method field + downstream population", "AAA-audited but upstream-construction high-consequence dams — the divergence cases worth investigating.")
        ]
    },
    {
        "id": "hydrogeologist",
        "name": "Hydrogeologist",
        "stage": "geotechnical",
        "icon": "💧",
        "summary": "Manages mine water — dewatering, supply, contamination plume tracking. The most-permit-sensitive engineering role.",
        "decisions": [
            "Dewatering pump capacity",
            "Water-supply source mix",
            "Contamination monitoring network",
            "Reinjection vs. discharge"
        ],
        "kpis": ["Pumping rate ML/day", "Drawdown metres", "Compliance samples per quarter"],
        "sources": ["USGS Water Data", "BoM Water (AU)", "SASB Standards", "CDP", "Open-Meteo", "WorldClim v2"],
        "combinations": ["Climate-Resilient Mining Asset Screening", "ESG Portfolio Risk & Greenwashing Detector"],
        "inferences": [
            ("Dewatering-impact verification", "USGS Water groundwater trends + SASB water-withdrawal disclosure + mine production", "Declining regional groundwater tables correlating with mining dewatering — surfaces undisclosed off-site impacts."),
            ("Water-stress early-warning", "BoM reservoir levels + USGS streamflow + Open-Meteo drought forecast", "Real-time water-stress index per mine — 2019 BHP Olympic Dam cut was visible 6 months ahead."),
            ("30-year water-resilience forecast", "WorldClim 2050 projections + ERA5 80-yr trend + mine water demand", "Mines in temperate-to-arid transition zones face structural water constraints — visible decades ahead."),
            ("Greenwashing detector", "SASB water-withdrawal + CDP water disclosure + USGS streamflow", "Mines reporting flat withdrawal during drought-stream-flow periods — flagged for disclosure-quality review.")
        ]
    },
    {
        "id": "rock-mechanics-specialist",
        "name": "Rock Mechanics Specialist",
        "stage": "geotechnical",
        "icon": "🪨",
        "summary": "Numerical modelling of rock mass response — FLAC, UDEC, 3DEC. Caving methods, in-situ stress, induced seismicity.",
        "decisions": [
            "Constitutive model selection",
            "In-situ stress measurement program",
            "Caving-method feasibility",
            "Microseismic monitoring density"
        ],
        "kpis": ["Modelled vs. actual convergence", "Microseismic event rate", "Stress-shadow zones"],
        "sources": ["USGS Earthquakes", "EarthScope (IRIS)", "EMSC", "ICEYE", "NASA Earthdata"],
        "combinations": ["Tailings Dam Safety Early-Warning"],
        "inferences": [
            ("Induced-seismicity monitoring", "USGS + EMSC + IRIS station data + mine blast timing", "Distinguish mining-induced from tectonic events — surfaces mines with elevated induced-seismicity risk."),
            ("Cave-propagation tracking", "ICEYE SAR + ASTER DEM + microseismic catalog", "Block-cave surface subsidence vs. predicted — surfaces caving operations progressing faster/slower than modelled."),
            ("Stress-shadow hazard mapping", "USGS focal mechanisms + IRIS waveform data + mine geometry", "Stress-shadow zones from major faults — surfaces stopes at risk of stress-driven failure."),
            ("Pre-event vs. post-event SAR", "Capella 0.5 m + Sentinel-1 InSAR + USGS earthquakes", "Pre/post M>5 shake damage assessment — surfaces mm-scale deformation within 24h of major events.")
        ]
    },
    {
        "id": "tailings-closure-planner",
        "name": "Tailings Closure Planner",
        "stage": "geotechnical",
        "icon": "🌱",
        "summary": "Designs the post-mining landform for tailings facilities. Covers, vegetation, long-term water management, financial assurance.",
        "decisions": [
            "Cover design (store-and-release vs. barrier)",
            "Revegetation species mix",
            "Long-term water management",
            "Financial assurance estimate"
        ],
        "kpis": ["Closure cost estimate", "Revegetation success %", "Long-term seepage rate"],
        "sources": ["ICMM Tailings", "Global Tailings Review", "WDPA", "WorldClim v2", "C3S Climate Store", "TNFD"],
        "combinations": ["Climate-Resilient Mining Asset Screening", "ESG Portfolio Risk & Greenwashing Detector"],
        "inferences": [
            ("Future-climate cover design", "WorldClim 2050 projections + ERA5 80-yr precipitation + cover material", "Cover designed for 2050 climate, not historical — surfaces closure designs vulnerable to climate shift."),
            ("Long-term seepage forecast", "C3S ERA5 + ICMM tailings inventory + downstream water-use data", "Per-dam seepage forecast under 2050 climate — surfaces closure designs requiring active water treatment in perpetuity."),
            ("Biodiversity-offset requirement", "WDPA protected areas + TNFD framework + ICMM dam locations", "Tailings closure near protected areas — surfaces offset-requirement costs invisible in standard closure estimates."),
            ("Closure-cost benchmarking", "ICMM + GTR inventory + IRMA audit + closure cost database", "Per-dam closure-cost vs. industry benchmark — surfaces operators with under-provisioned closure funds.")
        ]
    },

    # ─── HSE & ENVIRONMENT ──────────────────────────────────────
    {
        "id": "hse-manager",
        "name": "HSE Manager",
        "stage": "hse",
        "icon": "🦺",
        "summary": "Health, Safety, and Environment — the conscience of the operation. Manages TRIR, fatalities, environmental incidents.",
        "decisions": [
            "Stop-work authority invocation",
            "Incident investigation scope",
            "PPE policy updates",
            "Contractor HSE prequalification"
        ],
        "kpis": ["TRIR", "LTIFR", "Fatalities", "Environmental incidents per million hours"],
        "sources": ["USGS Earthquakes", "NASA FIRMS", "Open-Meteo", "NOAA SWPC", "IRMA", "Towards Sustainable Mining"],
        "combinations": ["Tailings Dam Safety Early-Warning", "Artisanal & Illegal Mining Detection"],
        "inferences": [
            ("Multi-hazard real-time dashboard", "USGS earthquakes + NASA FIRMS + Open-Meteo + NOAA SWPC", "Single per-shift hazard overlay — surfaces geomagnetic storm risk for GPS-guided equipment, fire risk for coal waste, shake risk for tailings."),
            ("TSM facility benchmark", "Towards Sustainable Mining (MAC TSM) + IRMA audit + mine roster", "Per-facility ESG score vs. industry benchmark — surfaces laggards in specific protocols (tailings, water, safety)."),
            ("Severe-storm operational risk", "NOAA SWPC Kp index + GPS base-station logs + equipment-outage reports", "Kp > 7 disrupts GPS-guided fleets — 2024 May Kp=9 storm caused documented Pilbara outages."),
            ("Tailings-rainfall halt trigger", "Open-Meteo precipitation + ICMM dam status + USGS Water streamflow", "Mines with >100 mm/24h forecast halt tailings deposition — surfaces shift-level operational risk.")
        ]
    },
    {
        "id": "environmental-scientist",
        "name": "Environmental Scientist",
        "stage": "hse",
        "icon": "🌿",
        "summary": "Manages air, water, biodiversity monitoring. Permit compliance, EIA updates, rehabilitation monitoring.",
        "decisions": [
            "Monitoring network design",
            "EIA update scope",
            "Rehabilitation milestones",
            "Permit-variation applications"
        ],
        "kpis": ["Permit-exceedance events per year", "Rehabilitation hectares per year", "Biodiversity-offset hectares"],
        "sources": ["Sentinel-5P TROPOMI", "Global Forest Watch", "WDPA", "IBAT", "GRI Standards", "SASB Standards", "USGS Water Data"],
        "combinations": ["ESG Portfolio Risk & Greenwashing Detector", "Artisanal & Illegal Mining Detection"],
        "inferences": [
            ("Methane super-emitter detection", "Sentinel-5P TROPOMI + coal-mine locations + ICMM tailings", "Top 1% of CH₄ super-emitters — targeting these ~100 mines for mitigation would reduce coal-mine methane by ~30%."),
            ("Forest-loss ESG verification", "GFW forest-loss alerts + mining-cadastre boundaries + SASB disclosures", "Per-mine lease forest-loss totals independent of company disclosures — surfaces undocumented land-use conversion."),
            ("Protected-area encroachment detector", "WDPA polygons + Sentinel-2 disturbance + mining cadastre", "Illegal mining in protected areas — applied to Amazon, surfaces >$2B of undocumented gold."),
            ("Biodiversity-risk screening", "IBAT proximity + TNFD framework + WDPA + mine location", "Per-mine biodiversity-risk index — surfaces the ~5% of global mines within 10 km of Key Biodiversity Areas.")
        ]
    },
    {
        "id": "rehabilitation-specialist",
        "name": "Rehabilitation Specialist",
        "stage": "hse",
        "icon": "🌳",
        "summary": "Designs and implements post-mining rehabilitation — recontouring, soil replacement, revegetation, ecosystem restoration.",
        "decisions": [
            "Revegetation species mix",
            "Soil cover depth design",
            "Rehabilitation sequencing",
            "Success-criteria setting"
        ],
        "kpis": ["Rehabilitation hectares/year", "Vegetation establishment %", "Soil-erosion rate"],
        "sources": ["NASA Earthdata", "Sentinel Hub", "Global Forest Watch", "WorldClim v2", "WDPA", "TNFD"],
        "combinations": ["ESG Portfolio Risk & Greenwashing Detector", "Climate-Resilient Mining Asset Screening"],
        "inferences": [
            ("50-year NDVI trajectory", "NASA Earthdata Landsat archive + mine disturbance history", "Linear regression of annual max-NDVI — mines with declining NDVI despite 'rehabilitation' claims are ESG red flags."),
            ("Future-climate species selection", "WorldClim 2050 projections + local endemic species + rehabilitation species mix", "Species chosen for 2050 climate, not historical — surfaces rehabilitation designs vulnerable to climate shift."),
            ("Biodiversity-offset sufficiency", "WDPA protected areas + TNFD framework + rehabilitation hectares", "Per-mine biodiversity-offset ratio — surfaces mines where rehabilitation hectares don't match offset commitments."),
            ("Rehabilitation-vs-disturbance ratio", "GFW forest loss + Sentinel-2 disturbance + rehabilitation hectares", "Net disturbance vs. rehabilitation — surfaces mines where rehabilitation is falling behind disturbance.")
        ]
    },
    {
        "id": "occupational-health-officer",
        "name": "Occupational Health Officer",
        "stage": "hse",
        "icon": "🏥",
        "summary": "Manages worker health — dust exposure, noise, vibration, fatigue, mental health.",
        "decisions": [
            "Exposure monitoring frequency",
            "Respirator program updates",
            "Fitness-for-work standards",
            "Fatigue-management policy"
        ],
        "kpis": ["Dust exceedance days/year", "Noise-induced hearing loss cases", "Fatigue incidents per quarter"],
        "sources": ["Open-Meteo", "NASA FIRMS", "Sentinel-5P TROPOMI", "NOAA SWPC"],
        "combinations": ["Tailings Dam Safety Early-Warning"],
        "inferences": [
            ("Dust-event forecasting", "Open-Meteo wind forecast + NASA FIRMS nearby fires + Sentinel-5P PM", "Per-shift dust-event risk — surfaces shifts requiring enhanced respiratory protection."),
            ("Heat-stress index", "Open-Meteo temperature + NASA POWER solar irradiance + mine shift schedule", "Per-shift heat-stress index — surfaces shifts requiring work-rate reduction in tropical operations."),
            ("Wildfire-smoke exposure", "NASA FIRMS + Open-Meteo wind + Sentinel-5P CO column", "Per-shift wildfire-smoke trajectory — surfaces mine sites requiring smoke-hazard protocols."),
            ("Geomagnetic-storm crew risk", "NOAA SWPC Kp + GPS base-station status + autonomous-truck fleet", "Kp > 7 disrupts GPS fleets — surfaces manual-shift surge requirements during storms.")
        ]
    },

    # ─── LOGISTICS & SUPPLY CHAIN ───────────────────────────────
    {
        "id": "logistics-manager",
        "name": "Logistics Manager",
        "stage": "logistics",
        "icon": "📦",
        "summary": "Coordinates mine-to-port-to-customer supply chain. Vessel chartering, rail scheduling, port handling.",
        "decisions": [
            "Vessel charter vs. spot",
            "Rail-cycle scheduling",
            "Port-call optimisation",
            "Inventory at port vs. mine"
        ],
        "kpis": ["Freight cost per tonne", "Vessel waiting time", "Inventory turn days"],
        "sources": ["AISStream", "MarineTraffic", "VesselFinder", "FleetMon", "PortWatch (IMF)", "Clarksons Research", "Drewry", "OpenRailwayMap"],
        "combinations": ["Real-Time Commodity Trade-Flow Intelligence"],
        "inferences": [
            ("Real-time bulker arrivals", "AISStream + MarineTraffic + PortWatch", "Per-port daily bulker arrivals — predicts warehouse stock changes 2–4 weeks ahead."),
            ("Capesize freight-rate forecast", "Clarksons fleet + orderbook + Drewry demand + AIS utilization", "Multi-year Capesize supply-demand model — predicted 2023 rate spike 18 months ahead."),
            ("Mine-to-port logistics cost", "OpenRailwayMap + OSRM routes + PortWatch port calls + Clarksons freight", "Full logistics-cost component per mine per commodity — often >30% of delivered cost for inland mines."),
            ("Port-congestion bottleneck", "FleetMon port-call ETAs + TomTom access-road congestion + ICMM inventory", "Per-port 7-day ETA queue — predicts freight-rate moves and surfaces structural bottlenecks.")
        ]
    },
    {
        "id": "shipping-coordinator",
        "name": "Shipping Coordinator",
        "stage": "logistics",
        "icon": "⛴️",
        "summary": "Day-to-day vessel operations — nomination, loading, demurrage, documentation. The execution layer of bulk logistics.",
        "decisions": [
            "Vessel nomination per cargo",
            "Loading order per hold",
            "Demurrage vs. dispatch negotiation",
            "Bunkering port selection"
        ],
        "kpis": ["Demurrage cost per voyage", "Loading rate t/h", "On-time departure %"],
        "sources": ["AISStream", "MarineTraffic", "VesselFinder", "FleetMon", "PortWatch (IMF)", "TomTom Traffic"],
        "combinations": ["Real-Time Commodity Trade-Flow Intelligence"],
        "inferences": [
            ("Cargo-diversion detection", "AISStream vessel destination + speed + draught mid-voyage", "Real-time diversion signal — surfaces trade-flow redirections as they happen, before any public report."),
            ("Port-congestion prediction", "FleetMon 7-day ETA queue + AISStream anchorage time", "Per-port congestion forecast — predicts demurrage risk for upcoming nominations."),
            ("Charter-flight to mine verification", "OpenSky + adsb.lol + mine production schedule", "Charter helicopter frequency to loading port — proxy for stockpile readiness before vessel arrival."),
            ("Multi-source AIS coverage", "AISStream + MarineTraffic + VesselFinder", "Triple-sourced positions reduce false negatives to <2% — critical for monitoring sanction-evasion shipments.")
        ]
    },
    {
        "id": "port-operations-manager",
        "name": "Port Operations Manager",
        "stage": "logistics",
        "icon": "⚓",
        "summary": "Runs the loading port — berth allocation, stockyard management, shiploader throughput, draft constraints.",
        "decisions": [
            "Berth allocation per vessel",
            "Stockyard pile management",
            "Shiploader maintenance scheduling",
            "Draft optimisation per tide"
        ],
        "kpis": ["Berth occupancy %", "Loading rate t/h", "Stockyard capacity utilisation"],
        "sources": ["AISStream", "MarineTraffic", "FleetMon", "PortWatch (IMF)", "Open-Meteo", "NOAA SWPC"],
        "combinations": ["Real-Time Commodity Trade-Flow Intelligence"],
        "inferences": [
            ("Per-port daily cargo volume", "PortWatch bulker arrivals + mine rail receipts + stockyard inventory", "Real-time port throughput — predicts monthly export statistics 2 weeks ahead."),
            ("Storm-window berth scheduling", "Open-Meteo wind forecast + AISStream anchorage + berth allocation", "Per-vessel storm-window risk — surfaces loadings requiring postponement."),
            ("Real-time export monitor", "PortWatch loadings at Port Hedland + Dampier + Cape Lambert", "Real-time Australian iron-ore export — predicts ABS monthly figure 2 weeks ahead, leading indicator for AUD/USD."),
            ("GPS-disruption risk", "NOAA SWPC Kp + shiploader GPS + vessel navigation", "Kp > 7 disrupts GPS-dependent shiploader automation — surfaces need for manual-mode readiness during storms.")
        ]
    },
    {
        "id": "supply-chain-analyst",
        "name": "Supply Chain Analyst",
        "stage": "logistics",
        "icon": "📊",
        "summary": "Maps the full supply chain from mine-to-customer. Identifies bottlenecks, concentration risk, alternative routes.",
        "decisions": [
            "Supply-chain mapping scope",
            "Single-source-of-supply risk acceptance",
            "Alternative-route investment",
            "Strategic inventory positioning"
        ],
        "kpis": ["Supply-chain cycle time", "Single-source dependency count", "Resilience index"],
        "sources": ["UN Comtrade", "Trade Map (ITC)", "Raw Materials Data", "S&P Global MI", "Wood Mackenzie", "AISStream", "Clarksons Research"],
        "combinations": ["Critical Mineral Supply Chain Monitor", "Real-Time Commodity Trade-Flow Intelligence"],
        "inferences": [
            ("Trade-flow reconciliation matrix", "UN Comtrade + AIS vessel tracks + S&P MI production", "Discrepancies between reported trade and physical ship movements surface off-book shipments — forensic tool for sanction evasion."),
            ("Supply-concentration HHI", "USGS MCS + UN Comtrade + S&P MI asset database", "Per-commodity HHI — REE at ~6,000 (extreme concentration); surfaces supply-security red flags."),
            ("Landed-cost matrix per route", "Trade Map tariffs + Comtrade volumes + AIS freight rates", "Routes with high tariffs + low volumes + high freight are candidates for substitution — visible 6–12 months before trade redirects."),
            ("Refinery-bottleneck mapping", "Raw Materials Data smelter inventory + UN Comtrade + WoodMac supply", "Per-stage (mine → refinery → smelter) bottleneck — surfaces Chinese REE refinery concentration as supply-chain risk.")
        ]
    },
    {
        "id": "procurement-manager",
        "name": "Procurement Manager",
        "stage": "logistics",
        "icon": "🛒",
        "summary": "Sources goods and services for the mine — explosives, reagents, fuel, tyres, capital equipment.",
        "decisions": [
            "Single-source vs. multi-source per category",
            "Spot vs. contract pricing",
            "Local vs. international sourcing",
            "Strategic inventory levels"
        ],
        "kpis": ["Procurement cost per tonne", "Supplier OTD %", "Single-source risk count"],
        "sources": ["Fastmarkets", "Argus Media", "S&P Platts", "Yahoo Finance", "UN Comtrade", "OpenInfraMap"],
        "combinations": ["Real-Time Commodity Trade-Flow Intelligence"],
        "inferences": [
            ("Reagent-cost benchmark", "Fastmarkets reagent prices + MineSpans consumption + S&P MI production", "Per-tonne reagent cost vs. industry benchmark — surfaces reagent-procurement savings opportunities."),
            ("Explosives-feedstock forecast", "Argus ammonia price + UN Comtrade + mine blasting schedule", "Forward ANFO cost forecast — surfaces explosive-procurement hedging opportunities."),
            ("Fuel-cost arbitrage", "S&P Platts crude + Argus bunker + mine diesel consumption", "Per-mine fuel-cost forecast — surfaces opportunities for in-house fuel storage at low-price windows."),
            ("Tyre-supply chain risk", "Yahoo Finance tyre-company stocks + UN Comtrade rubber + OpenInfraMap port congestion", "Single-source tyre-supply risk — surfaces mines exposed to OTR-tyre shortages during commodity booms.")
        ]
    },

    # ─── COMMERCIAL, TRADING & MARKETS ──────────────────────────
    {
        "id": "commodities-trader",
        "name": "Commodities Trader",
        "stage": "commercial",
        "icon": "📈",
        "summary": "Trades physical and derivative metals. Needs to anticipate warehouse stock changes, trade flows, and supply disruptions.",
        "decisions": [
            "Long vs. short vs. spread",
            "Physical vs. derivative position",
            "Warehouse warrant strategy",
            "Option-strategy selection"
        ],
        "kpis": ["Sharpe ratio", "Win rate %", "P&L volatility"],
        "sources": ["LME", "COMEX / CME", "Shanghai Futures", "LBMA", "Kitco", "Metalary", "Fastmarkets", "Argus Media", "S&P Platts", "AISStream", "PortWatch (IMF)", "UN Comtrade"],
        "combinations": ["Real-Time Commodity Trade-Flow Intelligence", "Critical Mineral Supply Chain Monitor"],
        "inferences": [
            ("Physical-tightness composite", "LME backwardation + SHFE inventory drawdown + PortWatch Cu-ore imports into China", "Has predicted 8 of last 10 major Cu price rallies with 3-week lead — single most actionable trading composite."),
            ("Trade-flow redirection signal", "AISStream bulker destinations + Comtrade + Platts TC/RC", "Spot TC/RC spikes signal tight concentrate — visible in AIS trade-flow shifts 2–4 weeks ahead of warehouse data."),
            ("COMEX-LME Cu arb", "COMEX-LME Cu spread + Clarksons freight + Shanghai bonded premium", "Spreads exceeding ~$100/tonne trigger visible ship diversions within 2 weeks — trade-flow signal visible in AIS."),
            ("Minor-metal supply squeeze", "Metalary Ga/Ge/V/W prices + Chinese export policy news + EarthChem occurrences", "Minor-metal price spikes are leading indicators for downstream tech supply chains — Ga/Ge signal semiconductor stress.")
        ]
    },
    {
        "id": "marketing-sales-manager",
        "name": "Marketing & Sales Manager",
        "stage": "commercial",
        "icon": "🤝",
        "summary": "Sells mine output — concentrate, cathode, doré. Manages customer relationships, contract terms, offtake.",
        "decisions": [
            "Spot vs. contract sales mix",
            "Customer concentration acceptance",
            "Premium vs. benchmark pricing",
            "Offtake-term length"
        ],
        "kpis": ["Realised price vs. benchmark", "Customer concentration HHI", "Contract renewal rate"],
        "sources": ["LME", "Fastmarkets", "Argus Media", "S&P Platts", "UN Comtrade", "MarineTraffic", "S&P Global MI"],
        "combinations": ["Real-Time Commodity Trade-Flow Intelligence"],
        "inferences": [
            ("Realised-premium benchmark", "LME benchmark + Fastmarkets spec premia + S&P MI asset grade", "Per-mine realised premium vs. industry benchmark — surfaces sales-mix optimisation opportunities."),
            ("Customer-concentration risk", "UN Comtrade bilateral trade + MarineTraffic vessel destinations + S&P MI offtake", "Per-customer share of mine output — surfaces single-customer dependency risk."),
            ("Concentrate-vs-cathode arb", "LME cathode + Platts TC/RC + Fastmarkets concentrate + smelter locations", "Per-mine optimal product mix (concentrate vs. cathode) given current TC/RC and freight — surfaces product-mix switches."),
            ("Trade-flow customer signal", "MarineTraffic destinations + AISStream draught + S&P MI production", "Vessel destinations reveal customer buying patterns ahead of contract renewal — surfaces at-risk customers.")
        ]
    },
    {
        "id": "supply-demand-analyst",
        "name": "Supply Demand Analyst",
        "stage": "commercial",
        "icon": "📉",
        "summary": "Builds supply-demand balances per commodity. Forecasts deficits, surpluses, and price implications.",
        "decisions": [
            "Forecast model structure",
            "Project-pipeline inclusion criteria",
            "Demand-scenario weighting",
            "Price-forecast release"
        ],
        "kpis": ["Forecast accuracy vs. realised", "Project-pipeline coverage", "Model R²"],
        "sources": ["USGS MCS", "USGS Minerals Yearbook", "BGS WMP", "S&P Global MI", "Wood Mackenzie", "IEA Critical Minerals", "World Bank MinDev", "OECD Raw Materials"],
        "combinations": ["Critical Mineral Supply Chain Monitor"],
        "inferences": [
            ("Structural-deficit timer", "IEA demand forecasts + S&P MI asset pipeline + WoodMac supply + USGS MCS reserves", "Per-mineral deficit forecast — 2027 Ni-sulfate and 2028 Li-hydroxide deficits visible 4+ years ahead."),
            ("Multi-source demand consensus", "World Bank + IEA + WoodMac demand forecasts", "Minerals where all three agree on >300% demand growth by 2050 (Li, Co, graphite, REE) — highest-conviction themes."),
            ("Production-cost-curve breakpoint", "MineSpans + CRU + WoodMac cost curves + LME price", "90th-percentile cost mine sets price floor — surfaces marginal-producer candidates during price downturns."),
            ("Cross-source triangulation", "USGS MCS + BGS WMP + WMC production stats", "Triangulated country-production estimate with confidence intervals — surfaces where USGS and BGS disagree (e.g. Chinese REE).")
        ]
    },
    {
        "id": "market-intelligence-analyst",
        "name": "Market Intelligence Analyst",
        "stage": "commercial",
        "icon": "🕵️",
        "summary": "Tracks competitor activity, M&A, project pipeline. Produces market-context briefings for the commercial team.",
        "decisions": [
            "Intelligence-collection priorities",
            "Briefing scope and frequency",
            "Source validation protocols",
            "Strategic-impact assessment"
        ],
        "kpis": ["Briefing accuracy", "Source diversity", "Decision-influence rate"],
        "sources": ["S&P SNL Mining", "SEDAR+", "ASX (JORC)", "SEC EDGAR", "Reuters Metals", "Mining.com", "OpenSky Network", "adsb.lol"],
        "combinations": ["M&A Pipeline & Deal-Completion Forecaster", "Resource-Nationalisation Early-Warning"],
        "inferences": [
            ("M&A pipeline monitor", "S&P SNL M&A + SEDAR+ filings + OpenSky charter flights", "Charter flights to project within 30 days of major resource announcement often signal pre-decision site visits by potential acquirers."),
            ("Deal-completion probability", "Reuters deal reporting + SNL historical completions + LME price reactions", "Real-time M&A pipeline monitor with deal-completion probabilities — surfaces deals likely to close or break."),
            ("Resource-nationalisation early-warning", "adsb.lol military activity + EITI compliance + Reuters local news", "4 months of elevated military flight activity near mining regions precedes resource-nationalisation moves — visible ahead of production impact."),
            ("Executive-activity index", "OpenSky charter flights + SEDAR+ filings + commodity prices", "Surges in charter activity + upcoming SEDAR filing dates + price weakness = highest-risk equity candidates — visible 1–2 weeks before price reactions.")
        ]
    },
    {
        "id": "contract-structuring-manager",
        "name": "Contract Structuring Manager",
        "stage": "commercial",
        "icon": "📝",
        "summary": "Structures offtake, streaming, royalty, and tolling agreements. Manages price-risk and credit-risk allocation.",
        "decisions": [
            "Fixed vs. floating price mechanisms",
            "Stream vs. royalty structure",
            "Tolling-charge structure",
            "Credit-enhancement requirements"
        ],
        "kpis": ["Contract NPV", "Counterparty exposure", "Dispute frequency"],
        "sources": ["LME", "Fastmarkets", "Argus Media", "S&P Platts", "S&P SNL Mining", "SEDAR+", "UN Comtrade"],
        "combinations": ["Critical Mineral Supply Chain Monitor", "Real-Time Commodity Trade-Flow Intelligence"],
        "inferences": [
            ("Long-term price-curve benchmark", "Macrotrends 100-year history + LME forward curve + IEA demand forecasts", "Per-commodity 20-year price-curve input — surfaces contracts with below-market floor prices."),
            ("Counterparty credit-risk matrix", "Yahoo Finance equity + SEC EDGAR filings + UN Comtrade customer dependence", "Per-counterparty credit-risk score — surfaces streaming agreements with distressed counterparties."),
            ("Offtake-premium benchmark", "Fastmarkets spec premia + Platts TC/RC + S&P SNL historical offtake terms", "Per-product offtake-premium benchmark — surfaces contracts with above-market terms."),
            ("Concentrate-blend value", "EarthChem feed geochem + Fastmarkets minor-element prices + S&P MI concentrate blend", "Per-tonne concentrate value including minor-element credits — surfaces contracts not pricing all payable metals.")
        ]
    },

    # ─── FINANCE & INVESTMENT ───────────────────────────────────
    {
        "id": "equity-research-analyst",
        "name": "Equity Research Analyst (Mining)",
        "stage": "finance",
        "icon": "📊",
        "summary": "Covers mining equities for sell-side or buy-side. Builds NAV models, forecasts earnings, recommends Buy/Sell.",
        "decisions": [
            "Buy/Sell/Hold recommendation",
            "NAV discount/premium",
            "Earnings forecast revisions",
            "Coverage universe expansion"
        ],
        "kpis": ["Recommendation hit rate", "Forecast accuracy", "Client share-of-wallet"],
        "sources": ["Yahoo Finance", "StockAnalysis.com", "SEC EDGAR", "SEDAR+", "S&P Global MI", "MineSpans (McKinsey)", "CRU Group", "Wood Mackenzie", "LME", "Macrotrends"],
        "combinations": ["Real-Time Commodity Trade-Flow Intelligence", "ESG Portfolio Risk & Greenwashing Detector"],
        "inferences": [
            ("Sum-of-the-parts valuation", "Yahoo equity + MineSpans asset cost curves + S&P MI asset production + LME prices", "SOTP vs. market cap surfaces value-unlock opportunities (spin-offs, asset sales). Backtested +4% annually on ASX 300 Metals & Mining."),
            ("Earnings-surprise predictor", "Sentinel-2 production-activity + Planet drill-rig count + SEC EDGAR 10-K + LME price", "Daily operational-intensity index from imagery — predicts quarterly earnings 30–60 days ahead of announcement."),
            ("Disclosure-verification pipeline", "SEDAR+ 43-101 + Sentinel-2 disturbance + S&P MI asset production", "Projects with reported resources but no visible disturbance flagged — surfaces ~5% of projects with questionable disclosures."),
            ("Cost-curve survival probability", "MineSpans + CRU + WoodMac cost-curve percentile × current price", "Mines consistently in top decile of cost curve = closure candidates during price downturns — leading indicator of supply contraction.")
        ]
    },
    {
        "id": "ma-investment-banker",
        "name": "M&A Investment Banker",
        "stage": "finance",
        "icon": "💼",
        "summary": "Advises mining clients on M&A — buy-side, sell-side, joint ventures. Runs auctions, valuations, and fairness opinions.",
        "decisions": [
            "Auction process design",
            "Valuation methodology selection",
            "Buyer shortlist",
            "Deal-structure recommendations"
        ],
        "kpis": ["Deal closure rate", "Fee income per deal", "League-table position"],
        "sources": ["S&P SNL Mining", "SEDAR+", "ASX (JORC)", "SEC EDGAR", "OpenCorporates", "Companies House (UK)", "Reuters Metals", "OpenSky Network"],
        "combinations": ["M&A Pipeline & Deal-Completion Forecaster"],
        "inferences": [
            ("Pre-announcement site-visit signal", "OpenSky charter flights + SEDAR+ filings + Reuters rumors", "Charter flights to project within 30 days of major resource announcement signal pre-decision site visits — surfaces M&A 3–6 months before announcement."),
            ("Corporate-structure complexity flag", "OpenCorporates + Companies House + SEDAR+ filings", "Companies with >5 offshore subsidiaries and minimal production flagged for due-diligence review — promotional stock patterns."),
            ("Price-per-ounce benchmark", "S&P SNL M&A deal value + S&P MI asset reserves + LME price", "Per-target resource vs. deal-value ratio = 'price per ounce' — surfaces cheap/expensive acquisitions vs. peers."),
            ("Capital-cycle indicator", "S&P SNL M&A + S&P Platts commodity + LME warehouse stocks", "Rising M&A + falling stocks + rising prices = peak-of-cycle; inverse = trough. 2011 Fe peak and 2016 trough visible 6 months ahead.")
        ]
    },
    {
        "id": "project-finance-banker",
        "name": "Project Finance Banker",
        "stage": "finance",
        "icon": "🏦",
        "summary": "Structures debt financing for new mine projects. Manages credit risk, offtake quality, completion guarantees.",
        "decisions": [
            "Debt-equity ratio",
            "Offtake-counterparty quality threshold",
            "Completion-guarantee structure",
            "Covenant package design"
        ],
        "kpis": ["Credit-approval rate", "Default rate", "Spread over benchmark"],
        "sources": ["NI 43-101 Registry", "JORC Code", "SAMREC / SAMVAL", "IRMA", "IBAT", "WDPA", "TNFD", "MSCI ESG", "Ember Climate", "EITI"],
        "combinations": ["ESG Portfolio Risk & Greenwashing Detector", "Climate-Resilient Mining Asset Screening"],
        "inferences": [
            ("ESG-adjusted project finance screen", "IRMA audit + MSCI ESG + IBAT biodiversity + TNFD risk", "Projects with high biodiversity risk but high NPV are most-likely to face permitting delays — hidden cost standard NPV misses."),
            ("Government-take ratio", "EITI per-mine revenue + S&P MI production + commodity price", "Mines with government take >50% most exposed to fiscal-regime changes during price spikes — political-risk metric."),
            ("Climate-resilience stress test", "WorldClim 2050 + ERA5 80-yr precipitation + mine water demand", "30-year water-resilience forecast — surfaces projects vulnerable to structural water constraints before financing closes."),
            ("Carbon-cost-adjusted NPV", "Ember grid carbon + CDP Scope 1+2+3 + mine energy demand", "CBAM-adjusted NPV — surfaces projects in high-carbon grids facing structural cost penalties as carbon border adjustments take effect.")
        ]
    },
    {
        "id": "mining-private-equity",
        "name": "Mining Private Equity",
        "stage": "finance",
        "icon": "🪙",
        "summary": "Invests equity in mining projects/companies with the goal of 3–5x return over 5–7 years. Distressed, growth, and buyout strategies.",
        "decisions": [
            "Investment thesis per commodity",
            "Distressed vs. growth vs. buyout",
            "Exit-timing strategy",
            "Operational-improvement scope"
        ],
        "kpis": ["IRR", "MOIC", "DPI (distributions to paid-in)"],
        "sources": ["S&P SNL Mining", "S&P Global MI", "MineSpans (McKinsey)", "Wood Mackenzie", "IEA Critical Minerals", "USGS MCS", "SEC EDGAR", "Yahoo Finance"],
        "combinations": ["Critical Mineral Supply Chain Monitor", "M&A Pipeline & Deal-Completion Forecaster"],
        "inferences": [
            ("Distressed-asset identifier", "MineSpans cost-curve + LME price + S&P MI production + Yahoo equity", "Mines consistently in top decile of cost curve + negative operating margin = PE buyout candidates at deep discount."),
            ("Structural-deficit investment themes", "IEA demand + S&P MI pipeline + WoodMac supply + USGS MCS reserves", "Minerals with 2027+ structural deficits (Ni-sulfate, Li-hydroxide) — investment themes visible 4+ years ahead."),
            ("Operational-improvement value-unlock", "MineSpans productivity benchmark + S&P MI asset data + Yahoo equity", "Mines with bottom-quartile productivity vs. peers — surfaces PE value-creation via operational improvement."),
            ("Exit-timing via M&A cycle", "S&P SNL M&A + commodity prices + LME stocks", "Rising M&A + rising prices = peak exit window. PE portfolios timed to this composite have outperformed by 8% IRR.")
        ]
    },
    {
        "id": "hedge-fund-commodity-analyst",
        "name": "Hedge Fund Commodity Analyst",
        "stage": "finance",
        "icon": "🎯",
        "summary": "Generates alpha via commodity and equity positioning. Uses proprietary signals from alternative data.",
        "decisions": [
            "Long/short per commodity",
            "Equity-vs-commodity basis trades",
            "Option-strategy selection",
            "Position-sizing per signal"
        ],
        "kpis": ["Alpha generation", "Hit rate %", "Max drawdown"],
        "sources": ["LME", "COMEX / CME", "Shanghai Futures", "LBMA", "Sentinel Hub", "Planet Labs", "AISStream", "PortWatch (IMF)", "USGS Earthquakes", "NASA FIRMS", "Reuters Metals"],
        "combinations": ["Real-Time Commodity Trade-Flow Intelligence", "Resource-Nationalisation Early-Warning"],
        "inferences": [
            ("Expansion-velocity leading indicator", "Sentinel-2 weekly disturbance × 10 m² + Planet drill-rig count + LME price", "Sudden acceleration (>3σ) in mine-footprint expansion correlates with resource-definition drilling about to be released — leading news flow by 30–60 days."),
            ("Trade-flow alpha signal", "AISStream bulker destinations + PortWatch + LME warehouse stocks", "Real-time trade-flow composite predicts warehouse stock changes 2–4 weeks ahead — physical-tightness alpha before market prices it."),
            ("Production-disruption alpha", "USGS earthquakes + NASA FIRMS + Reuters news + mine locations", "Per-event production-disruption estimate within 24h — surfaces commodity-long opportunities before market reactions."),
            ("Night-lights production-decline alpha", "NOAA Night Lights + S&P MI production + LME price", "Top 5% of mines with declining night-time output — most likely to announce production downgrades within 90 days, leading commodity price moves.")
        ]
    },
    {
        "id": "mining-company-cfo",
        "name": "Mining Company CFO",
        "stage": "finance",
        "icon": "💼",
        "summary": "Manages the mining company's finances — capital allocation, hedging, treasury, financial reporting, investor relations.",
        "decisions": [
            "Capital-allocation across projects",
            "Hedging strategy per commodity",
            "Dividend vs. buyback vs. debt reduction",
            "FX exposure management"
        ],
        "kpis": ["Net debt/EBITDA", "Free cash flow yield", "Cost of capital"],
        "sources": ["LME", "Yahoo Finance", "StockAnalysis.com", "SEC EDGAR", "SEDAR+", "MineSpans (McKinsey)", "S&P Global MI", "Koyfin", "Macrotrends"],
        "combinations": ["Real-Time Commodity Trade-Flow Intelligence", "ESG Portfolio Risk & Greenwashing Detector"],
        "inferences": [
            ("Hedging-opportunity timing", "LME forward curve + Macrotrends 100-year history + S&P MI production forecast", "Backwardation + above-100-year-real-average price = optimal hedging window — surfaces CFO hedging decisions."),
            ("Cost-of-capital benchmarking", "MSCI ESG + Sustainalytics + Yahoo bond yields + S&P MI asset data", "AAA-rated miners enjoy ~50 bps lower cost of debt than CCC — surfaces ESG-investment ROI in basis points."),
            ("Capital-allocation framework", "MineSpans cost curves + S&P MI asset data + LME prices + WoodMac demand", "Per-asset marginal-capital-productivity ranking — surfaces assets deserving capex vs. divestment."),
            ("Disclosure-quality benchmarking", "SEC EDGAR 10-K + USGS MCS + S&P MI production", "Per-mine reported vs. government-reported reconciliation — discrepancies >10% surface reporting errors or undeclared depletion.")
        ]
    },

    # ─── ESG & SUSTAINABILITY ───────────────────────────────────
    {
        "id": "esg-analyst",
        "name": "ESG Analyst",
        "stage": "esg",
        "icon": "🌱",
        "summary": "Rates mining companies on ESG performance. Identifies laggards, leaders, and rating-divergence cases.",
        "decisions": [
            "ESG-rating methodology selection",
            "Materiality threshold per metric",
            "Engagement vs. divestment recommendation",
            "Controversy escalation triggers"
        ],
        "kpis": ["ESG-rating accuracy", "Controversy detection rate", "Engagement success rate"],
        "sources": ["GRI Standards", "SASB Standards", "CDP", "MSCI ESG", "Sustainalytics", "IRMA", "Towards Sustainable Mining", "TNFD"],
        "combinations": ["ESG Portfolio Risk & Greenwashing Detector"],
        "inferences": [
            ("ESG-rating divergence detector", "MSCI ESG + Sustainalytics + IRMA mine-site audits", "Companies where MSCI says AAA but Sustainalytics says High Risk — methodology-gaming candidates worth investigating."),
            ("Forward ESG-risk composite", "Sustainalytics unmanaged-risk + MSCI controversy + Mining.com news", "Companies with rising unmanaged-risk + no current controversy = next ESG-headline candidates — visible 3–6 months before incidents."),
            ("Water-stress verification", "GRI withdrawal + SASB water-stress disclosure + USGS Water streamflow + Sentinel-2 NDVI", "Mines reporting flat withdrawal during drought periods with declining NDVI flagged for greenwashing review."),
            ("Tailings-disclosure quality", "ICMM + GTR + IRMA audit + TNFD biodiversity", "AAA-audited but upstream-construction high-consequence dams — divergence cases worth investigating regardless of audit score.")
        ]
    },
    {
        "id": "sustainability-manager",
        "name": "Sustainability Manager",
        "stage": "esg",
        "icon": "🌍",
        "summary": "Implements the company's sustainability strategy. Manages reporting, target-setting, stakeholder engagement.",
        "decisions": [
            "Net-zero target year and pathway",
            "Reporting framework selection (GRI/SASB/CDP/TNFD)",
            "Stakeholder-engagement priorities",
            "Sustainability-linked financing structure"
        ],
        "kpis": ["Scope 1+2+3 emissions intensity", "Water recycling rate", "TCFD/TNFD alignment score"],
        "sources": ["CDP", "GRI Standards", "SASB Standards", "TNFD", "Ember Climate", "GEM Coal Tracker", "NASA POWER", "OpenInfraMap"],
        "combinations": ["ESG Portfolio Risk & Greenwashing Detector", "Mine Electrification & Decarbonisation Pathway", "Climate-Resilient Mining Asset Screening"],
        "inferences": [
            ("Scope-3 emissions modelling", "CDP Scope 1+2+3 + Ember grid carbon + GEM steel plant (downstream)", "Per-mine cradle-to-gate carbon footprint — surfaces 30% emissions-intensity spread between best/worst Cu mines."),
            ("Decarbonisation-pathway prioritisation", "OpenInfraMap grid proximity + NASA POWER solar + Ember carbon + GEM coal retirements", "Mines within 50 km of high-voltage in low-carbon grids with high solar = prime for full electrification — structural ESG advantage."),
            ("CBAM-cost forecasting", "Ember grid carbon + CDP emissions + IEA demand + commodity prices", "Per-mine CBAM cost as carbon border adjustments expand — surfaces structural cost penalties visible 5+ years ahead."),
            ("Climate-resilience disclosure", "WorldClim 2050 + ERA5 80-yr + TNFD biodiversity + mine water demand", "Per-asset 30-year climate-resilience score — surfaces assets requiring forward-looking disclosure under TCFD/TNFD.")
        ]
    },
    {
        "id": "biodiversity-specialist",
        "name": "Biodiversity Specialist",
        "stage": "esg",
        "icon": "🦋",
        "summary": "Manages biodiversity risk and offsets. Implements TNFD, mitigates impacts on protected areas and Key Biodiversity Areas.",
        "decisions": [
            "Biodiversity-offset ratio per project",
            "Mitigation hierarchy application",
            "Rehabilitation species mix",
            "Compensatory-conservation investment"
        ],
        "kpis": ["No-net-loss score", "Offset hectares per impact hectare", "KBAs within 10 km"],
        "sources": ["IBAT", "WDPA", "TNFD", "GRI Standards", "Global Forest Watch", "NASA Earthdata", "WorldClim v2"],
        "combinations": ["ESG Portfolio Risk & Greenwashing Detector", "Climate-Resilient Mining Asset Screening"],
        "inferences": [
            ("Biodiversity-risk index per mine", "IBAT proximity + TNFD sensitivity + WDPA + mine location", "Surfaces ~5% of global mines within 10 km of KBAs — account for >50% of mining-sector biodiversity risk."),
            ("Protected-area encroachment detector", "WDPA polygons + Sentinel-2 disturbance + GFW forest loss + mining cadastre", "Illegal mining in protected areas — Amazon application surfaces >$2B of undocumented gold."),
            ("Future-climate offset viability", "WorldClim 2050 + offset locations + endemic species ranges", "Offsets viable under 2050 climate — surfaces offset designs vulnerable to climate shift."),
            ("Net-impact accounting", "TNFD LEAP + IBAT + GFW + NASA Earthdata NDVI", "Per-project net-impact score — surfaces projects where mitigation hierarchy insufficient and offsets required.")
        ]
    },
    {
        "id": "community-relations-manager",
        "name": "Community Relations Manager",
        "stage": "esg",
        "icon": "🤝",
        "summary": "Manages the social licence to operate. Stakeholder engagement, grievance mechanisms, local employment, community development.",
        "decisions": [
            "Community-development investment priorities",
            "Local-employment targets per trade",
            "Grievance-mechanism design",
            "Resettlement planning"
        ],
        "kpis": ["Local-employment %", "Grievance resolution time", "Community-investment per tonne"],
        "sources": ["Land Matrix", "EITI", "IRMA", "Mining.com", "Reuters Metals", "Radio Browser", "GRI Standards"],
        "combinations": ["ESG Portfolio Risk & Greenwashing Detector", "Resource-Nationalisation Early-Warning", "Artisanal & Illegal Mining Detection"],
        "inferences": [
            ("Community-conflict early-warning", "Land Matrix deals + Mining.com news + GFW forest loss + indigenous land claims", "Mining deals in indigenous land-claim areas + recent forest loss + activist news = next flashpoints — visible 6–12 months before confrontations."),
            ("Local-news monitoring", "Radio Browser geolocated stations + local news parsing + mining-cadastre boundaries", "Local radio breaks stories days before international newswires — surfaces community-level mining intelligence."),
            ("Resettlement-risk screening", "Land Matrix + WDPA + IBAT + TNFD + mine footprint", "Per-project resettlement-risk score — surfaces projects requiring enhanced FPIC protocols."),
            ("EITI governance deterioration", "EITI compliance status + Land Matrix disputes + Reuters local news", "EITI compliance withdrawal + Land Matrix disputes = governance deterioration signal — visible 12 months before nationalisation moves.")
        ]
    },

    # ─── GOVERNMENT & REGULATION ────────────────────────────────
    {
        "id": "mining-cadastre-officer",
        "name": "Mining Cadastre Officer",
        "stage": "government",
        "icon": "🏛️",
        "summary": "Manages the mining-claim register. Approves, suspends, and cancels licenses; collects rents and royalties.",
        "decisions": [
            "License approval/rejection",
            "Suspension triggers",
            "Rent/royalty assessment",
            "Boundary-dispute resolution"
        ],
        "kpis": ["License-processing time", "Rent collection rate", "Boundary-dispute backlog"],
        "sources": ["USGS MRDS", "NRCan Geoscience", "CGS (South Africa)", "GS Namibia", "SEGEMAR", "Mindat.org", "Land Matrix"],
        "combinations": ["Artisanal & Illegal Mining Detection"],
        "inferences": [
            ("Illegal-mining detection", "Sentinel-2 disturbance + GFW forest loss + WDPA + cadastre boundaries", "Difference between forest loss in concessions vs. legally-permitted area — applied to Amazon, surfaces >$1B undocumented artisanal gold annually."),
            ("License-boundary verification", "OSM mining tags + Sentinel-2 disturbance + cadastre polygons", "OSM-tagged mine features that don't match cadastre = informal or undocumented mining — surfaces unlicensed activity."),
            ("Rehabilitation-compliance monitoring", "NASA Earthdata Landsat NDVI + cadastre + rehabilitation commitments", "Mines with declining NDVI despite 'rehabilitation' claims = ESG red flag — surfaces non-compliant rehabilitation."),
            ("Cross-border smuggling detection", "UN Comtrade + AIS vessel tracks + cadastre production figures", "Discrepancies between reported trade and physical ship movements surface off-book shipments — forensic tool for tax-fraud investigations.")
        ]
    },
    {
        "id": "geological-survey-director",
        "name": "Geological Survey Director",
        "stage": "government",
        "icon": "🗺️",
        "summary": "Runs the national geological survey. Publishes official maps, manages public-domain datasets, advises on resource policy.",
        "decisions": [
            "Annual survey-program priorities",
            "Public-data release schedule",
            "Critical-mineral mapping investment",
            "International collaboration scope"
        ],
        "kpis": ["Map coverage %", "Data-download counts", "Citation impact factor"],
        "sources": ["USGS MRDS", "USGS SIP", "USGS NGMDB", "OneGeology", "Macrostrat", "EarthChem", "Mindat.org", "EMAG2 v3", "BGI WGM"],
        "combinations": ["Exploration Targeting for Blind Porphyry Cu"],
        "inferences": [
            ("Pre-competitive critical-mineral data", "USGS SIP focus areas + EMAG2 + BGI gravity + USGS MRDS", "Earth MRI focus areas with low MRDS occurrence density + favorable gravity = prime US grassroots exploration targets — pre-competitive data the USGS provides."),
            ("Metallogenic-epoch dating", "USGS NGMDB geochronology + OneGeology bedrock + Mindat occurrences", "Age-histogram of dated intrusions reveals metallogenic epochs (e.g. Laramide 74–58 Ma) without needing commercial data."),
            ("National prospectivity mapping", "EMAG2 + BGI + OneGeology + EarthChem + Heat Flow", "Free 3-source prospectivity raster — surfaces deep-crustal boundaries controlling deposit localisation."),
            ("Trans-border geological continuity", "OneGeology cross-border lithology + Macrostrat stratigraphy + Mindat localities", "Same lithological group continues across borders — surfaces trans-border metallogenic belts for international cooperation.")
        ]
    },
    {
        "id": "environmental-regulator",
        "name": "Environmental Regulator",
        "stage": "government",
        "icon": "🛡️",
        "summary": "Issues and enforces environmental permits for mining. Inspection, compliance monitoring, enforcement actions.",
        "decisions": [
            "Permit-approval conditions",
            "Inspection frequency per site",
            "Enforcement-action escalation",
            "Penalty assessment"
        ],
        "kpis": ["Permit-processing time", "Compliance rate %", "Enforcement actions per year"],
        "sources": ["Sentinel-5P TROPOMI", "Global Forest Watch", "WDPA", "IBAT", "ICMM Tailings", "Global Tailings Review", "USGS Water Data", "NASA FIRMS"],
        "combinations": ["ESG Portfolio Risk & Greenwashing Detector", "Artisanal & Illegal Mining Detection", "Tailings Dam Safety Early-Warning"],
        "inferences": [
            ("Methane-super-emitter enforcement", "Sentinel-5P TROPOMI + coal-mine locations + permit boundaries", "Top 1% of CH₄ super-emitters — surfaces mines requiring immediate inspection and abatement orders."),
            ("Protected-area encroachment enforcement", "WDPA + Sentinel-2 + GFW + mining cadastre", "Per-mine encroachment extent in protected areas — surfaces permit-violation enforcement priorities."),
            ("Tailings-risk-prioritised inspection", "ICMM + GTR inventory + USGS seismicity + downstream population", "Top 50 high-consequence upstream dams in seismic zones — prioritised inspection list."),
            ("Fire-event compliance check", "NASA FIRMS + coal-waste-dump locations + permit conditions", "Persistent low-FRP fires at coal waste = unrehabilitated ESG liability — surfaces enforcement actions.")
        ]
    },
    {
        "id": "critical-minerals-policy-advisor",
        "name": "Critical Minerals Policy Advisor",
        "stage": "government",
        "icon": "📋",
        "summary": "Advises government on critical-mineral strategy. Designs stockpiles, permits, tax incentives, and trade policy.",
        "decisions": [
            "Critical-mineral list updates",
            "Strategic-stockpile levels",
            "Permitting-fast-track eligibility",
            "Tax-credit design"
        ],
        "kpis": ["Import-reliance reduction %", "Strategic stockpile days of supply", "Permit-time reduction"],
        "sources": ["USGS Critical Minerals", "EU CRM List", "IEA Critical Minerals", "World Bank MinDev", "OECD Raw Materials", "USGS MCS", "S&P Global MI", "UN Comtrade"],
        "combinations": ["Critical Mineral Supply Chain Monitor", "Resource-Nationalisation Early-Warning"],
        "inferences": [
            ("Trans-Atlantic policy-priority matrix", "USGS critical minerals + EU CRM list + IEA demand forecasts", "Minerals on both lists (Li, Co, Ni, Mn, graphite, REE) face coordinated Western policy support — investment themes with multi-government backing."),
            ("Supply-concentration HHI", "USGS MCS + UN Comtrade + S&P MI asset database", "Per-commodity HHI — REE at ~6,000 (extreme concentration) — surfaces supply-security red flags for policy action."),
            ("Policy-priority × supply-gap matrix", "USGS critical minerals + IEA demand + S&P MI supply", "Minerals on USGS list with IEA-forecast deficits and concentrated supply = highest policy-attention — drives grant, loan, DPA funding."),
            ("Strategic-stockpile sizing", "USGS MCS + IEA demand + AISStream trade flows + geopolitical risk", "Per-mineral stockpile target = days-of-supply under supply-disruption scenario — surfaces stockpile-sizing recommendations.")
        ]
    },

    # ─── INSURANCE & RISK ───────────────────────────────────────
    {
        "id": "mining-insurance-underwriter",
        "name": "Mining Insurance Underwriter",
        "stage": "risk",
        "icon": "🛡️",
        "summary": "Underwrites mining insurance — property, business interruption, tailings liability, political risk. Prices risk per site.",
        "decisions": [
            "Policy-pricing per site",
            "Coverage-limit acceptance",
            "Deductible structure",
            "Exclusion wording"
        ],
        "kpis": ["Loss ratio", "Premium per $TIV", "Policy-renewal rate"],
        "sources": ["ICMM Tailings", "Global Tailings Review", "USGS Earthquakes", "ICEYE", "Sentinel Hub", "Open-Meteo", "WorldClim v2", "IRMA", "MSCI ESG"],
        "combinations": ["Tailings Dam Safety Early-Warning", "Climate-Resilient Mining Asset Screening", "Resource-Nationalisation Early-Warning"],
        "inferences": [
            ("Tailings-risk-pricing matrix", "ICMM + GTR + USGS seismicity + ICEYE InSAR + downstream population", "Per-dam risk score — the insurance industry is now building this exact composite for tailings-risk pricing."),
            ("Climate-resilience premium loading", "WorldClim 2050 + ERA5 80-yr + ICMM tailings + mine water demand", "Per-mine 30-year climate-resilience score — surfaces assets requiring premium loading for climate-risk."),
            ("Political-risk pricing", "adsb.lol military + EITI compliance + Reuters news + Land Matrix", "Per-country political-risk score — surfaces nationalisation-risk premium loading."),
            ("Pre-failure deformation pricing signal", "ICEYE daily InSAR + ICMM dam status + Open-Meteo rainfall", "Per-dam real-time risk score — surfaces policies requiring mid-term premium adjustment or cancellation.")
        ]
    },
    {
        "id": "political-risk-analyst",
        "name": "Political Risk Analyst",
        "stage": "risk",
        "icon": "⚠️",
        "summary": "Assesses political risk for mining investments — nationalisation, tax-regime change, conflict, sanctions.",
        "decisions": [
            "Country-risk rating per jurisdiction",
            "Investment-exposure recommendation",
            "Sanction-risk assessment",
            "Political-violence probability"
        ],
        "kpis": ["Forecast accuracy", "Early-warning lead time", "Portfolio risk score"],
        "sources": ["adsb.lol", "OpenSky Network", "EITI", "Land Matrix", "Reuters Metals", "Mining.com", "Radio Browser", "UN Comtrade", "LME"],
        "combinations": ["Resource-Nationalisation Early-Warning", "Critical Mineral Supply Chain Monitor"],
        "inferences": [
            ("Resource-nationalisation early-warning", "adsb.lol military activity + EITI compliance + Reuters local news", "2022 Mali renegotiation preceded by 4 months of elevated military flight activity — visible 4–6 months before production impact."),
            ("Governance-deterioration signal", "EITI compliance withdrawal + Land Matrix disputes + Reuters rhetoric", "EITI withdrawal + Land Matrix disputes = governance deterioration — visible 12 months before nationalisation."),
            ("Sanction-evasion detection", "UN Comtrade + AISStream + adsb.lol + LME warehouse stocks", "Trade-flow discrepancies + AIS gaps + military flights = sanction-evasion signal — surfaces supply-chain risk for critical minerals."),
            ("Community-conflict risk", "Land Matrix + GFW forest loss + Radio Browser local news + Reuters", "Mining deals in indigenous land-claim areas + recent forest loss + activist news = next flashpoints — visible 6–12 months ahead.")
        ]
    },

    # ─── ACADEMIC & RESEARCH ────────────────────────────────────
    {
        "id": "economic-geology-researcher",
        "name": "Economic Geology Researcher",
        "stage": "research",
        "icon": "🔬",
        "summary": "Academic researcher studying ore deposits. Publishes in Economic Geology, Mineralium Deposita, etc.",
        "decisions": [
            "Research-question selection",
            "Dataset compilation scope",
            "Field-area selection",
            "Collaboration partners"
        ],
        "kpis": ["Publications per year", "Citation count", "Grant income"],
        "sources": ["USGS MRDS", "ARDF (Alaska)", "NRCan Geoscience", "CGS (South Africa)", "GS Namibia", "SEGEMAR", "EarthChem", "Mindat.org", "Macrostrat", "Global Heat Flow", "EMAG2 v3", "BGI WGM"],
        "combinations": ["Exploration Targeting for Blind Porphyry Cu"],
        "inferences": [
            ("Metallogenic-epoch analysis", "USGS NGMDB geochronology + EarthChem whole-rock + Macrostrat stratigraphy + Mindat occurrences", "Per-epoch deposit-density mapping — surfaces metallogenic epochs (Laramide, Andean, Bushveld) for comparative study."),
            ("Cross-border belt correlation", "OneGeology + Macrostrat + Mindat + EMAG2 + BGI", "Trans-border metallogenic belt continuity — surfaces comparative deposit endowment across political boundaries."),
            ("Mineral-vector clustering", "Mindat 1M+ localities + 5,700-species vector fingerprinting", "Cluster localities by mineral vector — discover mineralogical provinces that don't correspond to named metallogenic belts."),
            ("Thermal-favorability raster", "Global Heat Flow + EMAG2 + BGI + EarthChem A-type granites", "Heat-flow > 75 mW/m² + gravity low + A-type granite = prime Sn-U-F prospectivity — surfaces new deposit classes for study.")
        ]
    },
    {
        "id": "mineral-economist",
        "name": "Mineral Economist",
        "stage": "research",
        "icon": "💼",
        "summary": "Studies the economics of mineral supply — cost curves, supply elasticity, substitution, recycling. Works at universities, IEA, World Bank.",
        "decisions": [
            "Supply-curve modelling approach",
            "Substitution-elasticity assumptions",
            "Recycling-rate projections",
            "Price-forecast methodology"
        ],
        "kpis": ["Model R²", "Forecast accuracy", "Publication impact"],
        "sources": ["USGS MCS", "USGS Minerals Yearbook", "BGS WMP", "World Mining Congress", "OECD Raw Materials", "IEA Critical Minerals", "World Bank MinDev", "S&P Global MI", "MineSpans (McKinsey)", "CRU Group", "Wood Mackenzie", "Macrotrends"],
        "combinations": ["Critical Mineral Supply Chain Monitor", "Real-Time Commodity Trade-Flow Intelligence"],
        "inferences": [
            ("Triangulated cost-curve estimates", "MineSpans + CRU + WoodMac cost curves with confidence intervals", "Mines where all three agree are 'consensus'; high variance = analyst-disagreement hotspots worth investigating."),
            ("Supply-concentration HHI trend", "USGS MCS + WMC production + OECD raw materials + S&P MI asset data", "Per-commodity HHI over time — surfaces structural concentration trends (e.g. rising DRC Co share)."),
            ("Substitution-elasticity estimation", "Macrotrends 100-year prices + LME forward curves + IEA demand forecasts", "Long-run price elasticity of substitution per commodity — surfaces which minerals are substitutable vs. constrained."),
            ("Recycling-potential assessment", "OECD material flows + USGS MCS reserves + IEA demand + Macrotrends prices", "Per-mineral recycling rate vs. technical potential — surfaces minerals where recycling could close the supply gap.")
        ]
    },

    # ─── MEDIA & JOURNALISM ─────────────────────────────────────
    {
        "id": "mining-journalist",
        "name": "Mining Journalist",
        "stage": "media",
        "icon": "📰",
        "summary": "Reports on the mining industry for trade and mainstream publications. Covers M&A, production, ESG, market moves.",
        "decisions": [
            "Story selection per week",
            "Source validation protocols",
            "Headline framing",
            "Investigation depth"
        ],
        "kpis": ["Stories per week", "Source diversity", "Scoop count"],
        "sources": ["Reuters Metals", "Mining.com", "SEDAR+", "ASX (JORC)", "SEC EDGAR", "FCA NSS", "Morningstar (Hemscott)", "S&P SNL Mining", "Companies House (UK)", "OpenCorporates"],
        "combinations": ["M&A Pipeline & Deal-Completion Forecaster", "ESG Portfolio Risk & Greenwashing Detector"],
        "inferences": [
            ("M&A scoop generator", "S&P SNL M&A + SEDAR+ filings + OpenSky charter flights + Reuters rumors", "Charter flights to project within 30 days of major resource announcement signal pre-decision site visits — surfaces M&A stories 3–6 months before announcement."),
            ("Greenwashing investigation", "GRI + SASB + CDP disclosures + Sentinel-2 disturbance + ICMM tailings risk", "Disclosure vs. ground-truth discrepancies = greenwashing stories — surfaces ~5% of projects with questionable disclosures."),
            ("Corporate-structure expose", "OpenCorporates + Companies House + SEDAR+ filings + Land Matrix", "Offshore subsidiary networks + minimal production = promotional-stock patterns — surfaces investigative stories."),
            ("Insider-trading signal", "Morningstar director dealings + SEDAR+ filings + commodity prices", "Directors buying within 30 days of positive resource announcement = suspicious — surfaced by this composite for ~3% of TSX/ASX listings annually.")
        ]
    },
    {
        "id": "investigative-reporter",
        "name": "Investigative Reporter",
        "stage": "media",
        "icon": "🕵️‍♂️",
        "summary": "Deep-dive investigative reporter covering mining-sector wrongdoing — corruption, environmental crime, sanctions evasion.",
        "decisions": [
            "Investigation scope and duration",
            "Source-protection protocols",
            "Document verification methodology",
            "Publication-timing strategy"
        ],
        "kpis": ["Investigations published", "Source-anonymity preserved", "Policy-impact cases"],
        "sources": ["OpenCorporates", "Companies House (UK)", "UN Comtrade", "AISStream", "MarineTraffic", "adsb.lol", "Land Matrix", "EITI", "WDPA", "Global Forest Watch", "Reuters Metals", "Radio Browser"],
        "combinations": ["Artisanal & Illegal Mining Detection", "Resource-Nationalisation Early-Warning", "Real-Time Commodity Trade-Flow Intelligence"],
        "inferences": [
            ("Sanction-evasion exposé", "UN Comtrade + AISStream + adsb.lol + OpenCorporates", "Trade-flow discrepancies + AIS gaps + military flights + offshore ownership = sanction-evasion story — surfaces Venezuela and Iranian shipments."),
            ("Illegal-mining investigation", "GFW forest loss + Sentinel-2 + WDPA + cadastre boundaries + Land Matrix + Radio Browser", "Per-region illegal-mining footprint — surfaces >$2B of undocumented Amazon gold and DRC 3T minerals."),
            ("Beneficial-ownership expose", "OpenCorporates + Companies House + SEDAR+ + EITI revenue + Land Matrix deals", "Multi-source corporate-structure graph — surfaces beneficial-ownership chains hiding state or sanctioned ownership."),
            ("Trade-flow reconciliation matrix", "UN Comtrade + AIS vessel tracks + mine production + cadastre figures", "Discrepancies between reported trade and physical ship movements surface off-book shipments — forensic tool for tax-fraud and smuggling investigations.")
        ]
    }
]

# Sanity check counts
assert len(PERSONAS) >= 50, f"Need 50+ personas, have {len(PERSONAS)}"
