import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { commodities } from "../db/schema";
import { eq, desc } from "drizzle-orm";

export const commodityRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        category: z.string().optional(),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const results = await db.select().from(commodities).orderBy(desc(commodities.currentPrice));
      
      if (!input) return results;
      
      return results.filter((c) => {
        if (input.category && c.category !== input.category) return false;
        if (input.search && !c.name.toLowerCase().includes(input.search.toLowerCase())) return false;
        return true;
      });
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const results = await db.select().from(commodities).where(eq(commodities.id, input.id));
      return results[0] || null;
    }),

  getPriceHistory: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const results = await db.select().from(commodities).where(eq(commodities.id, input.id));
      const commodity = results[0];
      if (!commodity) return [];
      
      const chartData = commodity.chartData as number[] || [];
      return chartData.map((price, i) => ({
        month: ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"][i],
        price,
      }));
    }),

  getMarketOverview: publicQuery.query(async () => {
    const db = getDb();
    const allCommodities = await db.select().from(commodities);
    
    const totalMarketCap = allCommodities.reduce((sum, c) => {
      const price = Number(c.currentPrice);
      return sum + price;
    }, 0);
    
    const avgChange = allCommodities.reduce((sum, c) => sum + Number(c.priceChangePercent), 0) / allCommodities.length;
    const gainers = allCommodities.filter((c) => Number(c.priceChangePercent) > 0).length;
    const losers = allCommodities.filter((c) => Number(c.priceChangePercent) < 0).length;
    
    return {
      totalCommodities: allCommodities.length,
      totalMarketCap: Math.round(totalMarketCap),
      avgChange: Number(avgChange.toFixed(2)),
      gainers,
      losers,
      topMover: allCommodities.sort((a, b) => Math.abs(Number(b.priceChangePercent)) - Math.abs(Number(a.priceChangePercent)))[0],
    };
  }),
});
