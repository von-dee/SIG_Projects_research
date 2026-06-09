import { authRouter } from "./auth-router";
import { commodityRouter } from "./commodity-router";
import { assetRouter } from "./asset-router";
import { dashboardRouter } from "./dashboard-router";
import { chatRouter } from "./chat-router";
import { scenarioRouter } from "./scenario-router";
import { alertRouter } from "./alert-router";
import { exportRouter } from "./export-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  commodity: commodityRouter,
  asset: assetRouter,
  dashboard: dashboardRouter,
  chat: chatRouter,
  scenario: scenarioRouter,
  alert: alertRouter,
  export: exportRouter,
});

export type AppRouter = typeof appRouter;
