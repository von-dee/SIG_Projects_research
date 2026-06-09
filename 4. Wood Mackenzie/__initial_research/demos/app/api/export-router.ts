import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { exports } from "../db/schema";
import { eq, desc } from "drizzle-orm";

export const exportRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(exports).orderBy(desc(exports.createdAt));
  }),

  create: publicQuery
    .input(z.object({
      name: z.string(),
      fileType: z.enum(["csv", "xlsx", "pdf", "json"]),
      source: z.enum(["cost_curve", "market_data", "scenario", "chat_export"]),
      recordCount: z.number().default(0),
      userId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(exports).values({
        ...input,
        userId: input.userId || 1,
        status: "completed",
        completedAt: new Date(),
      });
      return { id: Number(result[0].insertId) };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(exports).where(eq(exports.id, input.id));
      return { success: true };
    }),
});
