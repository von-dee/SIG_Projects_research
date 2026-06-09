import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { commodities, miningAssets, newsItems } from "../db/schema";
import { desc, sql } from "drizzle-orm";

export const dashboardRouter = createRouter({
  getSummary: publicQuery.query(async () => {
    const db = getDb();
    const [commodityList, assetList] = await Promise.all([
      db.select().from(commodities),
      db.select().from(miningAssets),
    ]);

    const totalCommodities = commodityList.length;
    const totalAssets = assetList.length;
    const operatingAssets = assetList.filter((a) => a.status === "operating").length;
    const avgEsg = Math.round(assetList.reduce((s, a) => s + (a.esgScore || 0), 0) / assetList.length);
    
    const totalProduction = assetList.reduce((s, a) => s + Number(a.productionVolume), 0);
    
    const commodityPrices = commodityList.map((c) => ({
      name: c.name,
      symbol: c.symbol,
      price: Number(c.currentPrice),
      change: Number(c.priceChange),
      changePercent: Number(c.priceChangePercent),
      unit: c.unit,
    }));

    const intelligenceCards = [
      {
        id: 1,
        title: "Copper Supply Alert",
        summary: "Chilean water restrictions could reduce copper output by 5-8% in H2 2026. Escondida and Collahuasi most at risk. Monitor Q2 production guidance closely.",
        impact: "high",
        commodity: "Copper",
        timestamp: "2 hours ago",
      },
      {
        id: 2,
        title: "Lithium Price Floor",
        summary: "Lithium carbonate prices appear to have stabilized around $14,000-15,000/t after 18-month decline. High-cost Australian spodumene producers cutting output supports floor.",
        impact: "medium",
        commodity: "Lithium Carbonate",
        timestamp: "5 hours ago",
      },
      {
        id: 3,
        title: "Nickel Oversupply Risk",
        summary: "Indonesian HPAL expansions adding 400kt Class 1 nickel capacity by 2027. Battery-grade nickel moving into surplus. Downward pressure on prices expected.",
        impact: "high",
        commodity: "Nickel",
        timestamp: "8 hours ago",
      },
      {
        id: 4,
        title: "Gold Central Bank Demand",
        summary: "EM central banks added 290 tonnes to reserves in Q1 2026, continuing diversification trend. Supports price floor above $2,200/oz.",
        impact: "medium",
        commodity: "Gold",
        timestamp: "12 hours ago",
      },
    ];

    return {
      metrics: {
        totalCommodities,
        totalAssets,
        operatingAssets,
        avgEsg,
        totalProduction: Math.round(totalProduction / 1000000),
      },
      commodityPrices,
      intelligenceCards,
    };
  }),

  getNews: publicQuery.query(async () => {
    const db = getDb();
    const news = await db.select().from(newsItems).orderBy(desc(newsItems.publishedAt)).limit(10);
    return news.map((n) => ({
      ...n,
      commodities: n.commodities as string[],
    }));
  }),

  getIntelligence: publicQuery.query(async () => {
    return {
      dailyBrief: "Global mining markets are navigating a complex landscape of supply constraints, ESG pressures, and energy transition demand. Copper remains in structural deficit with Chilean water risks compounding grade decline. Lithium has found a price floor but faces oversupply risk from delayed African projects. Gold benefits from persistent geopolitical uncertainty and central bank diversification. Nickel is the most challenged battery metal with Indonesian supply growth outpacing demand.",
      keyRisks: [
        "Chilean drought impacting 15% of global copper supply",
        "Indonesian nickel oversupply by 2027",
        "EU CBAM increasing cost for carbon-intensive aluminium",
        "DRC cobalt ESG supply chain risks",
      ],
      opportunities: [
        "Lithium price floor creates entry point for long-term buyers",
        "Copper deficit supports elevated prices through 2028",
        "Gold safe-haven demand remains strong",
        "Low-carbon aluminium premium expanding",
      ],
    };
  }),
});
