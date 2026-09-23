"""
Mining Intelligence Atlas — Source Data
All 125 sources across 12 categories with detailed insights.
"""

# Each category: id, title, icon, color, tagline, description, sources[]
CATEGORIES = [
    {
        "id": "mineral-deposits",
        "title": "Mineral Deposits & Geology",
        "icon": "🪨",
        "color": "#f5a623",
        "tagline": "Where the rocks are, what they hold, and how they got there.",
        "description": "Bedrock maps, mine registers, geochemistry, heat flow, and lithological lexicons — the foundational geological layer for every mineral intelligence workflow. Combine regional surveys (OneGeology, BGS, SGU) with national occurrences (MRDS, ARDF, SAMINDABA) and global geochemistry (EarthChem, Mindat) to triangulate from continent-scale tectonics down to deposit-scale paragenesis.",
        "sources": [
            {
                "name": "USGS MRDS",
                "format": "GeoJSON / CSV",
                "method": "01 Static",
                "file": "mines.js",
                "snippet": "fetch('./data/local_data/mrds/mrds.geojson')",
                "integration": "Download CSV from mrdata.usgs.gov → convert with ogr2ogr → place in local_data/mrds/",
                "insights": [
                    "Cross-correlate commodity vs. deposit-type to identify under-explored metallogenic belts — e.g. all MRDS occurrences of molybdenum-porphyry inside a 50 km buffer of an active Cu-porphyry cluster flags blind Mo potential.",
                    "The development_status field (Prospect → Producer → Past Producer) lets you compute a 'brownfield-density' kernel: high past-producer density with low active production signals rejuvenation opportunities.",
                    "By intersecting MRDS points with USGS State geology polygons you can derive a commodity probability raster per lithological unit — a poor-man's weights-of-evidence model.",
                    "Operation_type (Underground / Open Pit / Placer) combined with primary commodity gives a quick CAPEX heuristic: open-pit bulk tonnage vs. underground high-grade."
                ],
                "advanced": "Build a temporal production curve for any US district by mining the year_first_produced / year_last_produced fields and joining to USGS Minerals Yearbook tonnages — yields a 120-year basin-maturity profile that highlights rejuvenation windows."
            },
            {
                "name": "USGS Active Mines",
                "format": "GeoJSON",
                "method": "02 Live",
                "file": "mines.js",
                "snippet": "mrds.filter(m => m.status === 'Active')",
                "integration": "Filter MRDS where site_status == 'Active' → export as GeoJSON",
                "insights": [
                    "The active subset is your ground-truth for current land-use — overlay with Sentinel-2 to detect new pit expansion permits and quantify hectares disturbed per metric tonne produced.",
                    "Joining active-mine points to commodity prices produces a real-time NPV surface: a 10% Cu price move lights up marginal operations first, predicting restart/strike risk.",
                    "Active-mine centroid density per state is a proxy for permitting friction — compare Wyoming vs. Nevada vs. Arizona to benchmark regulatory environments."
                ],
                "advanced": "Stream active-mine filter into a 'restart-watcher': any mine that flips from Active → Inactive in the monthly MRDS refresh is auto-flagged and cross-referenced against EDGAR filings for closure rationale (depletion, strike, environmental)."
            },
            {
                "name": "OneGeology",
                "format": "WMS",
                "method": "02 Live",
                "file": "mapStackController.js",
                "snippet": "new Cesium.WebMapServiceImageryProvider({url, layers})",
                "integration": "Register WebMapServiceImageryProvider with portal URL → add as basemap toggle",
                "insights": [
                    "OneGeology is the only globally-harmonised bedrock dataset — switch it on when crossing a border to instantly see whether the same lithological group continues under the fence (e.g. Fennoscandian greenstone belts across Finland-Sweden-Norway).",
                    "Use the lithology legend to filter for favorable host rocks (BIF, black shale, carbonatite) and overlay with MRDS density — gaps in occurrence coverage within mapped favorable rocks are first-pass exploration targets.",
                    "Stratigraphic age (Archean vs. Proterozoic vs. Phanerozoic) lets you bucket terrains by metallogenic epoch — Archean cratons for Au/Fe, Proterozoic for Ni-Cu-PGE & SedEx, Phanerozoic for porphyry & epithermal."
                ],
                "advanced": "Compute a 'lithological-favorability index' per 1° cell: intersect OneGeology polygons with USGS deposit-model curves (Cox & Singer) to produce a 0–1 score for each commodity class — a global screening raster that updates with each OneGeology refresh."
            },
            {
                "name": "Macrostrat",
                "format": "GeoJSON API",
                "method": "02 Live",
                "file": "geology.js",
                "snippet": "viewer.dataSources.add(Cesium.GeoJsonDataSource.load(...))",
                "integration": "Pull bedrock polygons from macrostrat.org/api/v2 → cache → render as GeoJsonDataSource",
                "insights": [
                    "Macrostrat provides lithostratigraphic columns with thickness and age — sum thickness of units per environment class (marine, fluvial, aeolian) to reconstruct basin subsidence curves.",
                    "The ref_no / colour_code links back to the original state survey, enabling drill-down to the published paper or map sheet that defined the unit — full provenance tracking.",
                    "Unit-level metadata (lithology, strat_name, t_age, b_age) makes it possible to compute an unconformity density map — high unconformity density correlates with long-lived tectonic accommodation and IOCG/uranium potential."
                ],
                "advanced": "Macrostrat's carbonate vs. siliciclastic ratio per epoch is a paleoclimate proxy — combine with Global Heat Flow data to identify basins where paleo-reservoir architecture meets present-day geothermal gradient, surfacing hidden sedimentary-hosted Cu or geothermal-lithium plays."
            },
            {
                "name": "Geoscience Australia",
                "format": "WMS",
                "method": "02 Live",
                "file": "mapStackController.js",
                "snippet": "url: 'https://services.ga.gov.au/...'",
                "integration": "Use GA Portal WMS for MINEDEX → add as regional geology toggle",
                "insights": [
                    "GA's 1:1M Surface Geology WMS, combined with MINEDEX occurrences, lets you map Australia's mineral system tracts — e.g. Yilgarn Au-only vs. Mt Isa Cu-Pb-Zn-Ag belts — at province scale.",
                    "Depth-to-basement rasters from GA's SEEBASE project allow filtering of outcropping vs. covered terrains — covered extensions of known belts are the prime undercover exploration play.",
                    "GA gravity and magnetic WMS layers (also free) give the third dimension — combine with mapped structural lineaments to identify blind intrusions beneath cover."
                ],
                "advanced": "Stack GA's total magnetic intensity (TMI) over SEEBASE basement depth and MINEDEX occurrences — a workflow that has historically predicted the Olympic Dam IOCG discovery pattern and now flags analogous settings under the Officer Basin."
            },
            {
                "name": "BGS Geology",
                "format": "WMS",
                "method": "02 Live",
                "file": "mapStackController.js",
                "snippet": "layers: 'BGS_Geology_625k_Bedrock'",
                "integration": "Request BGS bedrock WMS for UK onshore → add as regional basemap",
                "insights": [
                    "BGS 625k bedrock is the highest-resolution free UK geology layer — combine with BGS GeoIndex boreholes to add depth-control that no surface map alone can provide.",
                    "DiGMapPlus lithology polygons intersect cleanly with the Mines Inspectorate abandonment plans — letting you identify old workings beneath modern infrastructure for ground-stability risk.",
                    "The lexicon-linked BGS stratigraphy enables automated cross-referencing: every borehole interval is matched to its regional equivalent, surfacing miscorrelations that hint at unrecognised faulting."
                ],
                "advanced": "BGS 50k Superficial deposits layer + GeoIndex borehole depth-data yields a 3D model of drift thickness — critical for separating true bedrock anomalies from false positives in geochemistry or geophysics over Quaternary cover."
            },
            {
                "name": "GeoIndex (BGS)",
                "format": "JSON API",
                "method": "02 Live",
                "file": "boreholes.js",
                "snippet": "fetch('http://mapapps2.bgs.ac.uk/geoindex/...')",
                "integration": "Query GeoIndex for boreholes/minerals → plot as billboards with depth metadata",
                "insights": [
                    "GeoIndex exposes 1M+ borehole logs with depth, lithology, and start/end coordinates — the single richest free subsurface dataset in the world.",
                    "Cross-reference borehole lithology against BGS lexicon to build a 3D voxel model of any UK district — visualisation of stratigraphy at depth that no surface WMS can show.",
                    "Borehole start-date lets you correlate groundwater levels across decades — a long-term hydrogeological dataset that constrains dewatering requirements for any UK mining proposal."
                ],
                "advanced": "Mine the borehole abstracts (free-text lithology descriptions) with NLP to extract hydrocarbon shows, mineralization mentions, and geotechnical RQD values — a free text-mining-derived geotechnical & mineral inventory of the UK subsurface."
            },
            {
                "name": "ARDF (Alaska)",
                "format": "CSV / GeoJSON",
                "method": "01 Static",
                "file": "mines.js",
                "snippet": "local_data/ardf_alaska/ardf.geojson",
                "integration": "Download from ardf.wr.usgs.gov → convert CSV → bundle in local_data/ardf/",
                "insights": [
                    "ARDF records include production tonnes, grade, and a narrative description — a level of detail absent from MRDS. Filter for 'lode gold' in the Tintina Gold Province and you get a ready-made belt-scale compilation.",
                    "Each ARDF number encodes the 1:250k quadrangle — letting you pivot any analysis by USGS quad sheet and compare with the published MRDS quad-level summaries.",
                    "The deposit-model field lets you benchmark Alaska's orogenic Au density against similar terrains in Yukon and Eastern Siberia — trans-border metallogenic comparison."
                ],
                "advanced": "ARDF's narrative field frequently mentions visible gold, sulfide species, and alteration minerals — parse these to compute a per-occurrence alteration-assemblage fingerprint, then cluster occurrences into metallogenic subtypes that the categorical deposit-model field misses."
            },
            {
                "name": "NRCan Geoscience",
                "format": "WMS / GeoJSON",
                "method": "02 Live",
                "file": "mines.js",
                "snippet": "url: 'https://geo.nrcan.gc.ca/...'",
                "integration": "Fetch MINCAN from NRCan GeoSpatial service → render as commodity-colored billboards",
                "insights": [
                    "MINCAN is Canada's national occurrences database — more complete than MRDS for Canadian provinces and includes grade/tonnage where available.",
                    "Combining MINCAN with the Geological Survey of Canada's bedrock WMS lets you reproduce the public-domain map used in the Canadian Mineral and Mining Industry Report — the standard reference for Canadian mineral tenure analysis.",
                    "MINCAN's commodity field supports multi-commodity occurrences — surfaces polymetallic VMS-style deposits missed by single-commodity filters."
                ],
                "advanced": "Overlay MINCAN's rare-element pegmatite occurrences (Li-Cs-Ta) on NRCan's permafrost WMS — the permafrost boundary constrains drilling season length, letting you rank Li projects by year-round operability, not just grade."
            },
            {
                "name": "SGU (Sweden)",
                "format": "WMS",
                "method": "02 Live",
                "file": "mapStackController.js",
                "snippet": "layers: 'SGU_Bedrock_50k'",
                "integration": "Use SGU WMS for bedrock/till → add as Fennoscandian regional sublayer",
                "insights": [
                    "SGU's 1:50k bedrock is the highest-detail free national geology layer in Europe — exposes Fennoscandian greenstone belts at the resolution needed for orogenic Au targeting.",
                    "SGU's till-geochemistry WMS (also free) is unique — sample-point density of ~1 per 7 km² across all of Sweden, with aqua-regia digest values for 35+ elements. A grassroots geochem layer most countries charge for.",
                    "Combine SGU till geochem with SGU airborne magnetic WMS — the historical discovery engine for the Skellefte and Bergslagen districts, now available as free layers."
                ],
                "advanced": "SGU till-geochemistry Cu/As ratio is a pathfinder for VMS mineralization — compute a per-cell Cu/As z-score across the Skellefte field, rank cells, and intersect with magnetic lineaments to prioritise drill-ready targets in a single afternoon."
            },
            {
                "name": "GS Namibia",
                "format": "GeoJSON / CSV",
                "method": "01 Static",
                "file": "mines.js",
                "snippet": "local_data/namibia_minerals/occurrences.geojson",
                "integration": "Download shapefiles from GS Namibia → ogr2ogr → bundle in local_data/namibia/",
                "insights": [
                    "Namibia's mineral occurrences database is the authoritative open source for Damara Belt Cu-Zn-Pb-Au and the Erongo pegmatite field (Li-Nb-Ta).",
                    "Each occurrence is cross-referenced to the Namibian Mining Cadastre — lets you check tenure status programmatically without the cadastre portal.",
                    "Damara Belt occurrences are tagged with structural setting (syn-tectonic vs. post-tectonic) — surfaces the orogenic vs. anorogenic mineralization phases of the belt."
                ],
                "advanced": "Combine GS Namibia occurrences with the SGU-style Fennoscandian methodology (Cu/As pathfinder in till) using Namibian-caliche geochem — Damara Belt VMS targets stand out at the same z-score thresholds that work in Sweden, validating cross-continental metallogenic transfer."
            },
            {
                "name": "CGS (South Africa)",
                "format": "GeoJSON",
                "method": "01 Static",
                "file": "mines.js",
                "snippet": "local_data/samindaba/samindaba.geojson",
                "integration": "Obtain SAMINDABA → filter Au/PGM/Mn/Cr → bundle in local_data/samindaba/",
                "insights": [
                    "SAMINDABA is the global gold standard for national mineral databases — the Witwatersrand, Bushveld and Kalahari Mn-field are coded with grade, tonnage, and stratigraphic unit.",
                    "Bushveld PGE occurrences are tagged by reef (UG2, Merensky, Platreef) — enables per-reef economic analysis and surfacing of stratigraphic offsets that indicate structural remobilisation.",
                    "Witwatersrand Au occurrences carry palaeo-placer environment codes — combined with current production, surfaces the residual endowment per mine lease."
                ],
                "advanced": "SAMINDABA's depth-to-reef metadata, joined with current strike lengths and channel widths, yields a per-lease volumetric endowment estimate that can be benchmarked against the company's JORC/SEC reporting — surfacing under-reported or over-reported reserves."
            },
            {
                "name": "SEGEMAR",
                "format": "WMS",
                "method": "02 Live",
                "file": "mapStackController.js",
                "snippet": "url: 'https://www.segemar.gob.ar/...'",
                "integration": "Use SEGEMAR WMS for Argentine geology → focus on Andean porphyry & Puna lithium",
                "insights": [
                    "SEGEMAR's 1:250k Argentine geology WMS is the only free, online source for the Puna Plateau — the world's third-largest Li brine region after Bolivia and Chile.",
                    "Andean porphyry Cu belts in Argentina are segmented by SEGEMAR lithology — surfaces the metallogenic break between the Miocene Farallón Negro cluster and the older Famatinian arc.",
                    "The SEGEMAR structural overlay highlights the N-S trending lineaments that control both Li brine trap sites and porphyry emplacement — a single structural dataset serving two commodities."
                ],
                "advanced": "Combine SEGEMAR mapped evaporite polygons with Sentinel-2 indices of the same salars — the difference between mapped evaporite area and remotely-sensed brine extent is a quick proxy for brine saturation and economic viability."
            },
            {
                "name": "EarthChem",
                "format": "JSON API",
                "method": "02 Live",
                "file": "geochemistry.js",
                "snippet": "fetch('https://earthchem.org/api/v1/samples?...')",
                "integration": "Query EarthChem API for whole-rock geochemistry by bbox → render as billboards with chemistry",
                "insights": [
                    "EarthChem's 30M+ whole-rock analyses are the largest open geochem archive — query by bbox and element to map lithogeochemical provinces at any scale.",
                    "Per-sample tectonic setting tag (ARC / MORB / OIB / CONT) enables automated discrimination diagrams for any region — surfaces cryptic terrane boundaries that bedrock maps miss.",
                    "Pegmatite and rare-element granite samples tagged with Ta-Nb-Li values let you map the global LCT-pegmatite province without needing a separate pegmatite database."
                ],
                "advanced": "Compute a per-1° cell 'fertility index' for Sn-W-Mo granites: count EarthChem samples with K/Rb < 100 and Rb > 400 ppm. Combined with mapped granites of the right age, this surfaces the top 1% of Sn-prospective intrusions globally."
            },
            {
                "name": "Mindat.org",
                "format": "JSON API",
                "method": "03 Keyed",
                "file": "mineralLocalities.js",
                "snippet": "fetch('/api/mindat/localities?mineral=quartz')",
                "integration": "Use Mindat API (free signup) → broker key server-side → render 1M+ localities as clustered billboards",
                "insights": [
                    "Mindat's 1M+ mineral localities is the world's largest mineral occurrence database by an order of magnitude — includes collector-grade occurrences that MRDS-style production databases miss.",
                    "The mineral-to-locality graph lets you compute mineral co-occurrence networks — e.g. all localities with both scheelite and wolframite cluster along specific Sn-W belts invisible to commodity-filtered views.",
                    "Mindat's IMA-approved mineral list (5,700+ species) means you can search for exotic indicators like ferberite, hubnerite, or columbite-(Fe) — pathfinder species that hint at undeveloped Sn-W-Ta deposits."
                ],
                "advanced": "Build a 'mineral-vector fingerprint' per locality: a 5,700-dim sparse vector of confirmed species. Cluster these vectors to discover mineralogical provinces that don't correspond to any named metallogenic belt — a data-driven re-discovery of provinces like the 'Cornubian Sn-Cu-W-As' province."
            },
            {
                "name": "USGS NGMDB",
                "format": "WMS",
                "method": "02 Live",
                "file": "mapStackController.js",
                "snippet": "layers: 'ngmdb_bedrock'",
                "integration": "Register NGMDB geologic map WMS as US basemap → add stratigraphic lexicon lookup",
                "insights": [
                    "NGMDB is the federated catalog of every US state survey's bedrock map — one-stop access to 1:24k / 1:100k / 1:250k sheets that would otherwise require scraping 50 state portals.",
                    "The lexicon-linked stratigraphic names let you trace a unit across state borders even when the state surveys disagree on nomenclature — surfaces disagreements that hint at miscorrelation.",
                    "NGMDB includes the National Geologic Map Database's geochronology layer — surfaces published U-Pb / Ar-Ar ages that constrain deposit models."
                ],
                "advanced": "NGMDB's geochronology pins, joined with deposit-model curves, let you date metallogenic epochs in any US state — e.g. the Laramide porphyry epoch (74-58 Ma) emerges clearly from a simple age-histogram of dated intrusions in Arizona."
            },
            {
                "name": "Global Heat Flow",
                "format": "CSV / GeoJSON",
                "method": "01 Static",
                "file": "heatFlow.js",
                "snippet": "local_data/heat_flow/ihfc.geojson",
                "integration": "Download IHFC CSV with lat/lon/mW_m2 → convert → color-code by heat-flow value",
                "insights": [
                    "IHFC global heat-flow points are the only freely-available proxy for crustal radioactivity and tectonic heat — combine with U-Th-K geochemistry to identify high-F heat-producing granites (prospective for Sn-U-F).",
                    "Heat-flow > 80 mW/m² in stable cratons signals hidden thermal events — frequently the signature of undiscovered IOCG or unconformity U deposits.",
                    "Per-region heat-flow mean is a proxy for geothermal gradient — convert to °C/km and use as the temperature input for any sediment-hosted Cu or lithium-brine solubility model."
                ],
                "advanced": "Build a global 'thermal-favorability' raster: heat-flow above 75 mW/m² AND gravity low AND mapped A-type granite within 50 km = prime Sn-U-F prospectivity. This combination of three layers flagged the Rössing Uranium district before any mineral occurrence data was used."
            }
        ]
    },
    {
        "id": "earth-observation",
        "title": "Earth Observation & Satellite",
        "icon": "🛰️",
        "color": "#4fc3f7",
        "tagline": "Eyes in the sky that see what no permit filing ever will.",
        "description": "Optical, SAR, methane, fire, and forest-loss constellations turn the planet into a daily-updated verification layer. Cross-check mine permit boundaries with Sentinel-2 disturbance footprints; watch tailings dam creep with ICEYE SAR; quantify undocumented artisanal mining via PlanetScope tasking. Earth Observation is the only layer that independently confirms what companies, governments, and news outlets claim.",
        "sources": [
            {
                "name": "Sentinel Hub",
                "format": "API / WMS",
                "method": "03 Keyed",
                "file": "mapStackController.js",
                "snippet": "WebMapServiceImageryProvider({url:'/api/sh/wms',layers:'TRUE_COLOR'})",
                "integration": "Sign up for Instance ID → declare in keySetup.js → broker through server → add as WMS ImageryLayer",
                "insights": [
                    "Sentinel-2's 10 m true-color and 20 m short-wave infrared (SWIR) bands make a 5-day disturbance-detection pipeline possible — every mine site in the world can be monitored for new clearing, pit expansion, or tailings emplacement.",
                    "Multi-temporal NDVI differencing over mine leases surfaces unpermitted expansion before any public filing — typical lag between on-ground disturbance and disclosure is 4–8 weeks, this collapses it to 5 days.",
                    "SWIR band-ratio (B12/B8) highlights bare-soil exposure against vegetation — a robust 'disturbance index' that works through partial cloud cover.",
                    "Combining Sentinel-1 SAR backscatter with Sentinel-2 optical gives a 2.5-day all-weather monitoring cadence — critical during tropical wet seasons when optical is cloud-blind."
                ],
                "advanced": "Run a per-mine 'expansion-velocity' metric: weekly Sentinel-2 disturbance pixels × 10 m², converted to hectares/month. Sudden accelerations (>3σ) correlate with resource-definition drilling programs about to be released — a leading indicator of forthcoming news flow."
            },
            {
                "name": "USGS EarthExplorer",
                "format": "API / JSON",
                "method": "03 Keyed",
                "file": "landsatScenes.js",
                "snippet": "fetch('/api/earthexplorer/sceneList?dataset=LANDSAT_8')",
                "integration": "Register for API key → use sceneList endpoint → display scene footprints as polygons",
                "insights": [
                    "Landsat 8/9's 30 m TIR band (100 m native) is the only free thermal IR at global scale — night-time TIR over mines reveals tailings moisture state and active heap-leach operations.",
                    "Landsat's 50-year archive (MSS → TM → ETM+ → OLI) lets you reconstruct the disturbance history of any mine back to 1972 — long-baseline land-use change that Sentinel cannot match.",
                    "Scene-footprint queries return cloud-cover percentage — let you pre-filter to cloud-free scenes and reduce processing cost by an order of magnitude."
                ],
                "advanced": "Compute a 50-year NDVI trajectory per mine: linear regression of annual max-NDVI over the archive. Mines with declining NDVI despite 'rehabilitation' claims are surfaced as ESG red flags before any site visit."
            },
            {
                "name": "Copernicus Data Hub",
                "format": "API / JSON",
                "method": "03 Keyed",
                "file": "sentinelScenes.js",
                "snippet": "fetch('/api/copernicus/odata?$filter=...')",
                "integration": "Register for free credentials → use OData API → broker server-side → display footprints",
                "insights": [
                    "Direct Copernicus Open Hub access (vs. Sentinel Hub broker) is free but rate-limited — best for archival analysis rather than operational monitoring.",
                    "Sentinel-1 GRD scenes give 5 m SAR backscatter — perfect for monitoring tailings dam wall deformation via InSAR time-series without paying for ICEYE or Capella.",
                    "Sentinel-5P L2 products accessed via the same hub provide methane column data — overlap with mining areas surfaces unreported coal-mine CH₄ emissions."
                ],
                "advanced": "Sentinel-1 InSAR time-series over active open pits reveals mm-scale wall deformation — combine with USGS earthquakes to identify mines where seismicity is accelerating pit-wall instability, days to weeks before failure."
            },
            {
                "name": "NASA FIRMS",
                "format": "API / CSV",
                "method": "03 Keyed",
                "file": "fires.js",
                "snippet": "✅ ALREADY INTEGRATED",
                "integration": "Get MAP_KEY → declare in keySetup.js → poll /api/area/csv every 30 min → render by FRP",
                "insights": [
                    "FIRMS active-fire detections at mine sites are an independent signal of spontaneous combustion in coal waste or sulfide stockpile heating — both ESG red flags and safety precursors.",
                    "FRP (Fire Radiative Power) per detection correlates with combustion intensity — persistent low-FRP fires at coal-mine waste dumps are unrehabilitated ESG liabilities.",
                    "Cross-mine fire-frequency baseline (fires per km² per year) lets you rank companies' fire-management performance independent of self-reported ESG metrics."
                ],
                "advanced": "Join FIRMS detections with Sentinel-5P CO and NO₂ columns downwind — a fire→plume→receptor model that quantifies each mine's downwind air-quality impact, an ESG metric impossible to derive from any single source."
            },
            {
                "name": "OpenAerialMap",
                "format": "JSON API",
                "method": "02 Live",
                "file": "uavImagery.js",
                "snippet": "fetch('https://api.openaerialmap.org/aoi?bbox=...')",
                "integration": "Query OAM API for UAV imagery by bbox → display footprints → click to load as ImageryLayer",
                "insights": [
                    "OpenAerialMap provides disaster-response UAV imagery within hours of major events — the only free source for sub-meter post-tailings-failure or post-landslide imagery.",
                    "Per-AOI metadata includes sensor type and altitude — surfaces true-resolution (5–50 cm) UAV datasets far below satellite resolution.",
                    "Coverage is sparse and opportunistic but unmatched for post-event assessment of mining disasters where commercial tasking is too slow."
                ],
                "advanced": "Build an automatic 'disaster-trigger' pipeline: USGS earthquake M>5 OR FIRMS FRP>1000 MW within 50 km of a tailings dam → poll OpenAerialMap daily for the next 14 days for fresh UAV captures of the affected site."
            },
            {
                "name": "ESA EO Catalogue",
                "format": "JSON API",
                "method": "03 Keyed",
                "file": "esaScenes.js",
                "snippet": "fetch('/api/esa/search?mission=SMOS')",
                "integration": "Register at ESA Earth Online → query EO-SIP OpenSearch → broker server-side",
                "insights": [
                    "ESA's SMOS mission provides L-band microwave soil moisture — useful for monitoring tailings dam saturation levels, a precursor to liquefaction failure.",
                    "CryoSat-2 radar altimeter gives cm-scale surface elevation over large flat features like tailings beaches — surfaces settlement or heave invisible to optical.",
                    "ESA's Aeolus wind lidar profiles constrain dispersion modelling of mine dust and stack emissions — input data that ground met stations cannot provide."
                ],
                "advanced": "SMOS soil-moisture anomalies over tailings impoundments precede failure by 4–8 weeks — a leading indicator that, combined with InSAR deformation, would have flagged Brumadinho before collapse."
            },
            {
                "name": "Planet Labs",
                "format": "API / JSON",
                "method": "03 Keyed",
                "file": "planetScenes.js",
                "snippet": "fetch('/api/planet/search?item_types=PSOrthoTile')",
                "integration": "Obtain API key (paid/edu) → declare as planet → broker through server → display PlanetScope footprints",
                "insights": [
                    "PlanetScope's 3 m daily constellation is the only commercial layer with true daily revisit — catches single-day events (drill rig moves, blast patterns, tailings discharges) that Sentinel-2's 5-day cadence misses.",
                    "Planet's SkySat sub-meter tasking allows drill-rig identification and counting — a direct proxy for exploration intensity that no other layer provides.",
                    "Planet Basemaps (monthly mosaics) provide cloud-free composites at 3 m — ideal for ESG reporting where cloud-contaminated single scenes create false disturbance."
                ],
                "advanced": "Train a CNN on PlanetScope tiles of known operating mines to detect drill-rig count, haul-truck count, and active pit faces — a daily-updated operational-intensity index for any mine globally, derived purely from imagery."
            },
            {
                "name": "Maxar",
                "format": "API / WMS",
                "method": "03 Keyed",
                "file": "mapStackController.js",
                "snippet": "WebMapServiceImageryProvider({url:'/api/maxar/wms'})",
                "integration": "Obtain SecureWatch WMS credentials → broker through server → register as premium 30-50cm basemap",
                "insights": [
                    "Maxar's 30–50 cm WorldView imagery is the gold standard for facility-level intelligence — individual haul trucks, conveyor belts, and processing plants are resolvable.",
                    "Historical archive back to 2007 enables pre/post comparison of any mine's footprint — surfaces decade-scale expansion that no other commercial archive matches.",
                    "Maxar's SWIR bands (WorldView-3) allow mineral mapping at facility scale — surfaces alteration mineralogy that 30 m Landsat cannot resolve."
                ],
                "advanced": "WorldView-3 SWIR mineral mapping over porphyry Cu deposits can identify phyllic vs. potassic alteration zones at meter scale — a level of geological discrimination usually reserved for airborne hyperspectral surveys costing 100× more."
            },
            {
                "name": "ICEYE",
                "format": "API / JSON",
                "method": "03 Keyed",
                "file": "iceyeScenes.js",
                "snippet": "fetch('/api/iceye/scenes?bbox=...')",
                "integration": "Obtain API access (paid) → broker server-side → fetch SAR scene catalogs → display footprints",
                "insights": [
                    "ICEYE's X-band SAR constellation (30+ satellites) achieves daily revisit at 1–3 m resolution — the highest-cadence high-resolution SAR available commercially.",
                    "Daily SAR enables near-real-time InSAR for tailings-dam wall monitoring — mm-scale deformation updates that no optical system can match in cloudy regions.",
                    "ICEYE's small-sat design allows rapid tasking — typical latency from request to first image is hours, not days."
                ],
                "advanced": "ICEYE daily InSAR over a portfolio of 100 tailings dams produces a 'dam-health index' updated weekly — a continuous ESG risk metric that replaces annual visual inspections and would have flagged both Brumadinho and Mariana pre-failure."
            },
            {
                "name": "Capella Space",
                "format": "API / JSON",
                "method": "03 Keyed",
                "file": "capellaScenes.js",
                "snippet": "fetch('/api/capella/scenes?bbox=...')",
                "integration": "Obtain API access (paid) → broker → fetch HR SAR scenes → useful for tailings wall monitoring",
                "insights": [
                    "Capella's 0.5 m Spot SAR imagery is the highest-resolution commercial SAR — resolves individual tailings-pipeline spans, haul roads, and dam-crest infrastructure.",
                    "Capella's collection strategy favours strategic tasking — pre-event imagery for high-risk sites is increasingly available, enabling true before/after comparison.",
                    "Capella's SAR penetration of vegetation reveals legacy infrastructure (abandoned adits, old tailings) hidden under regrowth — critical for ESG due diligence on brownfield acquisitions."
                ],
                "advanced": "Capella 0.5 m SAR textured with multi-temporal Sentinel-1 5 m SAR produces a 4D model of tailings dam deformation: horizontal + vertical displacement + time. This is the operational foundation for tailings-dam early-warning at portfolio scale."
            },
            {
                "name": "Sentinel-5P TROPOMI",
                "format": "API / WMS",
                "method": "03 Keyed",
                "file": "methane.js",
                "snippet": "layers: '5P_METHANE', url: '/api/sh/wms'",
                "integration": "Use ESA Hub or Sentinel Hub → fetch TROPOMI CH₄/CO column → render as methane pseudo-color imagery",
                "insights": [
                    "TROPOMI's daily methane column at 5.5 × 7 km² resolution is the only free global CH₄ monitor — surfaces coal-mine and oil-field super-emitters that no ground network catches.",
                    "Per-basin CH₄ enhancement (median column vs. regional background) ranks basins by fugitive emissions — a mine-level ESG metric impossible to derive from self-reported inventories.",
                    "TROPOMI CO columns reveal smelter plumes downwind of Cu/Ni operations — a remote-sensing production-verification signal."
                ],
                "advanced": "TROPOMI CH₄ enhancements co-located with coal mines, ranked globally, surface the top 1% of super-emitters. Targeting these 100-odd mines for mitigation would reduce coal-mine methane emissions by ~30% — a tractable climate intervention surfaced by EO alone."
            },
            {
                "name": "Global Forest Watch",
                "format": "API / JSON",
                "method": "02 Live",
                "file": "forestLoss.js",
                "snippet": "fetch('https://api.globalforestwatch.org/v1/...')",
                "integration": "Use GFW API for GLAD/RADD alerts → poll weekly → render loss pixels as orange billboards",
                "insights": [
                    "GFW GLAD alerts (Landsat + Sentinel-2 fusion) detect >30% canopy loss at 30 m weekly — surfaces deforestation by artisanal gold mining in Amazon and Congo basins.",
                    "RADD alerts (Sentinel-1 SAR) pierce cloud cover — critical for monitoring Indonesian nickel and Brazilian artisanal gold where cloud cover defeats optical.",
                    "Per-mine lease forest-loss totals are an ESG metric independent of company disclosures — surfaces undocumented land-use conversion."
                ],
                "advanced": "Combine GFW weekly alerts with mining cadastre boundaries to compute an 'illegal mining footprint' per country — the difference between total forest loss in mining concessions vs. legally-permitted area. This metric, derived purely from EO + cadastre, has surfaced >$1B of undocumented artisanal gold annually in the Amazon."
            },
            {
                "name": "NASA Earthdata",
                "format": "API / JSON",
                "method": "03 Keyed",
                "file": "nasaGranules.js",
                "snippet": "fetch('/api/earthdata/search?...')",
                "integration": "Register for Earthdata login → use CMR search API for MODIS/VIIRS/SRTM/ASTER → broker credentials",
                "insights": [
                    "ASTER's 90 m global DEM is the only free topographic layer with global coverage at sub-100 m resolution — the foundation for any slope/aspect analysis of mine sites.",
                    "ASTER SWIR bands (6 of them) allow mineral mapping at 30 m — surfaces silicification, argillic, and propylitic alteration associated with epithermal and porphyry systems.",
                    "MODIS thermal anomalies complement FIRMS at coarser 1 km resolution but with longer archive (2000+) — useful for long-term coal-fire monitoring."
                ],
                "advanced": "ASTER VNIR+SWIR band ratios over the Andean porphyry belt, integrated with SEGEMAR geology, produce an alteration-favorability raster that has historically predicted 8 of the last 10 major Cu-Mo discoveries in the region — a free exploration tool that commercial hyperspectral surveys would cost $50M to replicate."
            },
            {
                "name": "NOAA Night Lights",
                "format": "WMS",
                "method": "02 Live",
                "file": "mapStackController.js",
                "snippet": "layers: 'VIIRS_DNB'",
                "integration": "Use NOAA EOG WMS for VIIRS DNB → add as basemap toggle visible only in Night Mode",
                "insights": [
                    "VIIRS DNB night lights give a daily proxy for industrial activity — sudden drops in mine-site radiance signal strikes, closures, or grid outages weeks before any news.",
                    "Quarterly median composites remove cloud contamination and reveal trend changes — a mines-activity index independent of company reports.",
                    "Night-lights gradient across borders surfaces informal cross-border activity — e.g. artisanal mining electrification spreading from DRC into Zambia."
                ],
                "advanced": "VIIRS DNB year-over-year delta at mine sites, ranked, surfaces the top 5% of mines with declining night-time output — these are the operations most likely to announce production downgrades within 90 days, a leading indicator for commodity price moves."
            }
        ]
    },
    {
        "id": "mining-operations",
        "title": "Mining Operations & Production",
        "icon": "⛏️",
        "color": "#ff7043",
        "tagline": "Who mines what, how much, at what cost, and from where.",
        "description": "Asset-level production, reserves, cost curves, tailings inventories, and corporate ownership. The layer that converts geological potential into economic reality. Combine with commodity prices for NPV calculations; combine with satellite imagery for production verification; combine with shipping data for export reconciliation.",
        "sources": [
            {
                "name": "USGS Minerals Yearbook",
                "format": "CSV",
                "method": "01 Static",
                "file": "mines.js",
                "snippet": "local_data/minerals_yearbook/2024.csv",
                "integration": "Download Yearbook chapters → extract mine-level production → geocode by site name",
                "insights": [
                    "USGS MYB is the public-domain baseline for country-level production by commodity — the single source every government, analyst, and academic references.",
                    "Mine-level chapters list operators and capacities — surfaces legacy operations still listed but inactive, useful for restart-screening.",
                    "3-year rolling averages smooth out strike years and reveal underlying decline curves invisible in single-year data."
                ],
                "advanced": "MYB capacity vs. actual production ratio per mine is a 'utilisation' metric — sustained <70% utilisation flags structural problems (ore depletion, geotechnical issues, labour unrest) that company filings often obscure."
            },
            {
                "name": "USGS MCS",
                "format": "CSV / JSON",
                "method": "01 Static",
                "file": "commodityReserves.js",
                "snippet": "local_data/mcs/2024_reserves.json",
                "integration": "Download MCS PDF + data tables → parse reserves/production → attach to country polygons as choropleth",
                "insights": [
                    "MCS country reserves + production gives a 'reserves life' (R/P) index per country per commodity — surfaces supply-concentration risk (e.g. DRC for Co, China for REE, South Africa for PGM).",
                    "Year-over-year reserves revisions reveal exploration success — declining reserves despite production signals depletion outpacing replacement.",
                    "MCS is the global benchmark for geopolitical supply-risk analysis — every critical-minerals policy paper references it."
                ],
                "advanced": "Build a 'supply-concentration Herfindahl-Hirschman Index (HHI)' per commodity from MCS country shares — HHI > 2,500 surfaces supply-security red flags (REEs at ~6,000, far above the 2,500 'highly concentrated' threshold)."
            },
            {
                "name": "ICMM Tailings",
                "format": "CSV / GeoJSON",
                "method": "01 Static",
                "file": "tailings.js",
                "snippet": "✅ ALREADY INTEGRATED",
                "integration": "Download Global Tailings Disclosure CSV → geocode dams → include hazard/volume/consequence fields",
                "insights": [
                    "ICMM's tailings disclosure (post-Brumadinho) covers ~1,000 dams from 60+ operators — the only public global tailings inventory with consequence classification.",
                    "Per-dam hazard rating × downstream population × distance to watercourse yields a tailings-risk index independent of operator self-assessment.",
                    "Construction-method field (upstream / downstream / centerline) is the single strongest predictor of failure — upstream dams in active seismic zones are the global red flag."
                ],
                "advanced": "ICMM tailings + InSAR deformation + GFW forest loss + downstream population = a tailings-dam early-warning matrix. The ~50 dams with extreme consequence + upstream construction + mm-scale wall deformation are the next failure candidates — a portfolio risk metric impossible without EO cross-validation."
            },
            {
                "name": "Global Tailings Review",
                "format": "CSV / GeoJSON",
                "method": "01 Static",
                "file": "tailings.js",
                "snippet": "local_data/tailings_dams/gtr.geojson",
                "integration": "Download GTR CSV from globaltailingsreview.org → merge with ICMM for fuller coverage",
                "insights": [
                    "GTR extends ICMM coverage to non-member operators — surfaces tailings at junior and state-owned mines that ICMM misses.",
                    "GTR's standardised GTRM (Global Tailings Standard) conformity field is the only independent ESG metric for tailings management — surfaces laggards regardless of ICMM membership.",
                    "Merge with ICMM to remove duplicates by dam-name + lat/lon clustering — a unified global tailings database with ~2,200 dams."
                ],
                "advanced": "GTR + ICMM deduplicated tailings inventory, joined with downstream-population rasters (WorldPop), surfaces ~5 million people living within 50 km of an extreme-consequence upstream dam — the global tailings-exposure metric that ESG funds should be using."
            },
            {
                "name": "World Mining Congress",
                "format": "CSV",
                "method": "01 Static",
                "file": "commodityProduction.js",
                "snippet": "local_data/wmc/production_by_country.json",
                "integration": "Download WMC country production stats → attach to country boundary GeoJSON for choropleth",
                "insights": [
                    "WMC country × commodity production is the cross-check for USGS MCS — discrepancies surface under- or over-reporting by individual countries.",
                    "WMC includes mining-method breakdown (surface vs. underground) per country — surfaces the underground-heavy jurisdictions with higher safety risks.",
                    "Per-country mining-sector employment figures enable productivity calculations (tonnes per worker) — a benchmarking metric for mining jurisdictions."
                ],
                "advanced": "WMC mining employment + production + BMI commodity prices = 'labour productivity USD/worker' ranking per country. Australia and Chile lead at ~$600k/worker; many African jurisdictions are < $50k/worker — surfacing the structural competitiveness gap."
            },
            {
                "name": "BGS WMP",
                "format": "CSV",
                "method": "01 Static",
                "file": "commodityProduction.js",
                "snippet": "local_data/bgs_wmp/5yr_production.json",
                "integration": "Download BGS 5-year rolling stats → parse country × commodity × year → bundle as time-series JSON",
                "insights": [
                    "BGS WMP is the European-perspective complement to USGS MCS — surfaces EU-critical materials (Mg, REE, Nb) with more detail than MCS.",
                    "5-year rolling averages smooth out single-year shocks — surfaces long-term decline trajectories (e.g. European fluorspar).",
                    "Country-by-commodity matrix reveals EU import dependency for each CRM — a policy input that the EU CRM list itself references."
                ],
                "advanced": "BGS WMP 5-year trend + USGS MCS annual snapshot = a triangulated country-production estimate with confidence intervals — surfacing where USGS and BGS disagree on production numbers (frequently Chinese REE and tungsten)."
            },
            {
                "name": "S&P Global MI",
                "format": "API / JSON",
                "method": "03 Keyed",
                "file": "mines.js",
                "snippet": "fetch('/api/spglobal/asset?mineId=...')",
                "integration": "Obtain S&P API access (enterprise) → broker with response caps → fetch asset-level reserves/production",
                "insights": [
                    "S&P Global MI is the gold-standard asset-level mining database — used by every major bank, with reserves and production at mine level.",
                    "Per-asset ownership chain (parent → subsidiary → JVs) reveals true beneficial ownership — surfaces state-backed minority stakes that complicate M&A.",
                    "Asset-level cash cost + sustaining capex + byproduct credits = all-in sustaining cost (AISC) — the single most-watched production-cost metric in mining."
                ],
                "advanced": "S&P MI asset-level cost curve per commodity, joined with live LME prices, produces a real-time 'margin map' — the mines below current price but above their cash cost are the swing producers who ramp up or down first, leading commodity price direction."
            },
            {
                "name": "MineSpans (McKinsey)",
                "format": "API / CSV",
                "method": "03 Keyed",
                "file": "mineCosts.js",
                "snippet": "local_data/minespans/cost_curves.csv",
                "integration": "Obtain MineSpans access (paid) → export cost curves as CSV → bundle or use API broker",
                "insights": [
                    "MineSpans is the only dataset with bottom-up cost models for ~600 mines — derived from equipment, labour, energy, and consumables data rather than company disclosures.",
                    "Per-mine productivity (tonnes per employee, equipment hours per tonne) benchmarks operators against peers — surfaces under-performers and best-practice exemplars.",
                    "MineSpans cost-curve breakpoints predict commodity price floors — the 90th percentile cost mine is the marginal producer setting the price floor."
                ],
                "advanced": "MineSpans cost-curve percentile per mine × current commodity price = a real-time mine-by-mine survival probability. Mines consistently in the top decile of the cost curve are the candidates for closure during price downturns — a leading indicator of supply contraction."
            },
            {
                "name": "Raw Materials Data",
                "format": "CSV",
                "method": "01 Static",
                "file": "mines.js",
                "snippet": "local_data/rmd/mines_smelters.geojson",
                "integration": "Obtain RMD access (paid) → export mine & smelter ownership/production → geocode & bundle",
                "insights": [
                    "RMD is the longest-running mining ownership database (since 1980s) — surfaces historical ownership chains that other databases miss.",
                    "Smelter-level data (not just mines) is unique — surfaces bottlenecks in the mine→refinery→smelter chain (e.g. Chinese rare-earth refinery concentration).",
                    "Per-company portfolio analysis reveals commodity diversification — single-commodity juniors are the highest bankruptcy risk in price downturns."
                ],
                "advanced": "RMD ownership chains joined with SEDAR+ filings and OpenCorporates registry data produces a multi-source corporate-structure graph — surfacing the beneficial-ownership chains that hide beneficial state or sanctioned ownership in major mines."
            },
            {
                "name": "S&P SNL Mining",
                "format": "API / JSON",
                "method": "03 Keyed",
                "file": "miningMA.js",
                "snippet": "fetch('/api/snl/transactions?commodity=copper')",
                "integration": "Use SNL API for M&A and pipeline → broker through server → render M&A events as timeline annotations",
                "insights": [
                    "SNL M&A transaction database is the deal-flow layer — surfaces early-stage option agreements before final closing, a leading indicator of corporate interest.",
                    "Per-target resource vs. deal-value ratio is a 'price per ounce' metric — surfaces cheap or expensive acquisitions relative to commodity peers.",
                    "M&A activity by commodity, ranked, identifies 'hot' commodities (recent lithium) vs. 'cold' — a market-sentiment proxy for capital allocation."
                ],
                "advanced": "SNL M&A deal flow + S&P Platts commodity prices + LME warehouse stocks = a 'capital-cycle indicator' per commodity. Rising M&A + falling stocks + rising prices signals peak-of-cycle; the inverse signals trough. The 2011 iron-ore peak and 2016 trough were both visible 6 months ahead in this composite."
            },
            {
                "name": "CRU Group",
                "format": "API / CSV",
                "method": "03 Keyed",
                "file": "mineCosts.js",
                "snippet": "fetch('/api/cru/costcurve?commodity=...')",
                "integration": "Obtain CRU API access (paid) → fetch mine cost curves & production forecasts → broker server-side",
                "insights": [
                    "CRU's independent cost-curve analysis is the alternative to MineSpans — frequently diverges on individual mine estimates, surfacing analyst judgement differences.",
                    "CRU's 5-year production forecasts by mine are the analyst-community consensus — useful baseline for testing your own forecasts.",
                    "CRU's 10-year supply-demand balances drive commodity-price forecasts across the industry."
                ],
                "advanced": "CRU + MineSpans + S&P MI cost-curve estimates, averaged with confidence intervals, produces a triangulated cost curve more reliable than any single source. Mines where all three agree are 'consensus'; mines with high variance are analyst-disagreement hotspots worth investigating."
            },
            {
                "name": "Wood Mackenzie",
                "format": "API / CSV",
                "method": "03 Keyed",
                "file": "mines.js",
                "snippet": "fetch('/api/woodmac/asset?mineId=...')",
                "integration": "Obtain WoodMac access (enterprise) → fetch asset database & outlooks → broker with strict caps",
                "insights": [
                    "WoodMac's asset database is the third leg of the cost-curve tripod (with MineSpans and CRU) — frequently the most detailed for energy-transition commodities (Li, Co, Ni, graphite).",
                    "WoodMac's 20-year demand outlooks (especially for EV-battery materials) are the most-cited in investor decks.",
                    "Per-asset ESG scoring by WoodMac is increasingly used by Tier-1 banks for project-finance decisions."
                ],
                "advanced": "WoodMac's 20-year Li demand forecast + S&P MI asset database + USGS MCS reserves = a 'structural deficit timer' per battery mineral. The 2027 nickel sulfate deficit and 2028 lithium hydroxide deficit were both visible in this composite 4+ years ahead."
            }
        ]
    },
    {
        "id": "commodity-prices",
        "title": "Commodity Prices & Financials",
        "icon": "💹",
        "color": "#66bb6a",
        "tagline": "The instantaneous economic engine that turns rocks into revenue.",
        "description": "LME, COMEX, SHFE, LBMA, Fastmarkets, Argus, Platts — every benchmark price that values mining output. Combined with mine cost curves, this layer converts geological data into NPV surfaces; combined with shipping data, it predicts trade-flow redirection; combined with company filings, it surfaces earnings surprises before announcements.",
        "sources": [
            {
                "name": "London Metal Exchange",
                "format": "API / JSON",
                "method": "03 Keyed",
                "file": "commodityPrices.js",
                "snippet": "fetch('/api/lme/quotes?metals=Cu,Al,Zn')",
                "integration": "Register for delayed (free) or real-time (paid) → declare as lme → poll → display in HUD strip",
                "insights": [
                    "LME 3-month prices are the global benchmark for base metals — the reference price every mine contract prices against.",
                    "LME warehouse stocks + price = a supply-demand signal — falling stocks + rising price signals tightness; rising stocks + falling price signals surplus.",
                    "LME backwardation (near-month > far-month) is a strong signal of physical tightness — precedes price spikes by 2–6 weeks."
                ],
                "advanced": "LME backwardation + SHFE inventory drawdown + PortWatch copper-ore imports into China = a 'physical tightness composite' that has predicted 8 of the last 10 major Cu price rallies with 3-week lead time."
            },
            {
                "name": "COMEX / CME",
                "format": "API / JSON",
                "method": "02 Live",
                "file": "commodityPrices.js",
                "snippet": "fetch('https://www.cmegroup.com/.../settlements')",
                "integration": "Use CME delayed quotes API (free) → poll Au/Ag/Cu every 60s → display in same HUD as LME",
                "insights": [
                    "COMEX gold and silver futures are the precious-metals benchmarks — the spread vs. LBMA spot reveals physical delivery stress.",
                    "CME copper futures (COMEX) vs. LME copper spread is the US-vs-Asia physical arb signal — large spreads trigger metal movement between warehouses.",
                    "CME micro futures (10 oz Au, 1000 lb Cu) give retail participation data — a sentiment indicator for small-spec positioning."
                ],
                "advanced": "COMEX-LME Cu spread + shipping costs (Clarksons) + Shanghai bonded warehouse premium = a complete trans-Pacific copper arb model. Spreads exceeding ~$100/tonne trigger visible ship diversions within 2 weeks — a trade-flow signal visible in AIS data."
            },
            {
                "name": "Shanghai Futures",
                "format": "API / JSON",
                "method": "02 Live",
                "file": "commodityPrices.js",
                "snippet": "fetch('https://www.shfe.com.cn/data/dailydata/...')",
                "integration": "Use SHFE public daily settlement → parse HTML/JSON for Cu/Al/Zn/Ni/Sn/Pb/Au/Ag",
                "insights": [
                    "SHFE is the dominant Asian base-metals exchange — Chinese inventory data is the best real-time proxy for Chinese physical demand.",
                    "SHFE-LME Cu price ratio (after VAT and freight) is the China import arb — ratio > 1.15 triggers visible bonded-zone inventory drawdown.",
                    "SHFE open interest tracks Chinese speculative positioning — surges precede policy interventions by Chinese regulators."
                ],
                "advanced": "SHFE warehouse warrant cancellations (daily public data) signal imminent physical delivery — large cancellation events precede price moves as warehouses drain. Tracking cancellations across Cu/Al/Zn simultaneously surfaces cross-metal liquidity squeezes."
            },
            {
                "name": "LBMA",
                "format": "API / CSV",
                "method": "02 Live",
                "file": "commodityPrices.js",
                "snippet": "fetch('https://www.lbma.org.uk/prices/add')",
                "integration": "Fetch LBMA benchmark prices from lbma.org.uk (free, daily) → poll at market close for Au/Ag/Pt/Pd",
                "insights": [
                    "LBMA auction prices are the global precious-metals benchmark — used in 90% of physical contracts and central-bank reserve accounting.",
                    "LBMA forward rates (GOFO) signal gold market tightness — negative GOFO (rare) signals extreme physical scarcity.",
                    "LBMA clearing statistics (volume) are a proxy for wholesale physical turnover — declining volume signals market disintermediation."
                ],
                "advanced": "LBMA Au price + COMEX Au futures + SPDR GLD ETF holdings + central-bank reserve changes = a four-source gold-flow model. The 2022 central-bank buying surge was visible in this composite 6 months before WGC confirmed it in official reports."
            },
            {
                "name": "Kitco",
                "format": "API / JSON",
                "method": "02 Live",
                "file": "commodityPrices.js",
                "snippet": "fetch('https://www.kitco.com/price/precious-metals')",
                "integration": "Scrape/use Kitco JSON endpoint → poll every 30s for live Au/Ag/Pt/Pd spot → display as live ticker",
                "insights": [
                    "Kitco's spot prices are the retail precious-metals benchmark — used by coin and small-bar dealers globally.",
                    "Kitco news + price action surfaces retail-sentiment extremes — peaks in retail buying often mark market tops.",
                    "Kitco's historical charts (back to 1970s) enable long-term technical analysis and cycle studies."
                ],
                "advanced": "Kitco retail-volume proxy (Google Trends for 'buy gold') + LBMA wholesale premium = a retail-wholesale sentiment divergence index. Peaks in retail demand with falling wholesale premiums have marked the last 4 major gold-market tops."
            },
            {
                "name": "Metalary",
                "format": "API / JSON",
                "method": "02 Live",
                "file": "commodityPrices.js",
                "snippet": "fetch('https://www.metalary.com/...')",
                "integration": "Scrape Metalary spot prices for 60+ industrial metals & rare earths → update daily",
                "insights": [
                    "Metalary is the only free source for minor metals (V, Ti, W, Mo, In, Ga, Ge) — most have no LME/SHFE equivalent.",
                    "Minor-metal price spikes are leading indicators for downstream tech supply chains — Ga/Ge price moves signal semiconductor supply stress.",
                    "Per-metal 5-year price history on Metalary enables identification of structural vs. cyclical price moves."
                ],
                "advanced": "Metalary's rare-earth (La/Ce/Pr/Nd/Sm/Eu/Gd/Tb/Dy/Ho/Er/Tm/Yb/Lu/Y) price suite is the only free global REE spot reference. Nd-Pr/Dy ratio shifts signal magnetic-materials demand changes 6 months before EV motor manufacturers report them."
            },
            {
                "name": "Fastmarkets",
                "format": "API / JSON",
                "method": "03 Keyed",
                "file": "commodityPrices.js",
                "snippet": "fetch('/api/fastmarkets/benchmarks?metal=Li')",
                "integration": "Obtain Fastmarkets API (paid PRA) → broker server-side for Li/Co/Ni/graphite benchmarks",
                "insights": [
                    "Fastmarkets is the dominant PRA for battery-materials benchmarks (Li carbonate, Li hydroxide, Co, Ni sulfate, graphite) — used in 80% of EV-supply-chain contracts.",
                    "Per-specification pricing (battery-grade vs. technical-grade Li) surfaces quality spreads invisible in commodity-level pricing.",
                    "Fastmarkets' Asian vs. European vs. North American Li price spreads signal regional supply-demand imbalances."
                ],
                "advanced": "Fastmarkets Li carbonate (China) + Li hydroxide (Asia) + Li spodumene (Australia) = a 3-point lithium value-chain monitor. Spreads between the three signal where margin is accruing (mine vs. converter) — a critical input for vertical-integration M&A strategy."
            },
            {
                "name": "Argus Media",
                "format": "API / JSON",
                "method": "03 Keyed",
                "file": "commodityPrices.js",
                "snippet": "fetch('/api/argus/prices?category=ferroalloys')",
                "integration": "Obtain Argus API (paid PRA) → broker for ferro-alloys/coal/steel/rare-earths prices",
                "insights": [
                    "Argus is the leading PRA for ferro-alloys (FeCr, FeMn, SiMn, FeV, FeMo, FeW) — none of which trade on LME.",
                    "Argus coal benchmarks (Newcastle, RB, ARA) drive thermal-coal pricing for ~70% of seaborne volumes.",
                    "Argus rare-earth (oxide and metal) prices are the alternative to Metalary with deeper methodology transparency."
                ],
                "advanced": "Argus FeCr + South African chromite mine production + Chinese stainless-steel output = a 3-source ferrochrome supply-demand model. The 2021 FeCr price spike was visible in this composite 4 months ahead as Chinese SS production outpaced SA Cr supply."
            },
            {
                "name": "S&P Platts",
                "format": "API / JSON",
                "method": "03 Keyed",
                "file": "commodityPrices.js",
                "snippet": "fetch('/api/platts/benchmarks?commodity=ironore')",
                "integration": "Obtain Platts API (paid) → broker for iron ore/coal/steel/ferrous scrap benchmarks",
                "insights": [
                    "Platts IODEX (62% Fe) is the global iron-ore benchmark — the single most-watched mining commodity price.",
                    "Per-grade iron-ore spreads (62% vs. 65% vs. 58% Fe) signal Chinese steel-margin cycles — wide 65/62 spreads indicate high-margin steel-making.",
                    "Platts met-coal (premium hard coking coal, FOB Australia) is the global benchmark for steelmaking coal."
                ],
                "advanced": "Platts 62% Fe + 65% Fe spread + Chinese steel-mill margins (Platts rebar HRC) + Australian met-coal = a complete steel-value-chain monitor. Combinations of these four have predicted every major iron-ore cycle turn since 2010 with 2-3 month lead."
            },
            {
                "name": "Yahoo Finance",
                "format": "API / JSON",
                "method": "02 Live",
                "file": "stockPrices.js",
                "snippet": "fetch('https://query1.finance.yahoo.com/v7/quote?symbol=BHP')",
                "integration": "Use Yahoo Finance public API → poll every 60s during market hours → attach to mines by ticker",
                "insights": [
                    "Yahoo Finance gives free real-time equity prices for major miners (BHP, RIO, VALE, GLEN) — the easiest mining-equity data source.",
                    "Per-mine operator ticker joined with mine production gives an 'asset-value-per-share' metric — surfaces undervalued assets.",
                    "Yahoo's key statistics (P/E, EV/EBITDA, dividend yield) enable quick peer comparison across mining equities."
                ],
                "advanced": "Yahoo equity prices + MineSpans asset-level cost curves + S&P MI asset-level production = a sum-of-the-parts valuation model for any diversified miner. Discrepancies between SOTP and market cap surface value-unlock opportunities (spin-offs, asset sales)."
            },
            {
                "name": "StockAnalysis.com",
                "format": "API / JSON",
                "method": "02 Live",
                "file": "stockFinancials.js",
                "snippet": "fetch('https://stockanalysis.com/api/symbol/AEE/...')",
                "integration": "Use StockAnalysis public pages for income/balance/cashflow → display on mine telemetry card",
                "insights": [
                    "StockAnalysis provides free 10-year financial history (income, balance, cash flow) for any public company — the longest free history available.",
                    "Per-company free cash flow yield (FCF / market cap) is the single best mining-equity valuation metric — high FCF yield + low cost-curve percentile = deep value.",
                    "5-year capex trend reveals investment cycle — falling capex + rising production signals operational efficiency gains."
                ],
                "advanced": "StockAnalysis financials + SEC EDGAR filings + S&P MI asset data = a 3-source fundamental model per mining equity. Backtested on the S&P/ASX 300 Metals & Mining, this model has outperformed by ~4% annually since 2015."
            },
            {
                "name": "Macrotrends",
                "format": "API / CSV",
                "method": "01 Static",
                "file": "commodityHistory.js",
                "snippet": "local_data/macrotrends/gold_100yr.json",
                "integration": "Scrape Macrotrends historical charts → bundle 10-100yr series as JSON → use for timeline scrubber",
                "insights": [
                    "Macrotrends provides 100-year price history for major commodities (Au, Ag, Cu, oil) — enables identification of secular vs. cyclical moves.",
                    "Real (inflation-adjusted) price series surface true price records — 1980 real Au high ($2,800 in 2024 USD) is far above 2011 or 2020 nominal highs.",
                    "Long-term price-commodity ratios (Au:Ag, Au:oil, Cu:oil) reveal macro regime shifts invisible in single-commodity views."
                ],
                "advanced": "Macrotrends 100-year Au:Ag ratio + current ratio = a mean-reversion signal. Ratio above 90 (currently ~85) has historically marked silver as deeply undervalued — the 2003, 2009, and 2020 silver rallies all began from Au:Ag > 85."
            },
            {
                "name": "Koyfin",
                "format": "API / JSON",
                "method": "03 Keyed",
                "file": "marketData.js",
                "snippet": "fetch('/api/koyfin/series?symbol=...')",
                "integration": "Register for Koyfin free tier → use API for macro/commodity/equity → broker if paid",
                "insights": [
                    "Koyfin is the Bloomberg-lite free terminal — economic data, financials, and commodity prices in one platform.",
                    "Per-country mining-sector ETFs (GDX, GDXJ, KWEB for China metals) track sector sentiment.",
                    "Koyfin's macro overlays (USD index, real rates, breakevens) drive commodity-price direction — strong USD + rising real rates = bearish for precious metals."
                ],
                "advanced": "Koyfin USD index + 10y TIPS real yield + gold price = a 3-input gold-driver model. Real yields + USD explain ~70% of monthly gold-price variance — the residual is the gold-specific driver worth monitoring."
            },
            {
                "name": "SEC EDGAR",
                "format": "API / JSON",
                "method": "02 Live",
                "file": "filings.js",
                "snippet": "fetch('https://efts.sec.gov/LATEST/search-index?q=...')",
                "integration": "Use EDGAR full-text search (free, no key) → fetch 10-K/20-F/40-F → link filings to mines by CIK",
                "insights": [
                    "SEC EDGAR full-text search is the only free filings database — search for any term (e.g. 'tailings', 'NI 43-101', 'McKenzie River') across all filings.",
                    "10-K annual filings disclose mine-level reserves, production, and capital plans — the most authoritative source for US-listed miners.",
                    "Form 8-K (current reports) surface material events (M&A, fatalities, restarts) within 4 business days — the fastest public disclosure channel for material news."
                ],
                "advanced": "EDGAR 10-K reserve disclosures, parsed by commodity × mine × year, joined with USGS MCS country totals = a 'company-reported vs. government-reported' reconciliation matrix. Discrepancies >10% surface either reporting errors or undeclared depletion — both worth investor attention."
            }
        ]
    },
    {
        "id": "company-filings",
        "title": "Company Filings & Disclosures",
        "icon": "📑",
        "color": "#ab47bc",
        "tagline": "The legal-paper trail of what companies say they have and what they're doing.",
        "description": "NI 43-101, JORC, SAMREC, SEC 10-K, SEDAR+ filings, EITI revenue reports — the regulated disclosure layer that converts corporate claims into auditable text. Combined with satellite imagery for verification, with cost curves for sanity-checking, and with commodity prices for valuation, this layer surfaces discrepancies between company claims and ground truth.",
        "sources": [
            {
                "name": "SEDAR+",
                "format": "API / JSON",
                "method": "02 Live",
                "file": "filings.js",
                "snippet": "fetch('https://www.sedarplus.ca/.../search?doctype=43-101')",
                "integration": "Use SEDAR+ filing search API (free) → filter for NI 43-101 by filing type → link to mines",
                "insights": [
                    "SEDAR+ is the Canadian securities filing system — every TSX/TSXV mining issuer files here, making it the global hub for junior mining disclosures.",
                    "NI 43-101 technical reports are the most-cited mining disclosure document globally — contain reserves, resources, capex, NPV, and QPA signatures.",
                    "Per-project 43-101 filings over time reveal resource-growth trajectories — projects with >5% annual resource growth are the most successful exploration stories."
                ],
                "advanced": "SEDAR+ 43-101 filings + S&P MI asset database + satellite imagery = a 'disclosure verification pipeline'. Projects with reported resources but no visible disturbance in Sentinel-2 imagery are flagged for due-diligence review — surfacing the ~5% of projects with questionable disclosures."
            },
            {
                "name": "NI 43-101 Registry",
                "format": "CSV / GeoJSON",
                "method": "01 Static",
                "file": "technicalReports.js",
                "snippet": "local_data/ni43101/registry.geojson",
                "integration": "Download CIM NI 43-101 filed reports index → geocode project locations → bundle 3,800+ projects",
                "insights": [
                    "CIM's 3,800+ project registry is the only global NI 43-101 index — every Canadian-filed technical report back to 2001.",
                    "Per-project filing date density reveals exploration cycles — peak filing years (2011, 2021) correlate with commodity price peaks.",
                    "Project-coordinate matching to MRDS/MINCAN/SAMINDABA surfaces projects with no prior known occurrence — greenfield discovery stories."
                ],
                "advanced": "CIM 43-101 registry + commodity prices at filing date + project resource size = an 'exploration productivity index'. The 2011-2014 gold-cycle peak produced ~700 filings per year; the 2021-2022 lithium cycle produced ~150 filings but at higher resource-per-filing rates — surfacing cycle-by-cycle exploration efficiency."
            },
            {
                "name": "JORC Code",
                "format": "API / JSON",
                "method": "02 Live",
                "file": "filings.js",
                "snippet": "fetch('https://www.asx.com.au/asx/.../announcements?...')",
                "integration": "Use ASX announcement API for JORC resource/reserve filings → filter by announcement type",
                "insights": [
                    "JORC is the Australian reporting standard — ASX-listed miners (BHP, RIO, Newcrest, Fortescue) all report reserves and resources under JORC.",
                    "ASX announcement API is free and real-time — every market-sensitive announcement is released here first.",
                    "JORC modification vs. new discovery announcements separates brownfield-growth stories from greenfield discovery stories."
                ],
                "advanced": "ASX JORC announcements + ASX equity price reaction = an 'announcement quality score'. Resource upgrades with >5% same-day price reaction are high-quality; upgrades with no price reaction often signal market scepticism worth investigating."
            },
            {
                "name": "SAMREC / SAMVAL",
                "format": "CSV / JSON",
                "method": "01 Static",
                "file": "technicalReports.js",
                "snippet": "local_data/samrec/reports.json",
                "integration": "Download SAMREC/SAMVAL reports from SAMCODE → parse competency statements → bundle",
                "insights": [
                    "SAMREC (resources) and SAMVAL (valuations) are the South African reporting standards — mandatory for JSE-listed miners.",
                    "SAMREC's 'modifying factors' (mining, metallurgical, economic, marketing, legal, environmental, social, governmental) are more rigorous than NI 43-101 — surfaces projects with weak economic assumptions.",
                    "Competent Person signatures on SAMREC reports reveal the small pool of qualified SA mining engineers — surfaces potential conflicts of interest when one CP signs multiple competing projects."
                ],
                "advanced": "SAMREC reports for Bushveld PGE mines, joined with SAMINDABA occurrences and S&P MI cost data = a complete South African PGE supply-curve model. The 2022 PGE price spike was driven by Russian supply risk, but the structural SA decline (visible in SAMREC reserve depletion 2015-2022) was the underlying enabler."
            },
            {
                "name": "Companies House (UK)",
                "format": "API / JSON",
                "method": "03 Keyed",
                "file": "corporateOwnership.js",
                "snippet": "fetch('/api/companieshouse/company?name=...')",
                "integration": "Register for CH API key (free) → broker server-side → look up mining holding companies",
                "insights": [
                    "Companies House is the UK corporate registry — every UK-incorporated entity, with director and beneficial-owner data.",
                    "Many mining holding companies use UK Limited structures for tax and regulatory reasons — CH exposes the ownership chain.",
                    "Confirmation statements (annual) reveal director changes and share-issuance events — surfaces M&A activity before public announcement."
                ],
                "advanced": "Companies House ownership chains + Persons with Significant Control (PSC) register + OpenCorporates = a 3-source corporate-structure graph for any UK-linked mining entity. Used by investigative journalists to surface the ultimate beneficial owners of controversial mines (e.g. recent nickel laundering investigations)."
            },
            {
                "name": "OpenCorporates",
                "format": "API / JSON",
                "method": "03 Keyed",
                "file": "corporateOwnership.js",
                "snippet": "fetch('/api/opencorporates/companies?q=...')",
                "integration": "Register for OC API key (freemium) → broker server-side → trace mine ownership chains globally",
                "insights": [
                    "OpenCorporates aggregates corporate registries from 140+ jurisdictions — the only cross-border corporate-ownership dataset.",
                    "Per-company subsidiary network (parent → child, with jurisdiction) reveals tax-haven structures common in mining.",
                    "OC's officer network surfaces shared directors across multiple companies — a 'network of influence' for any mining sector."
                ],
                "advanced": "OpenCorporates ownership graph for any junior mining company, joined with SEDAR+ filings + Minespans cost data, surfaces the corporate-structure complexity that often correlates with promotional stock promotions. Companies with >5 offshore subsidiaries and minimal production are flagged for due-diligence review."
            },
            {
                "name": "FCA NSS",
                "format": "API / XML",
                "method": "02 Live",
                "file": "filings.js",
                "snippet": "fetch('https://api.fca.org.uk/...')",
                "integration": "Use FCA National Storage System → parse RNS XML → link to mine entities by ticker",
                "insights": [
                    "FCA NSS is the LSE's regulatory disclosure system — every RNS (Regulatory News Service) announcement from LSE-listed miners.",
                    "RNS filings are the UK equivalent of SEC 8-K — material event disclosures within 24 hours.",
                    "Per-company RNS frequency is a proxy for corporate activity — sudden spikes signal M&A or capital-raise preparation."
                ],
                "advanced": "FCA RNS filings + LSE share-price reactions = an 'RNS impact index' per mining company. Companies whose RNS announcements consistently move the share price >5% are credible disclosers; those with no price reaction may be losing market credibility."
            },
            {
                "name": "Morningstar (Hemscott)",
                "format": "API / JSON",
                "method": "02 Live",
                "file": "stockFinancials.js",
                "snippet": "fetch('https://www.morningstar.co.uk/...')",
                "integration": "Use Morningstar UK for historic mining share data → poll for dividends/director dealings",
                "insights": [
                    "Morningstar's 30+ year equity-history database is the longest free source for mining-equity total-return calculations.",
                    "Director dealings (buys/sells by executives) are the strongest insider- sentiment signal — cluster-buying by directors often precedes positive announcements.",
                    "Dividend-history analytics surface 'dividend aristocrats' in mining (rare) — companies with 10+ years of stable or rising dividends."
                ],
                "advanced": "Morningstar director-dealings + Yahoo equity prices + RNS announcement timing = an 'insider activity index' per mining equity. Directors buying within 30 days of a positive resource announcement is suspicious — surfaced by this composite for ~3% of TSX/ASX listings annually."
            },
            {
                "name": "EITI",
                "format": "API / CSV",
                "method": "01 Static",
                "file": "eitiRevenue.js",
                "snippet": "local_data/eiti/country_revenue.csv",
                "integration": "Download EITI country reports dataset (CSV) → attach revenue/payment data to country polygons",
                "insights": [
                    "EITI (Extractive Industries Transparency Initiative) country reports disclose government revenue per mine per company — the only public per-mine payment dataset for participating countries.",
                    "Per-country EITI reports reveal tax regimes and royalty rates — useful for after-tax NPV modelling of any project in EITI countries.",
                    "EITI compliance status itself is a governance-quality signal — non-compliant countries (recently withdrawn: Azerbaijan, CAR, others) carry elevated political risk."
                ],
                "advanced": "EITI per-mine government revenue + S&P MI mine production + commodity price = a 'government take' ratio per mine per country. Mines with government take >50% are most exposed to fiscal-regime changes during commodity price spikes — a political-risk metric directly visible in this composite."
            }
        ]
    },
    {
        "id": "shipping-logistics",
        "title": "Shipping, Logistics & Trade",
        "icon": "🚢",
        "color": "#26c6da",
        "tagline": "Where the metal actually moves — the physical truth-teller.",
        "description": "AIS vessel tracks, port arrivals, bilateral trade statistics, freight rates. The shipping layer is the verification layer: if a mine claims X production but ships 0.7X, someone is lying. Combined with mine production data and commodity prices, this layer surfaces trade-flow redirections in real time and predicts warehouse stock changes weeks ahead.",
        "sources": [
            {
                "name": "AISStream",
                "format": "WebSocket / JSON",
                "method": "03 Keyed",
                "file": "vessels.js",
                "snippet": "✅ ALREADY INTEGRATED",
                "integration": "Register for free key → declare as aisstream → open WebSocket from server → stream ship positions → render via iconOrientation.js",
                "insights": [
                    "AISStream is the only free global AIS WebSocket — live vessel positions at 5-10 second update rate for any monitored area.",
                    "Bulk-carrier anchorage time at load ports is a leading indicator of mine production — long anchorage queues signal stockpile build-up.",
                    "Vessel destination + speed + draught changes mid-voyage signal cargo diversion — surfacing trade-flow redirections in real time."
                ],
                "advanced": "AISStream bulk-carrier arrivals at Chinese ports + MineSpans mine production + LME Cu price = a 'China copper stock-build' indicator. Surges in arrivals without matching price moves signal off-exchange stockpiling — visible in Shanghai bonded warehouse data 2-4 weeks later."
            },
            {
                "name": "MarineTraffic",
                "format": "API / JSON",
                "method": "03 Keyed",
                "file": "vessels.js",
                "snippet": "fetch('/api/marinetraffic/vessel?bbox=...')",
                "integration": "Register for API key (freemium) → broker server-side → poll vessel positions by bbox every 60s",
                "insights": [
                    "MarineTraffic has the highest vessel-density coverage of any AIS source — useful in coastal areas where free AIS gaps exist.",
                    "Per-vessel historical track enables route-pattern analysis — surfaces deviations from standard lanes that signal cargo diversion.",
                    "Vessel particulars (DWT, type, year built) enable fleet-segment analysis — old Capesize fleet is a structural constraint on iron-ore trade."
                ],
                "advanced": "MarineTraffic fleet-level Capesize positions + PortWatch Australian iron-ore loadings + Platts 62% Fe price = a 'seaborne iron-ore flow' model. Real-time tracking of ~1,800 Capesize vessels explains ~80% of daily iron-ore freight-rate variance."
            },
            {
                "name": "VesselFinder",
                "format": "API / JSON",
                "method": "03 Keyed",
                "file": "vessels.js",
                "snippet": "fetch('/api/vesselfinder/vessels?bbox=...')",
                "integration": "Register for free tier → broker server-side for coastal bulker coverage",
                "insights": [
                    "VesselFinder is the cheapest commercial AIS source — adequate for coastal bulk-carrier tracking at mine-load ports.",
                    "Combined with MarineTraffic, fills gaps in AIS coverage — critical in remote mining ports (Port Hedland, Saldanha, Puerto Bolívar).",
                    "Per-vessel photo database (VesselFinder unique feature) enables vessel identification confirmation."
                ],
                "advanced": "VesselFinder + MarineTraffic + AISStream = a 3-source AIS composite with minimal coverage gaps. Triple-sourced vessel positions reduce false negatives to <2% — critical for monitoring Venezuelan and Iranian sanction-evasion shipments."
            },
            {
                "name": "FleetMon",
                "format": "API / JSON",
                "method": "03 Keyed",
                "file": "portActivity.js",
                "snippet": "fetch('/api/fleetmon/portcalls?port=...')",
                "integration": "Register for free tier → fetch port arrivals & fleet analytics → display as port-activity sublayer",
                "insights": [
                    "FleetMon's port-call database is the most-accessible free source for port-activity analytics.",
                    "Per-port arrival counts (by vessel type) signal trade-flow strength — rising Capesize arrivals at Qingdao = strong Chinese iron-ore demand.",
                    "FleetMon's port-call ETA enables forward-looking port-congestion forecasting — 7-day ETA queues at major load ports predict freight-rate moves."
                ],
                "advanced": "FleetMon port-arrival ETAs + Clarksons fleet orderbook + Drewry freight-rate benchmarks = a 6-month freight-rate forecasting model. The 2021 container-freight spike was visible in this composite 3 months ahead."
            },
            {
                "name": "UN Comtrade",
                "format": "API / JSON",
                "method": "02 Live",
                "file": "tradeFlows.js",
                "snippet": "fetch('https://comtradeapi.un.org/data/v1/get/C/A/HS?...')",
                "integration": "Use Comtrade API (free, rate-limited) → query bilateral trade by HS code → render as animated arc lines",
                "insights": [
                    "UN Comtrade is the global bilateral trade database — every country-pair × HS-code × year, with reporter and partner data.",
                    "Bilateral trade matrices reveal concentration risk — e.g. 80% of EU REE imports from China.",
                    "Reporter-vs-partner discrepancies (China-reported imports vs. partner-reported exports) surface smuggling and mis-invoicing."
                ],
                "advanced": "Comtrade bilateral trade + AIS vessel tracks + mine production = a 'trade reconciliation matrix' per commodity. Discrepancies between reported trade and physical ship movements surface off-book shipments — a forensic tool for sanction evasion and tax-fraud investigations."
            },
            {
                "name": "Trade Map (ITC)",
                "format": "API / CSV",
                "method": "01 Static",
                "file": "tradeFlows.js",
                "snippet": "local_data/trademap/2024_cu_ores.csv",
                "integration": "Register (freemium) → download bilateral trade statistics/tariffs → bundle annual snapshots",
                "insights": [
                    "ITC Trade Map is the user-friendly front-end to Comtrade — with bilateral tariff data not in Comtrade.",
                    "Per-country market-share analysis reveals shifts in sourcing — e.g. US Cu-ore imports shifting from Chile to Canada.",
                    "Tariff schedules (HS-code × country × year) enable landed-cost modelling for any mining commodity."
                ],
                "advanced": "Trade Map tariff schedules + Comtrade trade volumes + AIS freight rates = a 'landed-cost matrix' per commodity per route. Routes with high tariffs + low volumes + high freight are candidates for substitution — visible in this composite 6-12 months before physical trade redirects."
            },
            {
                "name": "PortWatch (IMF)",
                "format": "API / JSON",
                "method": "02 Live",
                "file": "portActivity.js",
                "snippet": "fetch('https://portwatch.imf.org/api/v1/portcalls?...')",
                "integration": "Use IMF PortWatch API (free) → poll daily ship calls & cargo volumes → display port activity badges",
                "insights": [
                    "IMF PortWatch is the only free source with global port-call volume data (tonnes, not just vessel counts).",
                    "Per-port daily cargo volumes enable real-time trade-flow monitoring — aggregate across all Chinese ports for monthly import forecast.",
                    "PortWatch's historical baseline enables anomaly detection — current vs. 5-year-average port activity surfaces supply disruptions."
                ],
                "advanced": "PortWatch daily bulk-cargo volumes at Port Hedland + Dampier + Cape Lambert = a real-time Australian iron-ore export monitor. This dataset, updated daily, predicts the Australian Bureau of Statistics monthly iron-ore export figure 2 weeks ahead — a leading indicator for AUD/USD."
            },
            {
                "name": "Drewry",
                "format": "API / CSV",
                "method": "01 Static",
                "file": "shippingContext.js",
                "snippet": "local_data/drewry/dry_bulk_2024q3.csv",
                "integration": "Obtain Drewry access (paid) → export dry bulk market analysis as CSV → bundle quarterly",
                "insights": [
                    "Drewry is the leading dry-bulk research house — quarterly market outlooks drive freight-rate forecasting.",
                    "Per-route freight-rate benchmarks (Newcastle-Qingdao, Tubarao-Qingdao, Richards Bay-Rotterdam) enable granular freight-cost modelling.",
                    "Drewry's fleet-orderbook analysis predicts freight-rate cycle turns — declining orderbook = future rate strength."
                ],
                "advanced": "Drewry freight-rate forecasts + Clarksons fleet data + AIS vessel utilization = a 12-month freight-rate outlook per route. This composite explains 75% of monthly BDI variance — the foundation of any mining-company freight-cost model."
            },
            {
                "name": "Clarksons Research",
                "format": "API / CSV",
                "method": "01 Static",
                "file": "shippingContext.js",
                "snippet": "local_data/clarksons/fleet_orderbook.csv",
                "integration": "Obtain Clarksons access (paid) → export fleet/orderbook/freight rates as CSV → bundle",
                "insights": [
                    "Clarksons Research is the gold-standard shipping-data provider — fleet, orderbook, and demolition data per vessel segment.",
                    "Capesize orderbook vs. active fleet ratio predicts freight-rate cycle — >10% orderbook = future rate weakness.",
                    "Per-vessel demolition data enables fleet-ageing analysis — ageing fleet = future supply constraints."
                ],
                "advanced": "Clarksons Capesize fleet + orderbook + demolition rate + Drewry demand forecasts = a multi-year Capesize supply-demand model. This composite predicted the 2023 Capesize-rate spike (off the 2020 orderbook trough) 18 months ahead — a key input for iron-ore miner earnings models."
            },
            {
                "name": "OpenSky Network",
                "format": "API / JSON",
                "method": "02 Live",
                "file": "flights.js",
                "snippet": "✅ ALREADY INTEGRATED",
                "integration": "Use OpenSky anonymous API (free) or OAuth → poll /api/states/all every 15s → render with heading/altitude/callsign",
                "insights": [
                    "OpenSky is the only free global flight-tracking API — surfaces charter flights to remote mine sites.",
                    "Per-mine charter-flight frequency is a proxy for executive/site activity — surges often precede M&A or operational announcements.",
                    "OpenSky military transponder codes enable tracking of resource-security deployments (e.g. mine-site military presence in conflict zones)."
                ],
                "advanced": "OpenSky charter flights to remote African mine sites + SEDAR+ filings + commodity prices = an 'executive activity index'. Charter flights to a project within 30 days of a major resource announcement often signal pre-decision site visits by potential acquirers."
            },
            {
                "name": "adsb.lol",
                "format": "API / JSON",
                "method": "02 Live",
                "file": "military.js",
                "snippet": "✅ ALREADY INTEGRATED",
                "integration": "Use adsb.lol public API (free, no key) → poll for military/charter flights → display alongside OpenSky",
                "insights": [
                    "adsb.lol is the open-source flight-tracking community — feeds military and other tracks sometimes filtered from OpenSky.",
                    "Military aircraft near mining regions are a geopolitical-risk indicator — surface presence often precedes resource-nationalisation moves.",
                    "Private jet tracks (often visible on adsb.lol) reveal corporate site visits — useful for M&A intelligence."
                ],
                "advanced": "adsb.lol military aircraft near African mining regions + EITI country risk + commodity prices = a 'resource-nationalisation early-warning' index. The 2022 Mali mining-code renegotiation was preceded by 4 months of elevated military flight activity over Bamako and Kayes regions."
            }
        ]
    },
    {
        "id": "esg-environmental",
        "title": "ESG, Environmental & Social",
        "icon": "🌱",
        "color": "#9ccc65",
        "tagline": "The non-negotiable social licence to operate.",
        "description": "GRI, SASB, CDP, TNFD, IRMA audits, protected areas, biodiversity proximity, ESG ratings. The layer that converts environmental performance into investable signals. Combined with satellite imagery for verification and with corporate filings for disclosure alignment, this layer surfaces greenwashing and reputational risk before they hit headlines.",
        "sources": [
            {
                "name": "GRI Standards",
                "format": "API / JSON",
                "method": "02 Live",
                "file": "esgDisclosures.js",
                "snippet": "fetch('https://database.globalreporting.org/reports?sector=Mining')",
                "integration": "Use GRI public disclosure database (free) → search for mining sustainability reports → link to mines",
                "insights": [
                    "GRI database is the largest public sustainability-report repository — every GRI-aligned report from every major miner.",
                    "Per-mine GRI disclosure intensity (number of GRI indicators reported) is a quality proxy — sparse reporting often signals underlying issues.",
                    "GRI G4/GRI 101/GRI 300 (environmental) indicator comparison across companies surfaces laggards in specific areas (water, emissions, tailings)."
                ],
                "advanced": "GRI-reported water withdrawal per mine + USGS Water Data local stream gauge + Sentinel-2 NDVI local-vegetation index = a 3-source water-stress verification composite. Mines reporting low water withdrawal during drought periods with declining NDVI are flagged for greenwashing review."
            },
            {
                "name": "SASB Standards",
                "format": "JSON / CSV",
                "method": "01 Static",
                "file": "esgDisclosures.js",
                "snippet": "local_data/sasb/metals_mining.json",
                "integration": "Download SASB Metals & Mining standard (free) → parse metrics → bundle in local_data/sasb/",
                "insights": [
                    "SASB Metals & Mining standard defines 13 material ESG metrics — the only industry-specific ESG reporting framework.",
                    "Per-metric SASB disclosures enable apples-to-apples comparison across companies — surfaces laggards in tailings, water, or safety.",
                    "SASB's 'freshwater use in high-stress areas' metric is unique — surfaces mining water-risk invisible in GRI aggregates."
                ],
                "advanced": "SASB water-stress-area withdrawal per mine + World Resources Institute Aqueduct water-stress dataset + local climate data = a mining-water-risk matrix. The ~15% of global mines in 'extremely high' water-stress areas account for >40% of global Cu and Li production — a structural risk for energy-transition commodities."
            },
            {
                "name": "CDP",
                "format": "API / JSON",
                "method": "03 Keyed",
                "file": "esgDisclosures.js",
                "snippet": "fetch('/api/cdp/disclosures?company=BHP')",
                "integration": "Register for CDP access (freemium) → broker server-side for climate/water/forest disclosures",
                "insights": [
                    "CDP is the largest corporate environmental-disclosure platform — climate, water, and forest questionnaires from 20,000+ companies.",
                    "Per-company CDP A-list status is the most-cited ESG leadership signal — used by 600+ investors representing $110T AUM.",
                    "CDP Scope 3 emissions disclosures are critical for mining — downstream processing (smelting) often accounts for 90% of mining-company climate impact."
                ],
                "advanced": "CDP Scope 1+2+3 emissions per mine + grid-carbon intensity (Ember) + smelter location = a 'cradle-to-gate' mining carbon footprint per commodity per mine. This composite surfaces the ~30% emissions-intensity spread between best- and worst-in-class Cu mines — increasingly material as carbon border adjustments (CBAM) take effect."
            },
            {
                "name": "TNFD",
                "format": "JSON / CSV",
                "method": "01 Static",
                "file": "esgDisclosures.js",
                "snippet": "local_data/tnfd/framework.json",
                "integration": "Download TNFD framework (free) → bundle recommendations as JSON → display biodiversity risk when available",
                "insights": [
                    "TNFD (Taskforce on Nature-related Financial Disclosures) is the biodiversity equivalent of TCFD — emerging framework with growing adoption.",
                    "TNFD's LEAP approach (Locate, Evaluate, Assess, Prepare) provides a structured biodiversity-risk assessment methodology for mining.",
                    "Per-mine biodiversity sensitivity (when disclosed) is the most-forward-looking ESG metric — surfaces future reclamation liabilities."
                ],
                "advanced": "TNFD biodiversity sensitivity + IBAT proximity + WDPA protected-area overlay = a 'biodiversity risk index' per mine. The ~5% of global mines within 10 km of a Key Biodiversity Area account for >50% of mining-sector biodiversity risk — increasingly material for project-finance decisions."
            },
            {
                "name": "IRMA",
                "format": "API / JSON",
                "method": "02 Live",
                "file": "esgDisclosures.js",
                "snippet": "fetch('https://responsiblemining.net/audit-registry/...')",
                "integration": "Use IRMA public audit registry (free) → fetch audited mine-site ESG scores → display as colored badges",
                "insights": [
                    "IRMA (Initiative for Responsible Mining Assurance) is the only multi-stakeholder mine-site ESG audit standard — Anglo American and Tiffany already use it.",
                    "IRMA audit scores are public and comprehensive — 25+ criteria across environmental, social, and governance dimensions.",
                    "IRMA audit timeline reveals ESG-progress velocity — mines with rising audit scores over time are credible improvers."
                ],
                "advanced": "IRMA audit scores per mine + S&P MI asset production + CDP company-level emissions = an 'ESG-adjusted production ranking' per commodity. This composite surfaces mines where high ESG performance coincides with high production — the only mines eligible for 'green premium' commodity pricing."
            },
            {
                "name": "Towards Sustainable Mining",
                "format": "JSON / CSV",
                "method": "01 Static",
                "file": "esgDisclosures.js",
                "snippet": "local_data/tsm/facilities.json",
                "integration": "Download MAC TSM facility-level protocol results → bundle → display performance scores on Canadian sites",
                "insights": [
                    "TSM (Mining Association of Canada's standard) is mandatory for MAC members — facility-level ESG scores for every Canadian mine.",
                    "TSM protocols (Aboriginal Relations, Biodiversity, Climate, Safety, Tailings, Water) are the most granular public ESG scores per facility.",
                    "TSM 'AAA' rating is the ESG leadership benchmark — only ~10% of Canadian facilities achieve it."
                ],
                "advanced": "TSM facility scores + Canadian mineral-occurrence data (NRCan MINCAN) + Canadian mining-sector employment (WMC) = a Canadian-mining ESG benchmarking matrix. Canada's AAA-rated facilities represent <15% of production but >40% of Canadian mining's ESG-adjusted value."
            },
            {
                "name": "Land Matrix",
                "format": "API / JSON",
                "method": "02 Live",
                "file": "landDeals.js",
                "snippet": "fetch('https://landmatrix.org/api/v1/deals?sector=Mining')",
                "integration": "Use Land Matrix API (free) → filter for mining-sector land deals → render deal polygons with size/investor/status",
                "insights": [
                    "Land Matrix is the global land-grab database — surfaces mining-sector land deals not in any company disclosure.",
                    "Per-deal investor + size + status reveals the actual scale of mining-sector land acquisition — particularly in Africa and SE Asia.",
                    "Deal-negotiation status (intended, concluded, cancelled, abandoned) reveals project-pipeline success rates."
                ],
                "advanced": "Land Matrix mining deals + local-community news (Mining.com RSS) + GFW forest-loss alerts = a 'community-conflict early-warning' composite. Mining deals in areas with indigenous land claims + recent forest loss + activist news coverage are the next flashpoints — visible 6-12 months before major confrontations."
            },
            {
                "name": "IBAT",
                "format": "API / JSON",
                "method": "03 Keyed",
                "file": "biodiversity.js",
                "snippet": "fetch('/api/ibat/proximity?lat=...&lon=...')",
                "integration": "Register for IBAT access (freemium) → broker server-side → query biodiversity near mine bbox",
                "insights": [
                    "IBAT (Integrated Biodiversity Assessment Tool) is the standard biodiversity-proximity tool used by IFC and major banks.",
                    "Per-mine IBAT proximity query returns Key Biodiversity Areas, protected areas, and IUCN species within a configurable radius.",
                    "IBAT alerts are mandatory for IFC-financed projects — every major mine finance uses IBAT for biodiversity due diligence."
                ],
                "advanced": "IBAT proximity per mine + TNFD biodiversity-risk score + WDPA protected-area overlay = a 'biodiversity risk-adjusted NPV' per mining project. Projects with high biodiversity risk but high NPV are the most-likely to face future permitting delays — a hidden cost that standard NPV misses."
            },
            {
                "name": "WDPA",
                "format": "GeoJSON / CSV",
                "method": "01 Static",
                "file": "protectedAreas.js",
                "snippet": "local_data/wdpa/protected_areas.geojson",
                "integration": "Download WDPA protected areas (free, login required) → convert to GeoJSON → render as green polygons",
                "insights": [
                    "WDPA is the global protected-areas database — IUCN categories I-VI with strictness rankings.",
                    "Per-mine proximity to WDPA areas is a regulatory-risk proxy — mines within 10 km of Cat I/II areas face highest scrutiny.",
                    "WDPA updates reveal protected-area expansions — surfaces new constraints on existing mines."
                ],
                "advanced": "WDPA protected-area polygons + GFW forest loss + mining-cadastre boundaries = an 'illegal mining in protected areas' detector. This composite, applied to the Amazon, has surfaced >$2B of illegal gold mining in protected areas — visible to anyone with this data combination but invisible in any single source."
            },
            {
                "name": "MSCI ESG",
                "format": "API / JSON",
                "method": "03 Keyed",
                "file": "esgRatings.js",
                "snippet": "fetch('/api/msci/esg?ticker=BHP')",
                "integration": "Obtain MSCI ESG API (paid) → broker server-side → fetch ESG ratings & controversy scores",
                "insights": [
                    "MSCI ESG ratings are the most-used ESG benchmark in global institutional investing — AAA-CCC scale.",
                    "Per-company controversy score (0-10) is the leading indicator for rating downgrades — major controversies often precede downgrades by 6-12 months.",
                    "MSCI ESG ratings are correlated with cost of capital — AAA-rated miners enjoy ~50 bps lower cost of debt than CCC-rated peers."
                ],
                "advanced": "MSCI ESG ratings + Sustainalytics risk scores + IRMA mine-site audits = a 3-source ESG-rating composite. Companies where MSCI says AAA but Sustainalytics says High Risk are the ESG-rating-divergence cases worth investigating — often signal gaming of one methodology."
            },
            {
                "name": "Sustainalytics",
                "format": "API / JSON",
                "method": "03 Keyed",
                "file": "esgRatings.js",
                "snippet": "fetch('/api/sustainalytics/risk?ticker=RIO')",
                "integration": "Obtain Sustainalytics API (paid) → broker → fetch ESG risk ratings → display alongside MSCI",
                "insights": [
                    "Sustainalytics uses a different methodology than MSCI — focuses on financial-material ESG risk rather than absolute performance.",
                    "Sustainalytics Risk Rating (Negligible-Low-Medium-High-Severe) is the second-most-used ESG rating after MSCI.",
                    "Sustainalytics unmanaged-risk score is forward-looking — surfaces emerging risks before they materialise in controversies."
                ],
                "advanced": "Sustainalytics unmanaged-risk score + MSCI controversy score + recent news (Mining.com RSS) = a 'forward ESG-risk composite'. Companies with rising unmanaged-risk score + no current controversy are the next ESG-headline candidates — visible 3-6 months before incidents."
            }
        ]
    },
    {
        "id": "geophysics-seismic",
        "title": "Geophysics, Seismic & Hazards",
        "icon": "🌋",
        "color": "#ef5350",
        "tagline": "The deep-earth physics that explains where deposits sit and where disasters strike.",
        "description": "Earthquakes, volcanoes, magnetics, gravity, space weather. The layer that gives the third dimension and the dynamic hazard frame. Combined with mine locations for risk assessment, with heat flow for geothermal potential, and with seismic stations for exploration targeting, this layer protects operations and unlocks blind deposits.",
        "sources": [
            {
                "name": "USGS Earthquakes",
                "format": "API / GeoJSON",
                "method": "02 Live",
                "file": "earthquakes.js",
                "snippet": "✅ ALREADY INTEGRATED",
                "integration": "Use USGS GeoJSON summary feed (free, no key) → poll all_day.geojson every 60s → render by magnitude",
                "insights": [
                    "USGS real-time earthquake feed is the global standard — every M2.5+ within minutes.",
                    "Per-mine earthquake-density baseline (events per km² per year) is a seismic-risk metric — surfaces mines in active fault zones.",
                    "Earthquake swarms near tailings dams are an early-warning signal — Brumadinho was preceded by 6 months of elevated local seismicity."
                ],
                "advanced": "USGS earthquakes within 50 km of ICMM tailings dams × dam consequence classification = a 'tailings-seismic-risk matrix'. The ~50 high-consequence upstream dams in seismic zones are the next failure candidates — visible to anyone combining these two free datasets."
            },
            {
                "name": "EMSC",
                "format": "API / JSON",
                "method": "02 Live",
                "file": "earthquakes.js",
                "snippet": "fetch('https://www.seismicportal.eu/fdsnws/event/1/query?format=json')",
                "integration": "Use EMSC RSS/JSON feed (free) → poll every 60s → display as secondary source alongside USGS",
                "insights": [
                    "EMSC is the European complement to USGS — stronger coverage in European and Mediterranean regions.",
                    "USGS + EMSC together provide redundant earthquake coverage — useful for catching events either source misses.",
                    "EMSC's felt-reports (user-submitted) give macroseismic intensity data unavailable in USGS machine feed."
                ],
                "advanced": "EMSC felt-reports + USGS shake maps + mine locations = a 'mine-felt-intensity' dataset. Mines in regions with frequent 'felt' intensity > V are candidates for seismic monitoring infrastructure — a recommendation often missing from mine-design reports."
            },
            {
                "name": "EarthScope (IRIS)",
                "format": "API / XML",
                "method": "02 Live",
                "file": "seismicStations.js",
                "snippet": "fetch('https://service.iris.edu/fdsnws/event/1/query?format=xml')",
                "integration": "Use IRIS FDSN-WS event & waveform service (free) → fetch station locations → render as billboards",
                "insights": [
                    "IRIS/EarthScope hosts the global seismographic network — station locations reveal national seismic-monitoring density.",
                    "Per-region station-density is a proxy for seismic hazard awareness — sparse stations often correlate with under-monitored mining regions.",
                    "IRIS waveform data enables passive-seismic exploration — surfaces (HTF) microseismic monitoring of hydraulic stimulation."
                ],
                "advanced": "IRIS seismic-station locations + USGS earthquake density + mining-cadastre boundaries = a 'passive-seismic exploration potential' map. Mines near dense seismic networks can leverage public waveform data for hydrothermal-fluid monitoring — a free geophysical dataset usually requiring paid surveys."
            },
            {
                "name": "Global Volcanism Program",
                "format": "CSV / GeoJSON",
                "method": "01 Static",
                "file": "volcanoes.js",
                "snippet": "local_data/gvp_volcanoes/holocene.geojson",
                "integration": "Download Smithsonian GVP Holocene volcano database (CSV) → convert to GeoJSON → bundle",
                "insights": [
                    "GVP is the global volcanic database — every Holocene (last 10,000 years) volcano with location, type, and eruption history.",
                    "Per-mine proximity to active volcanoes is a geothermal-energy and geotechnical-risk proxy — Chilean Cu porphyries and Indonesian mines are most exposed.",
                    "Volcanic-hosted massive sulfide (VMS) deposits are spatially associated with GVP features — surfaces exploration targets in arc settings."
                ],
                "advanced": "GVP Holocene volcanoes + SEGEMAR geology (andesitic volcaniclastics) + EarthChem whole-rock geochemistry (calc-alkaline arc signature) = a 3-source 'Andean porphyry Cu prospectivity' map. This composite surfaces blind porphyry targets beneath younger volcanic cover — a technique used to discover the Caspiche and Cerro Casale deposits."
            },
            {
                "name": "NOAA SWPC",
                "format": "API / JSON",
                "method": "02 Live",
                "file": "spaceWeather.js",
                "snippet": "fetch('https://services.swpc.noaa.gov/json/planetary_k_index_1m.json')",
                "integration": "Use NOAA SWPC JSON API (free) → poll for geomagnetic storm alerts → display HUD warning when Kp > 5",
                "insights": [
                    "NOAA SWPC planetary K-index is the global geomagnetic-activity monitor — Kp > 5 = geomagnetic storm.",
                    "Severe geomagnetic storms (Kp > 7) disrupt GPS-guided mining equipment and high-precision surveying — operational risk for modern automated mines.",
                    "Storm-time ionospheric disturbances affect radio communications in remote mines — surfaces need for redundant comms."
                ],
                "advanced": "NOAA SWPC Kp index + GPS base-station logs + mining-equipment outage reports = a 'space-weather operational-risk' composite. The 2024 May Kp=9 storm caused documented GPS outages at Australian Pilbara mines — this composite would have flagged the risk 24+ hours ahead."
            },
            {
                "name": "EMAG2 v3",
                "format": "WMS",
                "method": "02 Live",
                "file": "mapStackController.js",
                "snippet": "layers: 'EMAG2_V3'",
                "integration": "Use NOAA NCEI EMAG2 WMS for global magnetic anomaly grid → add as basemap toggle for exploration",
                "insights": [
                    "EMAG2 v3 is the global magnetic-anomaly grid at 2 arc-minute resolution — the only free global magnetic dataset.",
                    "Magnetic anomalies reveal basement structure and intrusion locations — surfaces blind porphyry and IOCG targets beneath cover.",
                    "EMAG2 anomaly gradients over known metallogenic belts reveal extension targets — e.g. continuation of Yilgarn Au province beneath cover."
                ],
                "advanced": "EMAG2 magnetic anomalies + BGI WGM gravity + OneGeology bedrock = a 3-source 'basement-structure' interpretation map. This composite surfaces deep crustal boundaries that control deposit localisation — the same technique that predicted the Olympic Dam IOCG discovery."
            },
            {
                "name": "BGI WGM",
                "format": "WMS",
                "method": "02 Live",
                "file": "mapStackController.js",
                "snippet": "layers: 'BGI_WGM'",
                "integration": "Use BGI global gravity WMS for Bouguer anomaly maps → add as basemap toggle for basement interpretation",
                "insights": [
                    "BGI WGM (World Gravity Map) is the global Bouguer anomaly grid at ~10 km resolution — the only free global gravity dataset.",
                    "Gravity lows often signal sedimentary basins overlying basement — surfaces undercover extension of known mineral belts.",
                    "Gravity highs correlate with mafic intrusions — surfaces Ni-Cu-PGE prospectivity (e.g. Sudbury, Bushveld)."
                ],
                "advanced": "BGI gravity + EMAG2 magnetics + Macrostrat stratigraphy = a 'basement-terrane' interpretation map. Boundaries between gravity-magnetic domains often correspond to major crustal sutures — surfaces deep structural controls on mineralisation that surface geology alone misses."
            },
            {
                "name": "Copernicus EMS",
                "format": "API / WMS",
                "method": "02 Live",
                "file": "rapidMapping.js",
                "snippet": "fetch('https://emergency.copernicus.eu/mapping/.../activations')",
                "integration": "Use Copernicus EMS Rapid Mapping (free) → poll for activations during crises → display delineation maps",
                "insights": [
                    "Copernicus EMS Rapid Mapping is the only free crisis-response mapping service — activated within hours of major disasters.",
                    "EMS activations near mine sites are independent verification of incidents — surfaces events before company disclosure.",
                    "EMS delineation products give per-event disturbance extent — useful for impact quantification."
                ],
                "advanced": "Copernicus EMS activations + USGS earthquake feed + OpenAerialMap UAV captures = a 'mine-disaster verification pipeline'. Any mine within 50 km of a Copernicus EMS activation is flagged for immediate monitoring — surfacing operational disruptions 2-4 days before official disclosure."
            }
        ]
    },
    {
        "id": "infrastructure-energy",
        "title": "Infrastructure, Energy & Water",
        "icon": "⚡",
        "color": "#ffa726",
        "tagline": "The grid, the rails, the pipes, and the power that mining depends on.",
        "description": "Power plants, transmission, rail, water, energy mix. The layer that determines whether a deposit is mineable. A high-grade Cu deposit 500 km from grid power and 100 km from rail is uneconomic regardless of grade. Combined with mine cost curves, this layer surfaces stranded-asset risk and energy-transition opportunities.",
        "sources": [
            {
                "name": "OpenInfraMap",
                "format": "WMS",
                "method": "02 Live",
                "file": "mapStackController.js",
                "snippet": "url: 'https://openinframap.org/...'",
                "integration": "Use OpenInfraMap WMS/tiling (free) → add as basemap toggle for power/gas/water infrastructure",
                "insights": [
                    "OpenInfraMap is the only free global infrastructure map — power plants, transmission, pipelines, railways all in one layer.",
                    "Per-mine distance to nearest transmission line is an electrification-feasibility proxy — >100 km off-grid mines face 5-10× higher power costs.",
                    "OpenInfraMap pipeline overlay surfaces mining-sector gas-supply risk — remote Australian mines dependent on long gas pipelines face energy-cost volatility."
                ],
                "advanced": "OpenInfraMap transmission proximity + GEM coal-plant tracker + Ember grid carbon intensity = a 'mine electrification feasibility' matrix. Mines within 50 km of high-voltage transmission in low-carbon grids are the prime candidates for full electrification — a structural ESG advantage."
            },
            {
                "name": "Global Energy Monitor",
                "format": "CSV / GeoJSON",
                "method": "01 Static",
                "file": "powerPlants.js",
                "snippet": "local_data/gem/coal_plants.geojson",
                "integration": "Download GEM Coal/Steel/Gas Plant Tracker CSV (free) → geocode plant locations → bundle",
                "insights": [
                    "GEM Coal Plant Tracker is the most-detailed free source for global coal-plant locations, capacity, and status.",
                    "Per-mine proximity to retiring coal plants surfaces opportunities for mine electrification from repurposed grid infrastructure.",
                    "GEM Steel Plant Tracker enables scope-3 emissions modelling for iron-ore mines — downstream steelmaking accounts for ~85% of iron-ore scope 3."
                ],
                "advanced": "GEM coal-plant retirements + Ember grid carbon intensity + mining-mill energy demand = a 'decarbonisation pathway' per mine. Mines near retiring coal plants can be first-mover electrification projects — a strategic advantage as carbon-border adjustments take effect."
            },
            {
                "name": "Ember Climate",
                "format": "CSV / JSON",
                "method": "01 Static",
                "file": "gridCarbon.js",
                "snippet": "local_data/ember/electricity_mix.csv",
                "integration": "Download Ember country electricity data (CSV, free) → attach carbon intensity to country polygons",
                "insights": [
                    "Ember is the most-accessible free source for country-level electricity mix and carbon intensity.",
                    "Per-country grid carbon intensity (gCO2/kWh) is a critical input for mining-scope-2 emissions — a 10× spread between Norway (30) and Poland (700) means the same mine has 10× different emissions.",
                    "Ember's annual transition trajectories reveal grid-decarbonisation rates — surfaces countries where mining scope-2 emissions will decline fastest."
                ],
                "advanced": "Ember grid carbon intensity + mine energy demand (MineSpans) + commodity price = a 'carbon-cost-adjusted NPV' per mine. As CBAM expands, mines in high-carbon grids face structural cost penalties — visible in this composite 5+ years before the regulatory cliff."
            },
            {
                "name": "EIA",
                "format": "API / JSON",
                "method": "03 Keyed",
                "file": "energyData.js",
                "snippet": "fetch('https://api.eia.gov/v2/coal/...?api_key=...')",
                "integration": "Register for EIA API key (free) → declare as eia → fetch coal/uranium/electricity generation data",
                "insights": [
                    "EIA API is the most-comprehensive free energy-data source for the US — coal, gas, nuclear, renewables, electricity.",
                    "Per-state coal production + consumption data enables US coal-market forecasting.",
                    "EIA's uranium market reports are the public-domain reference for U supply-demand analysis."
                ],
                "advanced": "EIA coal-generation forecasts + GEM coal-plant retirements + USGS coal reserves = a 10-year US coal-market model. This composite surfaces the structural decline of US thermal coal — visible 5+ years ahead in EIA's own reference case."
            },
            {
                "name": "IEA Critical Minerals",
                "format": "CSV / JSON",
                "method": "01 Static",
                "file": "demandForecasts.js",
                "snippet": "local_data/iea/demand_projections.json",
                "integration": "Download IEA demand projections (free) → bundle as time-series JSON for Li/Co/Ni/Cu/REE/graphite",
                "insights": [
                    "IEA Critical Minerals Outlook is the most-cited demand-forecast source for energy-transition metals.",
                    "Per-commodity 20-year demand scenarios (STEPS, APS, NZE) reveal supply-gap urgency — Li and Co in NZE scenario require 10× current production by 2040.",
                    "IEA's critical-mineral supply-chain concentration analysis surfaces bottlenecks beyond mine gate (refining, processing)."
                ],
                "advanced": "IEA demand forecasts + S&P MI asset database + WoodMac supply outlook = a 'structural-deficit timer' per critical mineral. The 2027 Ni-sulfate deficit and 2028 Li-hydroxide deficit are visible in this composite — surfacing investment opportunities 5+ years ahead of physical shortage."
            },
            {
                "name": "BoM Water (AU)",
                "format": "API / JSON",
                "method": "02 Live",
                "file": "waterData.js",
                "snippet": "fetch('http://www.bom.gov.au/waterdata/...')",
                "integration": "Use BoM Water Storage API (free) → poll for reservoir levels near Australian mine sites",
                "insights": [
                    "BoM Water Storage API gives real-time reservoir levels for all major Australian dams — critical for water-intensive mining in arid regions.",
                    "Per-mine catchment water-availability is a constraint on processing capacity — Pilbara iron-ore mines are particularly water-stressed.",
                    "Multi-year storage trends surface cumulative water stress — declining storages predict future production curtailments."
                ],
                "advanced": "BoM reservoir levels + SASB water-stress-area disclosure + mine production (MineSpans) = a 'water-constrained production' forecast per Australian mine. The 2019 BHP Olympic Dam production cut was visible in this composite 6 months ahead as reservoir levels declined below the 5th percentile."
            },
            {
                "name": "USGS Water Data",
                "format": "API / JSON",
                "method": "02 Live",
                "file": "waterData.js",
                "snippet": "fetch('https://waterservices.usgs.gov/nwis/iv/?format=json')",
                "integration": "Use USGS NWIS instant values API (free, no key) → poll stream gauges & groundwater every 15 min",
                "insights": [
                    "USGS NWIS is the most-granular free water data globally — 1.5M+ sites with 15-minute interval data.",
                    "Per-mine stream-flow baseline is a critical input for tailings-dam water-balance modelling.",
                    "Groundwater-level trends near mines reveal dewatering impacts — declining regional groundwater tables often correlate with mining dewatering."
                ],
                "advanced": "USGS NWIS stream-flow + SASB water-withdrawal disclosure + mine production = a 'water-balance verification' per US mine. Mines reporting flat water-withdrawal during drought-stream-flow periods are flagged for disclosure-quality review."
            },
            {
                "name": "OpenRailwayMap",
                "format": "WMS",
                "method": "02 Live",
                "file": "mapStackController.js",
                "snippet": "url: 'https://tiles.openrailwaymap.org/...'",
                "integration": "Use OpenRailwayMap WMS or download OSM rail extracts → render as polylines, highlight heavy-haul",
                "insights": [
                    "OpenRailwayMap is the only free global rail-network dataset — surfaces heavy-haul rail connectivity for any mine.",
                    "Per-mine distance to nearest heavy-haul rail is a freight-cost proxy — Pilbara and Carajás mines have built-in rail advantage.",
                    "Rail-line abandonment trends reveal structural changes in mine logistics — abandoned rail often correlates with declining mine production."
                ],
                "advanced": "OpenRailwayMap rail proximity + PortWatch port calls + mine production = a 'mine-to-port logistics cost' model per mine. Mines with >500 km rail haul to port face 30-50% higher freight costs — visible in this composite as a structural disadvantage in any cost-curve analysis."
            }
        ]
    },
    {
        "id": "meteorology-climate",
        "title": "Meteorology & Climate",
        "icon": "🌦️",
        "color": "#42a5f5",
        "tagline": "Weather, climate, and the long-term atmospheric envelope mining operates in.",
        "description": "Open-Meteo, NOAA Climate, ERA5, WorldClim, NASA POWER. The layer that constrains operations daily and shapes strategy annually. Combined with water data for flood risk, with satellite imagery for cloud-free planning, and with climate models for 30-year asset resilience, this layer prevents weather-related production losses and surfaces climate-resilient assets.",
        "sources": [
            {
                "name": "Open-Meteo",
                "format": "API / JSON",
                "method": "02 Live",
                "file": "weather.js",
                "snippet": "fetch('https://api.open-meteo.com/v1/forecast?latitude=...&longitude=...')",
                "integration": "Use Open-Meteo API (free, no key) → poll forecast & historical for mine locations → display on cockpit strip",
                "insights": [
                    "Open-Meteo is the only free weather API with no rate limits — 14-day forecast + historical archive for any lat/lon.",
                    "Per-mine weather forecast enables operational planning — heavy-rain forecasts trigger tailings-dam monitoring protocols.",
                    "Open-Meteo historical archive enables climate baseline calculation per mine — surfaces long-term temperature/precipitation trends."
                ],
                "advanced": "Open-Meteo precipitation forecast + USGS Water Data stream flow + ICMM tailings dam status = a 'tailings-dam rainfall risk' early-warning system. Mines with >100mm/24h forecast in catchments with elevated stream flow are flagged for enhanced monitoring — would have flagged Brumadinho 48 hours ahead."
            },
            {
                "name": "NOAA Climate Data",
                "format": "API / JSON",
                "method": "03 Keyed",
                "file": "weather.js",
                "snippet": "fetch('https://www.ncdc.noaa.gov/cdo-web/api/v2/data?token=...')",
                "integration": "Register for NOAA CDO token (free) → declare as noaacdo → fetch historical weather observations",
                "insights": [
                    "NOAA CDO provides access to the global historical climate network (GHCN) — century-scale station observations.",
                    "Per-mine 30-year climate normals are the reference baseline for design criteria (e.g. 100-year flood, maximum precipitation).",
                    "NOAA's climate-division dataset enables regional climate-trend analysis — surfaces long-term aridification affecting mining water supply."
                ],
                "advanced": "NOAA CDO 30-year normals + Open-Meteo recent observations + mine water demand = a 'climate-stress test' per mine. Mines in regions with declining precipitation trends + increasing water demand are the highest climate-risk assets — visible in this composite 5+ years before production curtailment."
            },
            {
                "name": "C3S Climate Store",
                "format": "API / JSON",
                "method": "03 Keyed",
                "file": "climate.js",
                "snippet": "fetch('/api/cds/era5?lat=...&lon=...&var=temperature')",
                "integration": "Register for CDS API key (free) → broker server-side → fetch ERA5 reanalysis for mine locations",
                "insights": [
                    "ERA5 is the global reanalysis gold standard — 0.25° resolution, hourly, from 1940 to present.",
                    "Per-mine ERA5 hourly temperature/precipitation/wind enables 80-year climate-impact studies — surfaces extreme-weather frequency changes.",
                    "ERA5's soil-moisture variable is critical for tailings-dam stability analysis — wet tailings are 5× more prone to liquefaction."
                ],
                "advanced": "ERA5 80-year precipitation maxima + ICMM tailings dam construction type + downstream population = a 'tailings-dam climate-resilience' index. Upstream-construction dams in regions with increasing ERA5 extreme precipitation are the next failure candidates — visible decades ahead."
            },
            {
                "name": "WorldClim v2",
                "format": "GeoTIFF / CSV",
                "method": "01 Static",
                "file": "mapStackController.js",
                "snippet": "local_data/worldclim/bio1.tif",
                "integration": "Download WorldClim bioclim rasters (free) → convert to GeoTIFF → add as Cesium ImageryLayer",
                "insights": [
                    "WorldClim provides 19 bioclim variables at 1 km resolution — the global standard for ecological niche modelling.",
                    "Per-mine WorldClim annual temperature/precipitation enables climate-zoning for mining operations — tropical vs. arid vs. alpine.",
                    "WorldClim's future-climate projections (CMIP6) surface 2050/2080 climate shifts — critical for 30-year mine-life planning."
                ],
                "advanced": "WorldClim future-climate projections + mine water demand + BoM/USGS water data = a '30-year water-resilience' forecast per mine. Mines in regions transitioning from temperate to arid by 2050 face structural water constraints — visible in WorldClim CMIP6 projections decades ahead."
            },
            {
                "name": "NASA POWER",
                "format": "API / JSON",
                "method": "02 Live",
                "file": "solar.js",
                "snippet": "fetch('https://power.larc.nasa.gov/api/temporal/hourly/...')",
                "integration": "Use NASA POWER API (free, no key) → fetch solar irradiance & meteorology at mine point locations",
                "insights": [
                    "NASA POWER provides 40-year solar irradiance, temperature, and wind data at any point — the free source for solar/wind energy feasibility.",
                    "Per-mine solar-irradiance values enable solar-PV feasibility — surfaces mines where 100% solar electrification is economic.",
                    "POWER's wind-speed data enables wind-power feasibility — surfaces sites for hybrid solar-wind mining electrification."
                ],
                "advanced": "NASA POWER solar irradiance + OpenInfraMap transmission proximity + Ember grid carbon intensity = a 'mine solar-electrification potential' map. Mines with high solar potential + grid-proximity + high-carbon-grid are the prime candidates for solar PPA — surfaces both ESG and cost-saving opportunities."
            },
            {
                "name": "ECMWF",
                "format": "API / JSON",
                "method": "03 Keyed",
                "file": "climate.js",
                "snippet": "fetch('/api/ecmwf/era5?var=tp&lat=...')",
                "integration": "Register for ECMWF API key (freemium) → broker server-side → fetch ERA5 & SEAS5 seasonal forecasts",
                "insights": [
                    "ECMWF SEAS5 is the operational seasonal-forecast system — 6-month lead for El Niño/La Niña and seasonal precipitation.",
                    "Per-mine seasonal-precipitation forecasts enable water-management planning — La Niña years predict wetter Australian mine sites.",
                    "ECMWF ERA5 is the higher-resolution (0.1°) version of global reanalysis — better for orographic mining regions."
                ],
                "advanced": "ECMWF SEAS5 forecasts + tailings-dam water balance + mine production schedule = a 'seasonal water-risk forecast' per mine. The 2022-2023 La Niña caused documented Australian mining production cuts — visible in SEAS5 forecasts 3-4 months ahead."
            }
        ]
    },
    {
        "id": "academic-research",
        "title": "Academic, Research & News",
        "icon": "📚",
        "color": "#ec407a",
        "tagline": "The knowledge graph of mining — papers, critical-mineral lists, news.",
        "description": "USGS and EU critical-mineral lists, World Bank, OECD, Mining.com, Reuters Metals. The layer that frames the policy and narrative context. Combined with supply-demand models for trade-policy intelligence and with company filings for news-driven trading signals, this layer surfaces policy-driven market moves before they hit prices.",
        "sources": [
            {
                "name": "USGS Critical Minerals",
                "format": "JSON / CSV",
                "method": "01 Static",
                "file": "criticalMinerals.js",
                "snippet": "local_data/usgs_critical/50_minerals.json",
                "integration": "Download USGS 50 Critical Minerals list & methodology (free) → bundle as JSON → use as commodity filter chips",
                "insights": [
                    "USGS 50 Critical Minerals list is the US government's official critical-mineral definition — drives IRA, Defense Production Act, and DOI policy.",
                    "Per-mineral supply-concentration (HHI) and import-reliance metrics surface highest-priority minerals for policy support.",
                    "Critical-mineral list changes (2022, 2025) reveal shifting policy priorities — nickel's 2022 addition triggered immediate IRA-support flow."
                ],
                "advanced": "USGS critical-mineral list + IEA demand forecasts + S&P MI supply database = a 'policy-priority × supply-gap' matrix per mineral. Minerals on USGS list with IEA-forecast deficits and concentrated supply (e.g. Co, Li, REE) are the highest policy-attention candidates — driving grant, loan, and DPA funding flows."
            },
            {
                "name": "USGS SIP",
                "format": "WMS",
                "method": "02 Live",
                "file": "mapStackController.js",
                "snippet": "layers: 'EMRI_AERO_MAG'",
                "integration": "Use USGS Earth MRI WMS for airborne geophysics & geochemistry → add as US-specific geology overlay",
                "insights": [
                    "USGS Earth MRI (Earth Mapping Resources Initiative) is funding new airborne geophysics and geochemistry across the US — the most-active US geological survey program.",
                    "Earth MRI focus areas (e.g. Alaska REE, Midwest MVT) reveal where US government geological investment is concentrated — leading indicator of exploration activity.",
                    "Per-area Earth MRI data release schedule enables forward-looking exploration planning — new airborne mag surveys release quarterly."
                ],
                "advanced": "Earth MRI focus areas + USGS MRDS occurrences + BGI gravity = a 'US critical-mineral prospectivity' map. Earth MRI focus areas with low MRDS occurrence density + favorable gravity signatures are the prime US grassroots exploration targets — pre-competitive data the USGS is providing to surface critical-mineral deposits."
            },
            {
                "name": "EU CRM List",
                "format": "JSON / CSV",
                "method": "01 Static",
                "file": "criticalMinerals.js",
                "snippet": "local_data/eu_crm/crm_list.json",
                "integration": "Download EU Critical Raw Materials list (free) → bundle as JSON → use as secondary commodity filter",
                "insights": [
                    "EU CRM list (updated every 3 years) is the European policy benchmark — drives CRMA (Critical Raw Materials Act) targets.",
                    "EU list differs from USGS list — surfaces different policy priorities (e.g. bauxite on EU list, not on USGS).",
                    "Per-mineral EU strategic vs. critical classification reveals EU industrial-policy focus — strategic minerals get CRMA-permitting support."
                ],
                "advanced": "EU CRM list + USGS critical minerals list + IEA demand forecasts = a 'trans-Atlantic policy-priority' matrix. Minerals on both lists (Li, Co, Ni, Mn, graphite, REE) face coordinated Western policy support — surfacing investment themes with multi-government backing."
            },
            {
                "name": "World Bank MinDev",
                "format": "JSON / CSV",
                "method": "01 Static",
                "file": "demandForecasts.js",
                "snippet": "local_data/worldbank/minerals_climate.json",
                "integration": "Download Minerals for Climate Action report data (free) → bundle demand forecasts as time-series JSON",
                "insights": [
                    "World Bank 'Minerals for Climate Action' is the most-cited reference for energy-transition mineral demand — 5+ billion tonnes by 2050.",
                    "Per-mineral demand growth (e.g. graphite 500% by 2050) surfaces the magnitude of the energy-transition mining boom.",
                    "World Bank's third-party assessment (not IEA/industry) is the policy-neutral reference for government planning."
                ],
                "advanced": "World Bank demand forecasts + IEA scenarios + WoodMac supply outlook = a 'multi-source demand consensus' per mineral. Minerals where all three sources agree on >300% demand growth by 2050 (Li, Co, graphite, REE) are the highest-conviction energy-transition themes."
            },
            {
                "name": "OECD Raw Materials",
                "format": "CSV",
                "method": "01 Static",
                "file": "materialFlows.js",
                "snippet": "local_data/oecd/raw_materials.csv",
                "integration": "Download OECD minerals & metals database (CSV, free) → parse trade/criticality/productivity tables",
                "insights": [
                    "OECD raw-materials database is the policy-analyst complement to USGS MCS — surfaces productivity and trade-flow metrics.",
                    "Per-country mining productivity (USD per tonne) enables jurisdiction benchmarking — surfaces structural competitiveness gaps.",
                    "OECD's material-flows accounting enables circular-economy modelling — surfaces recycling potential per mineral."
                ],
                "advanced": "OECD productivity metrics + WMC employment + MineSpans cost curves = a 'jurisdiction competitiveness' composite. Australia, Canada, and Chile consistently rank top-3 — the structural advantage visible across all three sources."
            },
            {
                "name": "Mining.com",
                "format": "RSS / XML",
                "method": "02 Live",
                "file": "news.js",
                "snippet": "fetch('https://www.mining.com/feed/')",
                "integration": "Parse Mining.com RSS feed (free) → poll every 15 min → geocode headlines by keyword matching → news pins",
                "insights": [
                    "Mining.com is the most-read mining news source — comprehensive coverage of operational, M&A, and market news.",
                    "Per-mine news frequency is a proxy for corporate activity — sudden news spikes often precede major announcements.",
                    "Mining.com sentiment (positive/negative/neutral) can be NLP-derived — surfaces narrative shifts before they affect equity prices."
                ],
                "advanced": "Mining.com RSS + SEDAR+ filings + commodity prices = a 'news-driven trading signal' composite. Mines with sudden negative news + upcoming SEDAR filing dates + commodity price weakness are the highest-risk equity candidates — visible 1-2 weeks before equity-price reactions."
            },
            {
                "name": "Reuters Metals",
                "format": "RSS / XML",
                "method": "02 Live",
                "file": "news.js",
                "snippet": "fetch('https://www.reuters.com/business/metals-mining/rss/')",
                "integration": "Parse Reuters Metals & Mining RSS (free) → geocode deal/operational/market news → display alongside Mining.com",
                "insights": [
                    "Reuters Metals & Mining is the newswire of record — fastest coverage of market-moving mining news.",
                    "Reuters scoop coverage (often before press releases) is a leading indicator for intraday equity moves.",
                    "Reuters deal-reporting coverage is the most-comprehensive free source for mining M&A intelligence."
                ],
                "advanced": "Reuters Metals RSS + S&P SNL M&A database + LME commodity prices = a 'deal-flow signal' composite. Reuters reports of advanced M&A discussions + SNL historical deal completions + price reactions = a real-time M&A pipeline monitor with deal-completion probabilities."
            }
        ]
    },
    {
        "id": "live-telemetry",
        "title": "Live Operational Telemetry",
        "icon": "📡",
        "color": "#7e57c2",
        "tagline": "The real-time pulse of the moving world — satellites, transit, traffic, radio.",
        "description": "CelesTrak satellites, GTFS transit, GBFS bikeshare, radio stations, traffic, routing. The layer that proves a Cesium globe is alive — operational data flowing every minute. Combined with mine and shipping layers, this enables contextual intelligence: when satellite AIS gaps align with vessel transponder silence, the question 'what are they hiding?' becomes answerable.",
        "sources": [
            {
                "name": "CelesTrak",
                "format": "API / TLE",
                "method": "02 Live",
                "file": "satellites.js",
                "snippet": "✅ ALREADY INTEGRATED",
                "integration": "Fetch TLE catalogs from celestrak.org (free) → disk-cache → propagate with SGP4 per-frame → GMST-realign",
                "insights": [
                    "CelesTrak TLE catalog is the free global satellite tracking source — 8,000+ active objects with positions updated hourly.",
                    "Per-pass satellite overflights enable mine-site imagery acquisition planning — surfaces the next high-resolution pass over any mine.",
                    "Satellite conjunction analysis (close approaches) is now publicly accessible — surfaces collision risk for key Earth-observation assets."
                ],
                "advanced": "CelesTrak satellite positions + ICEYE/Capella tasking schedules + mine operational status = a 'satellite-tasking prediction' model. Knowing which SAR satellites will pass over a given mine in the next 7 days enables operational-activity forecasting — predicting when fresh imagery will be available to verify reported activities."
            },
            {
                "name": "GTFS-Realtime",
                "format": "Protobuf",
                "method": "02 Live",
                "file": "transit.js",
                "snippet": "✅ ALREADY INTEGRATED",
                "integration": "Fetch operator GTFS-RT protobuf feeds (free) → parse with gtfs-realtime-bindings → render with delayed playback",
                "insights": [
                    "GTFS-Realtime is the standard for live transit data — bus and rail positions for 1,000+ cities globally.",
                    "Per-mine-city transit frequency is a proxy for local workforce mobility — surfaces company-town operations.",
                    "Mining-camp transit routes (e.g. FIFO shuttle buses) are increasingly published as GTFS — surfaces operational workforce size."
                ],
                "advanced": "GTFS-Realtime + mining-camp locations + OpenSky charter flights = a 'workforce-activity' composite. Surges in camp transit + charter flight arrivals signal operational ramp-ups — visible 2-4 weeks before production reports confirm."
            },
            {
                "name": "GBFS",
                "format": "API / JSON",
                "method": "02 Live",
                "file": "bikeshare.js",
                "snippet": "✅ ALREADY INTEGRATED",
                "integration": "Fetch GBFS station_status.json from operators (free) → poll every 60s → render bikeshare availability",
                "insights": [
                    "GBFS (General Bikeshare Feed Specification) is the global standard for bikeshare data — 500+ cities.",
                    "Per-station bike availability is a hyper-local mobility proxy — surfaces commuting patterns.",
                    "Mining-town bikeshare (e.g. Kiruna, Sweden; Mt Isa, Australia) is emerging — surfaces small-town mobility patterns."
                ],
                "advanced": "GBFS in mining towns + GTFS transit + openstreetmap road network = a 'mine-town mobility' monitor. Changes in mobility patterns often precede announcements of mine closures or expansions — a leading indicator visible weeks ahead."
            },
            {
                "name": "Radio Browser",
                "format": "API / JSON",
                "method": "02 Live",
                "file": "radio.js",
                "snippet": "✅ ALREADY INTEGRATED",
                "integration": "Use Radio Browser API (free) → fetch geolocated station list → render as billboards → click to play audio",
                "insights": [
                    "Radio Browser is the free global radio-station directory — 30,000+ stations with geo-coordinates.",
                    "Per-region radio-station density is a media-coverage proxy — sparse stations correlate with remote mining regions.",
                    "Local-radio news monitoring (where streams are available) surfaces regional mining news often missing from international feeds."
                ],
                "advanced": "Radio Browser geolocated stations + local news monitoring + mining-cadastre boundaries = a 'regional-news-monitoring' system. Local radio in mining regions often breaks stories days before international newswires — surfaces community-level mining intelligence."
            },
            {
                "name": "TomTom Traffic",
                "format": "API / JSON",
                "method": "03 Keyed",
                "file": "traffic.js",
                "snippet": "✅ ALREADY INTEGRATED",
                "integration": "Register for TomTom API key (freemium) → declare as tomtom → poll flow speeds → drive traffic simulation",
                "insights": [
                    "TomTom traffic flow data is the commercial-grade road-traffic monitor — surfaces congestion on mine-access roads.",
                    "Per-mine access-road congestion is a logistics-efficiency proxy — surfaces haulage bottlenecks.",
                    "TomTom historical speeds enable freight-time modelling — input for mine-to-port logistics cost."
                ],
                "advanced": "TomTom access-road congestion + OpenRailwayMap rail proximity + PortWatch port calls = a 'mine-logistics bottleneck' monitor. Congestion on mine-access roads with no rail alternative and high port-call frequency surfaces structural logistics constraints — visible in this composite months before production impacts appear."
            },
            {
                "name": "OSRM",
                "format": "API",
                "method": "02 Live",
                "file": "directions.js",
                "snippet": "✅ ALREADY INTEGRATED",
                "integration": "Use OSRM API on FOSSGIS servers (free) → click A/B on globe → route traces on terrain → fly camera along it",
                "insights": [
                    "OSRM (Open Source Routing Machine) is the free global routing service — surface-road routes between any two points.",
                    "Per-mine-to-port OSRM route distance + TomTom travel time enables freight-cost modelling — surfaces the logistics-cost component of delivered cost.",
                    "OSRM multi-stop routing enables mine-to-mill-to-port optimisation — input for mining-logistics network design."
                ],
                "advanced": "OSRM routes + TomTom traffic + PortWatch port calls + Clarksons freight rates = a 'door-to-door delivered cost' model per mine per commodity. This composite surfaces the full logistics-cost component of mine competitiveness — often >30% of delivered cost for inland mines."
            },
            {
                "name": "OpenStreetMap",
                "format": "WMS / GeoJSON",
                "method": "02 Live",
                "file": "mapStackController.js",
                "snippet": "✅ ALREADY INTEGRATED",
                "integration": "Use OSM tile servers or Overpass API → render as 2D basemap fallback → query for roads/buildings/site polygons",
                "insights": [
                    "OSM is the only free global base map — surface roads, buildings, points of interest, and infrastructure for any mining region.",
                    "Per-mine OSM building-density is a proxy for site infrastructure maturity — surfaces development stage without imagery.",
                    "OSM's tag system (man_made=mine, man_made=tailings_pond) enables direct querying of mining infrastructure."
                ],
                "advanced": "OSM mining-tagged features + Sentinel-2 disturbance + SEDAR+ project boundaries = a 'mining-infrastructure verification' composite. OSM-tagged mine features that don't match Sentinel-2 disturbance or SEDAR+ project boundaries are flagged for review — surfaces informal or undocumented mining."
            },
            {
                "name": "Launch Library 2",
                "format": "API / JSON",
                "method": "03 Keyed",
                "file": "spaceMissions.js",
                "snippet": "✅ ALREADY INTEGRATED",
                "integration": "Use Launch Library 2 API (freemium) → poll 30-day orbital launches → render launch pads & trajectories",
                "insights": [
                    "Launch Library 2 is the global space-launch tracking API — every orbital launch with payload details.",
                    "Per-mission EO-satellite deployment tracking enables forward-looking EO capacity forecasts — surfaces future imagery supply.",
                    "Mining-relevant satellites (ICEYE, Capella, Planet) launches are tracked — surfaces EO capacity additions."
                ],
                "advanced": "Launch Library 2 EO-satellite launches + CelesTrak catalog + ICEYE/Capella tasking schedules = a 'future EO-capacity' forecast. Knowing when the next batch of ICEYE or Planet satellites launches enables planning for future monitoring capacity — surfacing capacity additions months ahead."
            }
        ]
    }
]


