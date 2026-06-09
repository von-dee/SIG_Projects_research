import {
  mysqlTable,
  mysqlEnum,
  varchar,
  text,
  timestamp,
  int,
  decimal,
  json,
  boolean,
  bigint,
} from "drizzle-orm/mysql-core";

// ─── Users ───────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: bigint("id", { mode: "number", unsigned: true }).primaryKey().autoincrement(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;

// ─── Commodities ─────────────────────────────────────────────────────────
export const commodities = mysqlTable("commodities", {
  id: bigint("id", { mode: "number", unsigned: true }).primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).notNull(),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  category: mysqlEnum("category", [
    "base_metals",
    "precious_metals",
    "battery_minerals",
    "bulk_commodities",
    "steel_alloys",
  ]).notNull(),
  unit: varchar("unit", { length: 20 }).notNull(),
  currentPrice: decimal("currentPrice", { precision: 15, scale: 4 }).notNull(),
  priceChange: decimal("priceChange", { precision: 10, scale: 4 }).notNull(),
  priceChangePercent: decimal("priceChangePercent", { precision: 5, scale: 2 }).notNull(),
  lastUpdated: timestamp("lastUpdated").defaultNow().notNull(),
  chartData: json("chartData"),
  description: text("description"),
  imageUrl: varchar("imageUrl", { length: 255 }),
  supplyDemand: json("supplyDemand"),
});

export type Commodity = typeof commodities.$inferSelect;

// ─── Mining Assets ───────────────────────────────────────────────────────
export const miningAssets = mysqlTable("miningAssets", {
  id: bigint("id", { mode: "number", unsigned: true }).primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  company: varchar("company", { length: 255 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  commodityId: bigint("commodityId", { mode: "number", unsigned: true }).notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 6 }),
  longitude: decimal("longitude", { precision: 10, scale: 6 }),
  productionVolume: decimal("productionVolume", { precision: 15, scale: 2 }).notNull(),
  productionUnit: varchar("productionUnit", { length: 20 }).notNull(),
  c1Cost: decimal("c1Cost", { precision: 12, scale: 2 }).notNull(),
  aisc: decimal("aisc", { precision: 12, scale: 2 }).notNull(),
  mineType: mysqlEnum("mineType", ["open_pit", "underground", "placer"]).notNull(),
  status: mysqlEnum("status", ["operating", "development", "care_maintenance", "closed"]).notNull(),
  grade: decimal("grade", { precision: 6, scale: 4 }),
  reserveLife: int("reserveLife"),
  esgScore: int("esgScore"),
  carbonIntensity: decimal("carbonIntensity", { precision: 8, scale: 2 }),
  waterUsage: decimal("waterUsage", { precision: 10, scale: 2 }),
  powerSource: varchar("powerSource", { length: 100 }),
  fiscalYear: int("fiscalYear").notNull(),
  lastUpdated: timestamp("lastUpdated").defaultNow().notNull(),
});

export type MiningAsset = typeof miningAssets.$inferSelect;

// ─── Scenarios ───────────────────────────────────────────────────────────
export const scenarios = mysqlTable("scenarios", {
  id: bigint("id", { mode: "number", unsigned: true }).primaryKey().autoincrement(),
  userId: bigint("userId", { mode: "number", unsigned: true }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  commodityId: bigint("commodityId", { mode: "number", unsigned: true }).notNull(),
  commodityPrice: decimal("commodityPrice", { precision: 12, scale: 2 }).notNull(),
  demandGrowth: decimal("demandGrowth", { precision: 5, scale: 2 }).notNull(),
  supplyConstraint: decimal("supplyConstraint", { precision: 5, scale: 2 }).notNull(),
  carbonTax: decimal("carbonTax", { precision: 10, scale: 2 }).notNull(),
  esgPremium: decimal("esgPremium", { precision: 5, scale: 2 }).notNull(),
  currencyRate: decimal("currencyRate", { precision: 8, scale: 4 }).notNull(),
  results: json("results"),
  aiNarrative: text("aiNarrative"),
  isPublic: boolean("isPublic").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Scenario = typeof scenarios.$inferSelect;

// ─── Chat Conversations ──────────────────────────────────────────────────
export const chatConversations = mysqlTable("chatConversations", {
  id: bigint("id", { mode: "number", unsigned: true }).primaryKey().autoincrement(),
  userId: bigint("userId", { mode: "number", unsigned: true }),
  title: varchar("title", { length: 255 }).notNull(),
  model: varchar("model", { length: 50 }).default("claude-3-5-sonnet").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type ChatConversation = typeof chatConversations.$inferSelect;

// ─── Chat Messages ───────────────────────────────────────────────────────
export const chatMessages = mysqlTable("chatMessages", {
  id: bigint("id", { mode: "number", unsigned: true }).primaryKey().autoincrement(),
  conversationId: bigint("conversationId", { mode: "number", unsigned: true }).notNull(),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  toolCalls: json("toolCalls"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;

// ─── Alerts ──────────────────────────────────────────────────────────────
export const alerts = mysqlTable("alerts", {
  id: bigint("id", { mode: "number", unsigned: true }).primaryKey().autoincrement(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  commodityId: bigint("commodityId", { mode: "number", unsigned: true }),
  assetId: bigint("assetId", { mode: "number", unsigned: true }),
  alertType: mysqlEnum("alertType", [
    "price_threshold",
    "price_divergence",
    "esg_incident",
    "production_change",
    "cost_guidance",
  ]).notNull(),
  condition: json("condition"),
  frequency: mysqlEnum("frequency", ["realtime", "hourly", "daily", "weekly"]).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  lastTriggered: timestamp("lastTriggered"),
  triggerCount: int("triggerCount").default(0).notNull(),
  notificationChannels: json("notificationChannels"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Alert = typeof alerts.$inferSelect;

// ─── Exports ─────────────────────────────────────────────────────────────
export const exports = mysqlTable("exports", {
  id: bigint("id", { mode: "number", unsigned: true }).primaryKey().autoincrement(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  fileType: mysqlEnum("fileType", ["csv", "xlsx", "pdf", "json"]).notNull(),
  fileUrl: text("fileUrl"),
  source: mysqlEnum("source", ["cost_curve", "market_data", "scenario", "chat_export"]).notNull(),
  recordCount: int("recordCount").default(0).notNull(),
  filters: json("filters"),
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type Export = typeof exports.$inferSelect;

// ─── Internal Data Uploads ───────────────────────────────────────────────
export const internalDataUploads = mysqlTable("internalDataUploads", {
  id: bigint("id", { mode: "number", unsigned: true }).primaryKey().autoincrement(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  fileType: mysqlEnum("fileType", ["csv", "xlsx", "json"]).notNull(),
  fileUrl: text("fileUrl").notNull(),
  mappedSchema: json("mappedSchema"),
  recordCount: int("recordCount").default(0).notNull(),
  status: mysqlEnum("status", ["uploading", "processing", "completed", "failed"]).default("uploading").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── News Items ──────────────────────────────────────────────────────────
export const newsItems = mysqlTable("newsItems", {
  id: bigint("id", { mode: "number", unsigned: true }).primaryKey().autoincrement(),
  title: varchar("title", { length: 500 }).notNull(),
  source: varchar("source", { length: 100 }).notNull(),
  url: text("url"),
  summary: text("summary"),
  commodities: json("commodities"),
  publishedAt: timestamp("publishedAt").defaultNow().notNull(),
  sentiment: mysqlEnum("sentiment", ["positive", "negative", "neutral"]).default("neutral"),
});

export type NewsItem = typeof newsItems.$inferSelect;
