import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { miningAssets, commodities } from "../db/schema";
import { eq, and, desc, asc, sql } from "drizzle-orm";

export const assetRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        commodityId: z.number().optional(),
        country: z.string().optional(),
        mineType: z.string().optional(),
        status: z.string().optional(),
        minEsg: z.number().optional(),
        maxCost: z.number().optional(),
        search: z.string().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      let query = db.select().from(miningAssets);
      
      const results = await query;
      
      if (!input) return results;
      
      return results.filter((a) => {
        if (input.commodityId && a.commodityId !== input.commodityId) return false;
        if (input.country && !a.country.toLowerCase().includes(input.country.toLowerCase())) return false;
        if (input.mineType && a.mineType !== input.mineType) return false;
        if (input.status && a.status !== input.status) return false;
        if (input.minEsg && a.esgScore && a.esgScore < input.minEsg) return false;
        if (input.maxCost && Number(a.c1Cost) > input.maxCost) return false;
        if (input.search && !a.name.toLowerCase().includes(input.search.toLowerCase()) && !a.company.toLowerCase().includes(input.search.toLowerCase())) return false;
        return true;
      }).sort((a, b) => {
        const field = input.sortBy || "c1Cost";
        const order = input.sortOrder === "asc" ? 1 : -1;
        const aVal = Number((a as Record<string, unknown>)[field] || 0);
        const bVal = Number((b as Record<string, unknown>)[field] || 0);
        return (aVal - bVal) * order;
      });
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const results = await db.select().from(miningAssets).where(eq(miningAssets.id, input.id));
      return results[0] || null;
    }),

  getCostCurve: publicQuery
    .input(z.object({ commodityId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const assets = await db
        .select()
        .from(miningAssets)
        .where(eq(miningAssets.commodityId, input.commodityId))
        .orderBy(asc(miningAssets.c1Cost));

      const commodityResult = await db
        .select()
        .from(commodities)
        .where(eq(commodities.id, input.commodityId));
      const commodity = commodityResult[0];

      const cumulative: Array<{
        name: string;
        company: string;
        country: string;
        c1Cost: number;
        aisc: number;
        production: number;
        cumulativeProduction: number;
        mineType: string;
        esgScore: number | null;
      }> = [];
      
      let cumProd = 0;
      for (const asset of assets) {
        const prod = Number(asset.productionVolume);
        cumProd += prod;
        cumulative.push({
          name: asset.name,
          company: asset.company,
          country: asset.country,
          c1Cost: Number(asset.c1Cost),
          aisc: Number(asset.aisc),
          production: prod,
          cumulativeProduction: cumProd,
          mineType: asset.mineType,
          esgScore: asset.esgScore,
        });
      }

      return {
        commodity: commodity || null,
        assets: cumulative,
        totalProduction: cumProd,
        medianCost: cumulative.length > 0 ? cumulative[Math.floor(cumulative.length / 2)].c1Cost : 0,
        lowestCost: cumulative.length > 0 ? cumulative[0].c1Cost : 0,
        highestCost: cumulative.length > 0 ? cumulative[cumulative.length - 1].c1Cost : 0,
      };
    }),

  compare: publicQuery
    .input(z.object({ ids: z.array(z.number()) }))
    .query(async ({ input }) => {
      const db = getDb();
      const results = [];
      for (const id of input.ids) {
        const assets = await db.select().from(miningAssets).where(eq(miningAssets.id, id));
        if (assets[0]) results.push(assets[0]);
      }
      return results;
    }),

  getMapData: publicQuery.query(async () => {
    const db = getDb();
    const assets = await db.select().from(miningAssets);
    return assets
      .filter((a) => a.latitude && a.longitude)
      .map((a) => ({
        id: a.id,
        name: a.name,
        company: a.company,
        country: a.country,
        lat: Number(a.latitude),
        lng: Number(a.longitude),
        commodityId: a.commodityId,
        status: a.status,
        production: Number(a.productionVolume),
        c1Cost: Number(a.c1Cost),
      }));
  }),

  getStats: publicQuery.query(async () => {
    const db = getDb();
    const assets = await db.select().from(miningAssets);
    
    const byCommodity: Record<number, { count: number; totalProduction: number; avgCost: number }> = {};
    const byCountry: Record<string, number> = {};
    const byType: Record<string, number> = {};
    
    for (const a of assets) {
      if (!byCommodity[a.commodityId]) {
        byCommodity[a.commodityId] = { count: 0, totalProduction: 0, avgCost: 0 };
      }
      byCommodity[a.commodityId].count++;
      byCommodity[a.commodityId].totalProduction += Number(a.productionVolume);
      byCommodity[a.commodityId].avgCost += Number(a.c1Cost);
      
      byCountry[a.country] = (byCountry[a.country] || 0) + 1;
      byType[a.mineType] = (byType[a.mineType] || 0) + 1;
    }
    
    for (const cid of Object.keys(byCommodity)) {
      const c = byCommodity[Number(cid)];
      c.avgCost = Math.round((c.avgCost / c.count) * 100) / 100;
    }
    
    return {
      totalAssets: assets.length,
      operatingAssets: assets.filter((a) => a.status === "operating").length,
      avgEsg: Math.round(assets.reduce((s, a) => s + (a.esgScore || 0), 0) / assets.length),
      byCommodity,
      byCountry,
      byType,
    };
  }),
});
