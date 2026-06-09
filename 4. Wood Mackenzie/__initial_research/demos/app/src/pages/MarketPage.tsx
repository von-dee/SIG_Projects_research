import { useState } from "react";
import { trpc } from "@/providers/trpc";
import {
  Search,
  Filter,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SortField = "name" | "currentPrice" | "priceChangePercent" | "category";
type SortOrder = "asc" | "desc";

const CATEGORY_LABELS: Record<string, string> = {
  base_metals: "Base Metals",
  precious_metals: "Precious Metals",
  battery_minerals: "Battery Minerals",
  bulk_commodities: "Bulk Commodities",
  steel_alloys: "Steel Alloys",
};

const CATEGORY_COLORS: Record<string, string> = {
  base_metals: "bg-blue-50 text-blue-700",
  precious_metals: "bg-amber-50 text-amber-700",
  battery_minerals: "bg-emerald-50 text-emerald-700",
  bulk_commodities: "bg-gray-50 text-gray-700",
  steel_alloys: "bg-purple-50 text-purple-700",
};

export default function MarketPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("priceChangePercent");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const { data: commodities } = trpc.commodity.list.useQuery(
    category ? { category } : undefined
  );

  const { data: overview } = trpc.commodity.getMarketOverview.useQuery();

  const filtered = commodities?.filter((c) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    const aVal = Number((a as Record<string, unknown>)[sortBy] || 0);
    const bVal = Number((b as Record<string, unknown>)[sortBy] || 0);
    return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
  });

  const toggleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#171717]">Market Analysis</h1>
          <p className="text-sm text-[#525252] mt-1">Multi-commodity market data and fundamentals</p>
        </div>
      </div>

      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { label: "Commodities", value: overview.totalCommodities, icon: BarChart3 },
            { label: "Avg Change", value: `${overview.avgChange > 0 ? "+" : ""}${overview.avgChange}%`, icon: TrendingUp, color: overview.avgChange >= 0 ? "text-green-600" : "text-red-600" },
            { label: "Gainers", value: overview.gainers, icon: TrendingUp, color: "text-green-600" },
            { label: "Losers", value: overview.losers, icon: TrendingDown, color: "text-red-600" },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-xl border border-[#E5E5E5] p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center">
                <card.icon className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <div>
                <div className={cn("font-mono text-xl font-semibold", card.color || "text-[#171717]")}>{card.value}</div>
                <div className="text-xs text-[#525252]">{card.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
          <input
            type="text"
            placeholder="Search commodities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-[#E5E5E5] bg-white text-sm text-[#171717] placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#525252]" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-10 px-3 rounded-lg border border-[#E5E5E5] bg-white text-sm text-[#171717] focus:outline-none focus:border-[#3B82F6]"
          >
            <option value="">All Categories</option>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E5E5] bg-[#FAFAFA]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#525252] uppercase tracking-wider">
                  <button onClick={() => toggleSort("name")} className="flex items-center gap-1">
                    Commodity <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#525252] uppercase tracking-wider">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#525252] uppercase tracking-wider">Unit</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#525252] uppercase tracking-wider">
                  <button onClick={() => toggleSort("currentPrice")} className="flex items-center gap-1 ml-auto">
                    Price <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#525252] uppercase tracking-wider">
                  <button onClick={() => toggleSort("priceChangePercent")} className="flex items-center gap-1 ml-auto">
                    Change <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#525252] uppercase tracking-wider">Supply/Demand</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#525252] uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F5]">
              {filtered?.map((c) => {
                const sd = c.supplyDemand ? JSON.parse(c.supplyDemand as string) : null;
                const isPositive = Number(c.priceChangePercent) >= 0;
                return (
                  <tr key={c.id} className="hover:bg-[#F5F5F5] transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {c.imageUrl && (
                          <img src={c.imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                        )}
                        <div>
                          <div className="text-sm font-semibold text-[#171717]">{c.name}</div>
                          <div className="text-xs text-[#A3A3A3] font-mono">{c.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={cn("text-xs font-medium px-2 py-1 rounded-full", CATEGORY_COLORS[c.category] || "bg-gray-50")}>
                        {CATEGORY_LABELS[c.category] || c.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-[#525252] font-mono">{c.unit}</td>
                    <td className="px-4 py-4 text-right">
                      <div className="font-mono text-sm font-semibold text-[#171717]">
                        ${Number(c.currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className={cn("font-mono text-sm font-medium", isPositive ? "text-green-600" : "text-red-600")}>
                        {isPositive ? "+" : ""}
                        {Number(c.priceChangePercent).toFixed(2)}%
                      </div>
                      <div className="text-xs text-[#A3A3A3] font-mono">
                        {Number(c.priceChange) >= 0 ? "+" : ""}${Number(c.priceChange).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {sd && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <Globe className="w-3 h-3 text-[#3B82F6]" />
                            <span className="text-[#525252]">Supply: <span className="font-mono font-medium">{sd.supply}Mt</span></span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <TrendingUp className="w-3 h-3 text-green-500" />
                            <span className="text-[#525252]">Demand: <span className="font-mono font-medium">{sd.demand}Mt</span></span>
                          </div>
                          <div className={cn("text-xs font-medium", sd.deficit > 0 ? "text-red-600" : "text-green-600")}>
                            {sd.deficit > 0 ? "Deficit" : "Surplus"}: {Math.abs(sd.deficit)}Mt
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-[#525252] max-w-xs line-clamp-2">{c.description}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