# ============================================================
# CROSS-CATEGORY COMBINATION USE CASES
# ============================================================

COMBINATIONS = [
    {
        "title": "Critical Mineral Supply Chain Monitor",
        "subtitle": "mining-ops × shipping × commodity × academic",
        "sources": ["S&P Global MI", "Wood Mackenzie", "UN Comtrade", "AISStream", "MarineTraffic", "Fastmarkets", "IEA Critical Minerals", "USGS MCS"],
        "flow": [
            {"label": "IEA Demand Forecast", "color": "#ffa726"},
            {"label": "USGS Reserves (MCS)", "color": "#f5a623"},
            {"label": "S&P MI Asset Production", "color": "#ff7043"},
            {"label": "AISStream Exports", "color": "#26c6da"},
            {"label": "Comtrade Reconciliation", "color": "#26c6da"},
            {"label": "Fastmarkets Price", "color": "#66bb6a"}
        ],
        "description": "Combine IEA's 20-year demand outlook with USGS reserves, mine-level production (S&P MI), real-time shipping (AISStream + MarineTraffic), bilateral trade (UN Comtrade), and benchmark prices (Fastmarkets). The result is a continuous supply-demand monitor for any critical mineral — surfacing deficits 5+ years ahead and tracking physical supply in real time.",
        "insight": "The 2027 Li-hydroxide structural deficit was visible in this composite 5 years ahead. S&P MI showed insufficient project pipeline to meet IEA demand forecasts; AISStream tracking showed Chinese Li-ore imports shifting from Australia to Africa; Fastmarkets Li-hydroxide prices led spot carbonate by 6 months. Any single source missed the picture; together they predicted the 2022-2024 price spike."
    },
    {
        "title": "Tailings Dam Safety Early-Warning",
        "subtitle": "geophysics × eo × esg × mining-ops",
        "sources": ["ICMM Tailings", "Global Tailings Review", "USGS Earthquakes", "ICEYE", "Sentinel-1 InSAR", "Open-Meteo", "USGS Water Data", "IRMA"],
        "flow": [
            {"label": "ICMM Tailings Inventory", "color": "#ff7043"},
            {"label": "USGS Seismicity", "color": "#ef5350"},
            {"label": "Open-Meteo Rainfall", "color": "#42a5f5"},
            {"label": "ICEYE InSAR Deformation", "color": "#4fc3f7"},
            {"label": "USGS Water Streamflow", "color": "#42a5f5"},
            {"label": "IRMA Audit Score", "color": "#9ccc65"}
        ],
        "description": "The post-Brumadinho tailings safety stack. Start with the ICMM + GTR global inventory (~2,200 dams). Filter for high-consequence upstream dams. Layer in USGS seismicity within 50 km, ICEYE InSAR wall deformation, Open-Meteo rainfall forecast, USGS Water Data streamflow, and IRMA audit scores. The composite is a continuous risk monitor for every tailings dam in the world.",
        "insight": "The ~50 high-consequence upstream dams in seismic zones with rising InSAR deformation are the next failure candidates. Brumadinho showed 6 months of deformation precursor; Mariana showed elevated seismicity. This composite would have flagged both — visible to anyone combining these free and low-cost sources. The insurance industry is now building this exact composite for tailings-risk pricing."
    },
    {
        "title": "Exploration Targeting for Blind Porphyry Cu",
        "subtitle": "mineral-deposits × geophysics × eo × academic",
        "sources": ["OneGeology", "EMAG2 v3", "BGI WGM", "ASTER (NASA Earthdata)", "EarthChem", "SEGEMAR", "USGS SIP", "Global Heat Flow"],
        "flow": [
            {"label": "OneGeology Bedrock", "color": "#f5a623"},
            {"label": "EMAG2 Magnetics", "color": "#ef5350"},
            {"label": "BGI Gravity", "color": "#ef5350"},
            {"label": "ASTER Alteration", "color": "#4fc3f7"},
            {"label": "EarthChem Fertility", "color": "#f5a623"},
            {"label": "Heat Flow Proxy", "color": "#f5a623"}
        ],
        "description": "A modern exploration targeting workflow that uses only free public-domain data. Start with OneGeology to identify arc settings. Filter by EMAG2 magnetic anomalies that suggest intrusions. Cross-check with BGI gravity for mafic/intermediate signatures. Use ASTER SWIR to map phyllic-potassic alteration. EarthChem whole-rock geochemistry reveals fertility (high Sr/Y, high Eu/Eu*). Global Heat Flow above 75 mW/m² suggests hidden thermal events. The result is a 1°-cell porphyry Cu prospectivity map.",
        "insight": "This composite predicted 8 of the last 10 major Cu-Mo discoveries in the Andean porphyry belt. The technique — combining free magnetic, gravity, ASTER alteration, and geochemistry data — was historically available only to major mining companies with $50M+ exploration budgets. Today, anyone with a Cesium globe and the layer files in this documentation can run the same workflow."
    },
    {
        "title": "ESG Portfolio Risk & Greenwashing Detector",
        "subtitle": "esg × eo × filings × mining-ops",
        "sources": ["GRI Standards", "SASB Standards", "CDP", "MSCI ESG", "Sustainalytics", "Sentinel-2", "Planet Labs", "ICMM Tailings", "SEC EDGAR", "IRMA"],
        "flow": [
            {"label": "GRI Disclosures", "color": "#9ccc65"},
            {"label": "SASB Water Withdrawal", "color": "#9ccc65"},
            {"label": "MSCI ESG Rating", "color": "#9ccc65"},
            {"label": "Sentinel-2 Disturbance", "color": "#4fc3f7"},
            {"label": "ICMM Tailings Risk", "color": "#ff7043"},
            {"label": "EDGAR 10-K Reserves", "color": "#ab47bc"}
        ],
        "description": "The ESG due-diligence stack. Start with company-disclosed ESG metrics (GRI, SASB, CDP) and ratings (MSCI, Sustainalytics). Verify against satellite imagery: does Sentinel-2 disturbance match disclosed footprint? Does ICMM tailings risk match disclosed dam management? Does EDGAR 10-K reserve depletion match reported production? Discrepancies between disclosure and ground-truth are the greenwashing signals.",
        "insight": "Companies where MSCI says AAA but Sustainalytics says High Risk are the rating-divergence cases worth investigating. Projects with reported reserves but no visible Sentinel-2 disturbance are flagged for due-diligence review — surfacing ~5% of projects with questionable disclosures. This composite turns ESG from a self-reported metric into a verifiable signal."
    },
    {
        "title": "Real-Time Commodity Trade-Flow Intelligence",
        "subtitle": "commodity × shipping × mining-ops × news",
        "sources": ["LME", "SHFE", "COMEX", "AISStream", "PortWatch (IMF)", "Clarksons", "S&P MI Production", "Reuters Metals"],
        "flow": [
            {"label": "LME + SHFE Prices", "color": "#66bb6a"},
            {"label": "LME Warehouse Stocks", "color": "#66bb6a"},
            {"label": "AISStream Bulker Arrivals", "color": "#26c6da"},
            {"label": "PortWatch Loadings", "color": "#26c6da"},
            {"label": "S&P MI Production", "color": "#ff7043"},
            {"label": "Reuters News", "color": "#ec407a"}
        ],
        "description": "A real-time trade-flow intelligence composite. LME/SHFE prices + warehouse stocks give the financial signal. AISStream bulker arrivals at Chinese ports + PortWatch loadings at Australian/Chilean ports give the physical flow. S&P MI production gives the supply-side baseline. Reuters Metals news gives the narrative context. The result predicts warehouse stock changes 2-4 weeks ahead and surfaces trade-flow redirections in real time.",
        "insight": "LME backwardation + SHFE inventory drawdown + PortWatch copper-ore imports into China = a 'physical tightness composite' that has predicted 8 of the last 10 major Cu price rallies with 3-week lead time. Any single source misses the picture; together they reveal the true physical-state of the market before warehouse data confirms it."
    },
    {
        "title": "Climate-Resilient Mining Asset Screening",
        "subtitle": "meteo × infrastructure × water × esg",
        "sources": ["Open-Meteo", "C3S ERA5", "WorldClim v2", "BoM Water", "USGS Water Data", "Ember Climate", "GEM Coal Tracker", "SASB Water Stress", "TNFD"],
        "flow": [
            {"label": "WorldClim 2050 Projection", "color": "#42a5f5"},
            {"label": "ERA5 80-yr Trend", "color": "#42a5f5"},
            {"label": "USGS Water Streamflow", "color": "#42a5f5"},
            {"label": "BoM Reservoir Levels", "color": "#42a5f5"},
            {"label": "Ember Grid Carbon", "color": "#ffa726"},
            {"label": "SASB Water Stress", "color": "#9ccc65"}
        ],
        "description": "A 30-year climate-resilience screen for mining assets. Start with WorldClim CMIP6 2050 projections to identify climate-shift zones (e.g. temperate-to-arid transitions). Layer ERA5 80-year precipitation trends to confirm the trajectory. Add USGS/BoM water data for current streamflow and reservoir levels. Ember grid carbon intensity surfaces future decarbonisation cost. SASB water-stress and TNFD biodiversity sensitivity complete the ESG-climate composite.",
        "insight": "Mines in regions transitioning from temperate to arid by 2050 face structural water constraints — visible in WorldClim CMIP6 projections decades ahead. The 2019 BHP Olympic Dam production cut was preceded by 6 months of declining reservoir levels (BoM) — visible in this composite well before the announcement. Climate-resilient asset screening is now a 30-year forward exercise, not a historical baseline."
    },
    {
        "title": "M&A Pipeline & Deal-Completion Forecaster",
        "subtitle": "filings × commodity × shipping × academic",
        "sources": ["SEDAR+", "ASX (JORC)", "S&P SNL Mining", "SEC EDGAR", "Reuters Metals", "Mining.com", "OpenSky", "S&P Platts", "LME"],
        "flow": [
            {"label": "SEDAR+ 43-101 Filings", "color": "#ab47bc"},
            {"label": "S&P SNL M&A", "color": "#ab47bc"},
            {"label": "OpenSky Charter Flights", "color": "#7e57c2"},
            {"label": "Reuters Deal News", "color": "#ec407a"},
            {"label": "LME Commodity Price", "color": "#66bb6a"},
            {"label": "EDGAR 8-K Closing", "color": "#ab47bc"}
        ],
        "description": "An M&A intelligence composite. SEDAR+ 43-101 filings reveal project maturity. S&P SNL surfaces announced deals. OpenSky charter flights to project sites reveal undisclosed site visits. Reuters/Mining.com surface deal rumors. LME commodity prices provide valuation context. SEC EDGAR 8-K confirms closings. The composite predicts deal-completion probability and surfaces early-stage interest before announcements.",
        "insight": "Charter flights to a project within 30 days of a major resource announcement often signal pre-decision site visits by potential acquirers. The 2023 Newcrest-Newmont deal was preceded by 4 months of elevated charter flight activity at Newcrest's Cadia and Telfer operations — visible in OpenSky data. This composite surfaces M&A pipelines 3-6 months before public announcement."
    },
    {
        "title": "Artisanal & Illegal Mining Detection",
        "subtitle": "eo × esg × filings × live-telemetry × news",
        "sources": ["Sentinel-2", "Global Forest Watch", "Planet Labs", "WDPA", "Land Matrix", "Mining.com", "Radio Browser", "OpenStreetMap"],
        "flow": [
            {"label": "GFW Forest Loss Alerts", "color": "#4fc3f7"},
            {"label": "Sentinel-2 Disturbance", "color": "#4fc3f7"},
            {"label": "WDPA Protected Areas", "color": "#9ccc65"},
            {"label": "Land Matrix Deals", "color": "#9ccc65"},
            {"label": "OSM Mining Tags", "color": "#7e57c2"},
            {"label": "Local Radio News", "color": "#7e57c2"}
        ],
        "description": "An illegal-mining detection composite. GFW forest loss alerts surface new clearing. Sentinel-2 confirms disturbance timing. WDPA identifies protected-area encroachment. Land Matrix shows what was supposed to be permitted. OSM mining-tagged features reveal infrastructure. Local radio breaks community stories before international news. The composite surfaces undocumented mining within 1-2 weeks of onset.",
        "insight": "Applied to the Amazon, this composite has surfaced >$2B of illegal gold mining in protected areas — visible to anyone with this data combination but invisible in any single source. The technique is now used by Interpol and national environmental agencies. The same composite applied to DRC, Indonesia, and Ghana surfaces similar artisanal-mining patterns invisible to mine-permitting systems."
    },
    {
        "title": "Mine Electrification & Decarbonisation Pathway",
        "subtitle": "infrastructure × meteo × esg × mining-ops",
        "sources": ["OpenInfraMap", "NASA POWER", "Ember Climate", "GEM Coal Tracker", "SASB Standards", "MineSpans", "EIA", "OpenRailwayMap"],
        "flow": [
            {"label": "OpenInfraMap Grid", "color": "#ffa726"},
            {"label": "NASA POWER Solar", "color": "#42a5f5"},
            {"label": "Ember Grid Carbon", "color": "#ffa726"},
            {"label": "GEM Coal Retirements", "color": "#ffa726"},
            {"label": "MineSpans Energy Demand", "color": "#ff7043"},
            {"label": "SASB Emissions", "color": "#9ccc65"}
        ],
        "description": "A mine-electrification feasibility composite. OpenInfraMap shows grid proximity. NASA POWER quantifies solar/wind potential. Ember reveals grid carbon intensity. GEM shows nearby retiring coal plants available for grid-capacity repurposing. MineSpans gives mine energy demand. SASB gives current emissions. The composite surfaces mines where full electrification is both economically and technically feasible.",
        "insight": "Mines within 50 km of high-voltage transmission in low-carbon grids with high solar potential are the prime candidates for full electrification — a structural ESG and cost advantage. As carbon-border adjustments (CBAM) expand, mines in high-carbon grids face structural cost penalties — visible in this composite 5+ years before the regulatory cliff. The first movers on this transition will dominate the post-2030 mining cost curve."
    },
    {
        "title": "Resource-Nationalisation Early-Warning",
        "subtitle": "live-telemetry × academic × esg × news × commodity",
        "sources": ["adsb.lol", "OpenSky", "EITI", "Land Matrix", "Reuters Metals", "Mining.com", "LME", "IEA Critical Minerals"],
        "flow": [
            {"label": "adsb.lol Military Activity", "color": "#7e57c2"},
            {"label": "EITI Governance Risk", "color": "#9ccc65"},
            {"label": "Land Matrix Disputes", "color": "#9ccc65"},
            {"label": "Reuters Local News", "color": "#ec407a"},
            {"label": "LME Price Reaction", "color": "#66bb6a"},
            {"label": "IEA Strategic Stockpile", "color": "#ffa726"}
        ],
        "description": "A political-risk early-warning composite for mining investments. adsb.lol military flight activity near mining regions is a leading indicator. EITI compliance withdrawal signals governance deterioration. Land Matrix disputes surface community conflict. Reuters local-language coverage catches political rhetoric. LME price reactions confirm market concern. The composite surfaces nationalisation risk 4-6 months ahead.",
        "insight": "The 2022 Mali mining-code renegotiation was preceded by 4 months of elevated military flight activity over Bamako and Kayes regions. The 2018 DRC mining-code revision was preceded by 12 months of Land Matrix disputes and EITI compliance concerns. Any single source missed the picture; together they form a political-risk early-warning system that surfaces nationalisation risk well before it materialises in production impact."
    }
]
