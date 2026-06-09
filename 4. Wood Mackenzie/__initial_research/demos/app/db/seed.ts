import { getDb } from "../api/queries/connection";
import {
  commodities,
  miningAssets,
  newsItems,
} from "./schema";

async function seed() {
  const db = getDb();

  // ─── Seed Commodities ──────────────────────────────────────────────────
  const commodityData = [
    {
      name: "Copper",
      symbol: "CU",
      category: "base_metals" as const,
      unit: "USD/tonne",
      currentPrice: "9875.50",
      priceChange: "125.30",
      priceChangePercent: "1.28",
      description: "Copper is a critical base metal used extensively in construction, electrical equipment, and increasingly in renewable energy and EV applications. Global demand is driven by the energy transition.",
      imageUrl: "/commodity-copper.jpg",
      supplyDemand: JSON.stringify({ supply: 26.2, demand: 27.1, deficit: 0.9, forecast: "Supply deficit expected to widen through 2027" }),
      chartData: JSON.stringify([9200, 9350, 9100, 9480, 9620, 9550, 9700, 9850, 9780, 9900, 9750, 9875]),
    },
    {
      name: "Lithium Carbonate",
      symbol: "LI",
      category: "battery_minerals" as const,
      unit: "USD/tonne",
      currentPrice: "14250.00",
      priceChange: "-320.00",
      priceChangePercent: "-2.20",
      description: "Lithium is the key battery mineral powering the electric vehicle revolution. Prices have corrected from 2022 peaks but long-term fundamentals remain strong as EV adoption accelerates globally.",
      imageUrl: "/commodity-lithium.jpg",
      supplyDemand: JSON.stringify({ supply: 1.05, demand: 1.12, deficit: 0.07, forecast: "Tight market balance with new supply delayed" }),
      chartData: JSON.stringify([28500, 26200, 24100, 22300, 21000, 19500, 18200, 17200, 16500, 15600, 14800, 14250]),
    },
    {
      name: "Gold",
      symbol: "AU",
      category: "precious_metals" as const,
      unit: "USD/oz",
      currentPrice: "2345.80",
      priceChange: "18.50",
      priceChangePercent: "0.79",
      description: "Gold serves as a safe-haven asset and inflation hedge. Central bank buying and geopolitical uncertainty continue to support prices at historically elevated levels.",
      imageUrl: "/commodity-gold.jpg",
      supplyDemand: JSON.stringify({ supply: 4890, demand: 4780, deficit: -110, forecast: "Stable demand with strong central bank purchases" }),
      chartData: JSON.stringify([2150, 2180, 2220, 2280, 2310, 2290, 2320, 2350, 2330, 2360, 2325, 2345]),
    },
    {
      name: "Nickel",
      symbol: "NI",
      category: "base_metals" as const,
      unit: "USD/tonne",
      currentPrice: "18230.00",
      priceChange: "-185.00",
      priceChangePercent: "-1.01",
      description: "Nickel is essential for stainless steel and lithium-ion batteries. Indonesian supply growth has pressured prices, but class 1 nickel remains in structural deficit.",
      imageUrl: "/commodity-nickel.jpg",
      supplyDemand: JSON.stringify({ supply: 3.45, demand: 3.38, deficit: -0.07, forecast: "Oversupply in NPI, deficit in battery-grade" }),
      chartData: JSON.stringify([16800, 17200, 17500, 18200, 18900, 19200, 18800, 18500, 18700, 18400, 18600, 18230]),
    },
    {
      name: "Aluminium",
      symbol: "AL",
      category: "base_metals" as const,
      unit: "USD/tonne",
      currentPrice: "2560.00",
      priceChange: "42.00",
      priceChangePercent: "1.67",
      description: "Aluminium is the most widely used non-ferrous metal. Energy costs remain a key driver of production economics, with European smelters facing structurally higher costs.",
      imageUrl: "/commodity-aluminum.jpg",
      supplyDemand: JSON.stringify({ supply: 70.2, demand: 71.5, deficit: 1.3, forecast: "Growing deficit as Chinese capacity constrained" }),
      chartData: JSON.stringify([2300, 2350, 2280, 2400, 2450, 2420, 2480, 2520, 2500, 2540, 2518, 2560]),
    },
    {
      name: "Cobalt",
      symbol: "CO",
      category: "battery_minerals" as const,
      unit: "USD/tonne",
      currentPrice: "33450.00",
      priceChange: "-780.00",
      priceChangePercent: "-2.28",
      description: "Cobalt is a crucial component in lithium-ion battery cathodes. DRC dominance creates supply concentration risk, but cobalt-free chemistries threaten long-term demand.",
      imageUrl: "/commodity-cobalt.jpg",
      supplyDemand: JSON.stringify({ supply: 230, demand: 215, deficit: -15, forecast: "Oversupplied market with DRC production growth" }),
      chartData: JSON.stringify([42000, 39800, 37500, 36500, 38000, 37200, 36000, 35200, 34500, 34000, 34230, 33450]),
    },
    {
      name: "Iron Ore",
      symbol: "FE",
      category: "bulk_commodities" as const,
      unit: "USD/tonne",
      currentPrice: "108.50",
      priceChange: "2.30",
      priceChangePercent: "2.17",
      description: "Iron ore is the primary raw material for steelmaking. Chinese property sector weakness weighs on demand, but Indian and Southeast Asian demand provides offset.",
      imageUrl: "/commodity-iron.jpg",
      supplyDemand: JSON.stringify({ supply: 2500, demand: 2450, deficit: -50, forecast: "Balanced market with Australian supply growth" }),
      chartData: JSON.stringify([98, 102, 105, 108, 112, 110, 107, 105, 103, 106, 104, 108]),
    },
    {
      name: "Zinc",
      symbol: "ZN",
      category: "base_metals" as const,
      unit: "USD/tonne",
      currentPrice: "2845.00",
      priceChange: "-32.00",
      priceChangePercent: "-1.11",
      description: "Zinc is primarily used for galvanizing steel. Mine closures and declining ore grades support a structural supply deficit outlook.",
      imageUrl: "/commodity-copper.jpg",
      supplyDemand: JSON.stringify({ supply: 13.8, demand: 14.2, deficit: 0.4, forecast: "Structural deficit from mine depletion" }),
      chartData: JSON.stringify([2600, 2650, 2700, 2750, 2800, 2780, 2820, 2900, 2880, 2920, 2877, 2845]),
    },
  ];

  for (const c of commodityData) {
    await db.insert(commodities).values(c);
  }
  console.log(`✅ Seeded ${commodityData.length} commodities`);

  // ─── Seed Mining Assets ────────────────────────────────────────────────
  const assetData = [
    // Copper assets
    { name: "Escondida", company: "BHP", country: "Chile", commodityId: 1, latitude: "-24.27", longitude: "-69.07", productionVolume: "1070000", productionUnit: "tonnes", c1Cost: "1.15", aisc: "1.45", mineType: "open_pit" as const, status: "operating" as const, grade: "0.6300", reserveLife: 28, esgScore: 72, carbonIntensity: "2.8", waterUsage: "850.00", powerSource: "Grid + Solar", fiscalYear: 2025 },
    { name: "Collahuasi", company: "Anglo American", country: "Chile", commodityId: 1, latitude: "-20.97", longitude: "-68.58", productionVolume: "620000", productionUnit: "tonnes", c1Cost: "1.35", aisc: "1.62", mineType: "open_pit" as const, status: "operating" as const, grade: "0.8100", reserveLife: 22, esgScore: 68, carbonIntensity: "3.2", waterUsage: "620.00", powerSource: "Grid", fiscalYear: 2025 },
    { name: "Cerro Verde", company: "Freeport-McMoRan", country: "Peru", commodityId: 1, latitude: "-16.02", longitude: "-71.57", productionVolume: "455000", productionUnit: "tonnes", c1Cost: "1.55", aisc: "1.88", mineType: "open_pit" as const, status: "operating" as const, grade: "0.3700", reserveLife: 35, esgScore: 65, carbonIntensity: "4.1", waterUsage: "1200.00", powerSource: "Hydro", fiscalYear: 2025 },
    { name: "Kamoto", company: "Ivanhoe Mines", country: "DRC", commodityId: 1, latitude: "-10.71", longitude: "25.40", productionVolume: "393000", productionUnit: "tonnes", c1Cost: "1.20", aisc: "1.50", mineType: "underground" as const, status: "operating" as const, grade: "3.8700", reserveLife: 18, esgScore: 58, carbonIntensity: "5.5", waterUsage: "450.00", powerSource: "Grid", fiscalYear: 2025 },
    { name: "Morenci", company: "Freeport-McMoRan", country: "USA", commodityId: 1, latitude: "33.05", longitude: "-109.32", productionVolume: "389000", productionUnit: "tonnes", c1Cost: "1.85", aisc: "2.20", mineType: "open_pit" as const, status: "operating" as const, grade: "0.2800", reserveLife: 25, esgScore: 78, carbonIntensity: "3.8", waterUsage: "1100.00", powerSource: "Grid", fiscalYear: 2025 },
    { name: "Buenavista", company: "Southern Copper", country: "Mexico", commodityId: 1, latitude: "31.08", longitude: "-110.33", productionVolume: "338000", productionUnit: "tonnes", c1Cost: "1.65", aisc: "1.95", mineType: "open_pit" as const, status: "operating" as const, grade: "0.4400", reserveLife: 30, esgScore: 62, carbonIntensity: "4.5", waterUsage: "780.00", powerSource: "Grid", fiscalYear: 2025 },
    { name: "Antamina", company: "Glencore", country: "Peru", commodityId: 1, latitude: "-9.54", longitude: "-77.03", productionVolume: "310000", productionUnit: "tonnes", c1Cost: "1.40", aisc: "1.72", mineType: "open_pit" as const, status: "operating" as const, grade: "1.0200", reserveLife: 15, esgScore: 70, carbonIntensity: "3.0", waterUsage: "550.00", powerSource: "Hydro", fiscalYear: 2025 },
    { name: "El Teniente", company: "Codelco", country: "Chile", commodityId: 1, latitude: "-34.08", longitude: "-70.48", productionVolume: "459000", productionUnit: "tonnes", c1Cost: "1.70", aisc: "2.05", mineType: "underground" as const, status: "operating" as const, grade: "0.9800", reserveLife: 45, esgScore: 74, carbonIntensity: "4.8", waterUsage: "920.00", powerSource: "Hydro", fiscalYear: 2025 },
    { name: "Los Bronces", company: "Anglo American", country: "Chile", commodityId: 1, latitude: "-32.93", longitude: "-70.30", productionVolume: "280000", productionUnit: "tonnes", c1Cost: "1.95", aisc: "2.30", mineType: "open_pit" as const, status: "operating" as const, grade: "0.8500", reserveLife: 12, esgScore: 71, carbonIntensity: "5.2", waterUsage: "1500.00", powerSource: "Hydro", fiscalYear: 2025 },
    { name: "Grasberg", company: "Freeport-McMoRan", country: "Indonesia", commodityId: 1, latitude: "-4.05", longitude: "137.12", productionVolume: "580000", productionUnit: "tonnes", c1Cost: "0.45", aisc: "0.75", mineType: "open_pit" as const, status: "operating" as const, grade: "1.0600", reserveLife: 20, esgScore: 60, carbonIntensity: "6.2", waterUsage: "2000.00", powerSource: "Diesel", fiscalYear: 2025 },

    // Lithium assets
    { name: "Salar de Atacama", company: "Albemarle", country: "Chile", commodityId: 2, latitude: "-23.45", longitude: "-68.25", productionVolume: "85000", productionUnit: "tonnes LCE", c1Cost: "4200.00", aisc: "5200.00", mineType: "placer" as const, status: "operating" as const, grade: "0.2700", reserveLife: 40, esgScore: 68, carbonIntensity: "1.5", waterUsage: "2500.00", powerSource: "Solar", fiscalYear: 2025 },
    { name: "Greenbushes", company: "Talison Lithium", country: "Australia", commodityId: 2, latitude: "-33.86", longitude: "116.05", productionVolume: "162000", productionUnit: "tonnes LCE", c1Cost: "3800.00", aisc: "4600.00", mineType: "open_pit" as const, status: "operating" as const, grade: "2.8000", reserveLife: 25, esgScore: 82, carbonIntensity: "2.2", waterUsage: "380.00", powerSource: "Grid", fiscalYear: 2025 },
    { name: "Pilgangoora", company: "Pilbara Minerals", country: "Australia", commodityId: 2, latitude: "-21.60", longitude: "118.85", productionVolume: "80000", productionUnit: "tonnes LCE", c1Cost: "5500.00", aisc: "6800.00", mineType: "open_pit" as const, status: "operating" as const, grade: "1.3500", reserveLife: 18, esgScore: 76, carbonIntensity: "2.8", waterUsage: "420.00", powerSource: "Solar + Grid", fiscalYear: 2025 },
    { name: "Wodgina", company: "Mineral Resources", country: "Australia", commodityId: 2, latitude: "-21.32", longitude: "118.72", productionVolume: "75000", productionUnit: "tonnes LCE", c1Cost: "5800.00", aisc: "7200.00", mineType: "open_pit" as const, status: "operating" as const, grade: "1.1700", reserveLife: 22, esgScore: 74, carbonIntensity: "3.0", waterUsage: "350.00", powerSource: "Diesel + Solar", fiscalYear: 2025 },
    { name: "Salar de Cauchari", company: "Allkem", country: "Argentina", commodityId: 2, latitude: "-24.35", longitude: "-66.85", productionVolume: "25000", productionUnit: "tonnes LCE", c1Cost: "3900.00", aisc: "4800.00", mineType: "placer" as const, status: "operating" as const, grade: "0.4000", reserveLife: 30, esgScore: 65, carbonIntensity: "1.8", waterUsage: "2800.00", powerSource: "Solar", fiscalYear: 2025 },

    // Gold assets
    { name: "Nevada Gold Mines", company: "Barrick/Newmont", country: "USA", commodityId: 3, latitude: "40.79", longitude: "-116.03", productionVolume: "3100000", productionUnit: "oz", c1Cost: "950.00", aisc: "1250.00", mineType: "open_pit" as const, status: "operating" as const, grade: "2.9000", reserveLife: 15, esgScore: 80, carbonIntensity: "3.5", waterUsage: "2200.00", powerSource: "Grid", fiscalYear: 2025 },
    { name: "Muruntau", company: "Navoi", country: "Uzbekistan", commodityId: 3, latitude: "41.45", longitude: "64.42", productionVolume: "2900000", productionUnit: "oz", c1Cost: "680.00", aisc: "920.00", mineType: "open_pit" as const, status: "operating" as const, grade: "2.4000", reserveLife: 20, esgScore: 55, carbonIntensity: "5.8", waterUsage: "3500.00", powerSource: "Grid", fiscalYear: 2025 },
    { name: "Olimpiada", company: "Polyus", country: "Russia", commodityId: 3, latitude: "59.72", longitude: "92.70", productionVolume: "1200000", productionUnit: "oz", c1Cost: "620.00", aisc: "850.00", mineType: "open_pit" as const, status: "operating" as const, grade: "3.8000", reserveLife: 22, esgScore: 58, carbonIntensity: "4.2", waterUsage: "1800.00", powerSource: "Hydro", fiscalYear: 2025 },
    { name: "Pueblo Viejo", company: "Barrick", country: "Dominican Republic", commodityId: 3, latitude: "18.85", longitude: "-70.18", productionVolume: "800000", productionUnit: "oz", c1Cost: "780.00", aisc: "1050.00", mineType: "open_pit" as const, status: "operating" as const, grade: "3.2000", reserveLife: 18, esgScore: 72, carbonIntensity: "3.8", waterUsage: "1200.00", powerSource: "Grid", fiscalYear: 2025 },
    { name: "Kibali", company: "Barrick", country: "DRC", commodityId: 3, latitude: "3.05", longitude: "29.58", productionVolume: "750000", productionUnit: "oz", c1Cost: "720.00", aisc: "980.00", mineType: "underground" as const, status: "operating" as const, grade: "4.5000", reserveLife: 12, esgScore: 62, carbonIntensity: "4.5", waterUsage: "800.00", powerSource: "Grid + Hydro", fiscalYear: 2025 },

    // Nickel assets
    { name: "Sorowako", company: "Vale", country: "Indonesia", commodityId: 4, latitude: "-2.52", longitude: "121.37", productionVolume: "78000", productionUnit: "tonnes Ni", c1Cost: "6.50", aisc: "8.20", mineType: "open_pit" as const, status: "operating" as const, grade: "1.8500", reserveLife: 30, esgScore: 64, carbonIntensity: "8.5", waterUsage: "1500.00", powerSource: "Coal + Hydro", fiscalYear: 2025 },
    { name: "Ravensthorpe", company: "First Quantum", country: "Australia", commodityId: 4, latitude: "-33.68", longitude: "120.05", productionVolume: "30000", productionUnit: "tonnes Ni", c1Cost: "7.80", aisc: "9.50", mineType: "open_pit" as const, status: "operating" as const, grade: "0.7200", reserveLife: 15, esgScore: 75, carbonIntensity: "4.2", waterUsage: "800.00", powerSource: "Grid + Wind", fiscalYear: 2025 },
    { name: "Sudbury Basin", company: "Vale", country: "Canada", commodityId: 4, latitude: "46.49", longitude: "-81.01", productionVolume: "65000", productionUnit: "tonnes Ni", c1Cost: "5.20", aisc: "6.80", mineType: "underground" as const, status: "operating" as const, grade: "1.2000", reserveLife: 25, esgScore: 85, carbonIntensity: "2.5", waterUsage: "600.00", powerSource: "Hydro", fiscalYear: 2025 },
    { name: "Norilsk", company: "Nornickel", country: "Russia", commodityId: 4, latitude: "69.35", longitude: "88.22", productionVolume: "220000", productionUnit: "tonnes Ni", c1Cost: "4.80", aisc: "6.20", mineType: "underground" as const, status: "operating" as const, grade: "1.5000", reserveLife: 50, esgScore: 52, carbonIntensity: "6.5", waterUsage: "2500.00", powerSource: "Gas", fiscalYear: 2025 },

    // Aluminium assets (smelters)
    { name: "Al Taweelah", company: "EGA", country: "UAE", commodityId: 5, latitude: "24.80", longitude: "54.65", productionVolume: "1500000", productionUnit: "tonnes", c1Cost: "1850.00", aisc: "2150.00", mineType: "open_pit" as const, status: "operating" as const, grade: "0.0000", reserveLife: 50, esgScore: 78, carbonIntensity: "4.0", waterUsage: "300.00", powerSource: "Gas + Solar", fiscalYear: 2025 },
    { name: "Hongqiao", company: "China Hongqiao", country: "China", commodityId: 5, latitude: "37.35", longitude: "117.85", productionVolume: "5800000", productionUnit: "tonnes", c1Cost: "1650.00", aisc: "1950.00", mineType: "open_pit" as const, status: "operating" as const, grade: "0.0000", reserveLife: 50, esgScore: 60, carbonIntensity: "12.0", waterUsage: "450.00", powerSource: "Coal", fiscalYear: 2025 },

    // Iron ore assets
    { name: "Hamersley", company: "Rio Tinto", country: "Australia", commodityId: 7, latitude: "-22.80", longitude: "117.90", productionVolume: "330000000", productionUnit: "tonnes", c1Cost: "18.50", aisc: "22.00", mineType: "open_pit" as const, status: "operating" as const, grade: "62.00", reserveLife: 18, esgScore: 82, carbonIntensity: "1.2", waterUsage: "280.00", powerSource: "Diesel + Solar", fiscalYear: 2025 },
    { name: "Carajas", company: "Vale", country: "Brazil", commodityId: 7, latitude: "-6.05", longitude: "-50.20", productionVolume: "200000000", productionUnit: "tonnes", c1Cost: "15.00", aisc: "18.50", mineType: "open_pit" as const, status: "operating" as const, grade: "65.40", reserveLife: 25, esgScore: 75, carbonIntensity: "1.5", waterUsage: "350.00", powerSource: "Hydro", fiscalYear: 2025 },
  ];

  for (const a of assetData) {
    await db.insert(miningAssets).values(a);
  }
  console.log(`✅ Seeded ${assetData.length} mining assets`);

  // ─── Seed News Items ───────────────────────────────────────────────────
  const newsData = [
    { title: "BHP completes Truesilver acquisition, adding 200kt copper equivalent", source: "Mining Weekly", summary: "The deal strengthens BHP's position in the global copper market as supply deficits widen.", commodities: JSON.stringify(["Copper"]), sentiment: "positive" as const },
    { title: "Chilean copper mines face water stress as drought continues", source: "Reuters", summary: "Water restrictions at major Chilean copper mines could reduce output by 5-8% in 2026.", commodities: JSON.stringify(["Copper"]), sentiment: "negative" as const },
    { title: "Lithium carbonate prices stabilise after 18-month decline", source: "Benchmark Mineral Intelligence", summary: "Market consensus suggests prices have found a floor as high-cost producers cut output.", commodities: JSON.stringify(["Lithium Carbonate"]), sentiment: "positive" as const },
    { title: "Indonesia expands nickel processing capacity by 40%", source: "S&P Global", summary: "New HPAL plants coming online will increase Class 1 nickel supply significantly.", commodities: JSON.stringify(["Nickel"]), sentiment: "neutral" as const },
    { title: "China's iron ore imports hit record high in Q1 2026", source: "Financial Times", summary: "Strong steel production and restocking drove imports to 320 million tonnes.", commodities: JSON.stringify(["Iron Ore"]), sentiment: "positive" as const },
    { title: "Barrick Gold announces 15% increase in reserves at Nevada", source: "Mining.com", summary: "Exploration success extends mine life at the world's largest gold mining complex.", commodities: JSON.stringify(["Gold"]), sentiment: "positive" as const },
    { title: "EU Carbon Border Adjustment Mechanism to impact aluminium imports", source: "Bloomberg", summary: "CBAM implementation in 2026 will add $150-200/tonne to carbon-intensive aluminium imports.", commodities: JSON.stringify(["Aluminium"]), sentiment: "negative" as const },
    { title: "DRC cobalt supply chain faces ESG scrutiny after new reports", source: "Amnesty International", summary: "New investigation reveals ongoing child labor in artisanal cobalt mining in southern DRC.", commodities: JSON.stringify(["Cobalt"]), sentiment: "negative" as const },
  ];

  for (const n of newsData) {
    await db.insert(newsItems).values(n);
  }
  console.log(`✅ Seeded ${newsData.length} news items`);

  console.log("🎉 Seed complete!");
}

seed().catch(console.error);
