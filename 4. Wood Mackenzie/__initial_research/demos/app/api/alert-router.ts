import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { alerts } from "../db/schema";
import { eq, desc } from "drizzle-orm";

export const alertRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(alerts).orderBy(desc(alerts.createdAt));
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(alerts).where(eq(alerts.id, input.id));
      return result[0] || null;
    }),

  create: publicQuery
    .input(z.object({
      name: z.string(),
      commodityId: z.number().optional(),
      assetId: z.number().optional(),
      alertType: z.enum(["price_threshold", "price_divergence", "esg_incident", "production_change", "cost_guidance"]),
      condition: z.object({
        operator: z.string(),
        value: z.number(),
        unit: z.string(),
      }),
      frequency: z.enum(["realtime", "hourly", "daily", "weekly"]),
      userId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(alerts).values({
        ...input,
        commodityId: input.commodityId || null,
        assetId: input.assetId || null,
        userId: input.userId || 1,
        condition: JSON.stringify(input.condition),
        notificationChannels: JSON.stringify({ email: true, inApp: true, slack: false }),
      });
      return { id: Number(result[0].insertId) };
    }),

  toggle: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db.select().from(alerts).where(eq(alerts.id, input.id));
      if (!existing[0]) return { success: false };
      
      await db.update(alerts)
        .set({ isActive: !existing[0].isActive })
        .where(eq(alerts.id, input.id));
      return { success: true, isActive: !existing[0].isActive };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(alerts).where(eq(alerts.id, input.id));
      return { success: true };
    }),

});
