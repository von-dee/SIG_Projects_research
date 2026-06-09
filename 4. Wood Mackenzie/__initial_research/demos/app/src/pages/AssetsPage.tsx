import { useState } from "react";
import { trpc } from "@/providers/trpc";
import {
  Search,
  Filter,
  ArrowUpDown,
  MapPin,
  Pickaxe,
  Leaf,
  Droplets,
  Zap,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";

type SortField = "name" | "c1Cost" | "aisc" | "productionVolume" | "esgScore";
type SortOrder = "asc" | "desc";

const MINE_TYPE_LABELS: Record<string, string> = {
  open_pit: "Open Pit",
  underground: "Underground",
  placer: "Placer",
};

const STATUS_COLORS: Record<string, string> = {
  operating: "bg-green-50 text-green-700",
  development: "bg-blue-50 text-blue-700",
  care_maintenance: "bg-amber-50 text-amber-700",
  closed: "bg-red-50 text-red-700",
};

export default function AssetsPage() {
  const [selectedCommodity, setSelectedCommodity] = useState<number>(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("c1Cost");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [showFilters, setShowFilters] = useState(false);

  const { data: commodities } = trpc.commodity.list.useQuery();
  const { data: costCurve } = trpc.asset.getCostCurve.useQuery({ commodityId: selectedCommodity });
  const { data: allAssets } = trpc.asset.list.useQuery({ commodityId: selectedCommodity });
  const { data: stats } = trpc.asset.getStats.useQuery();

  const filteredAssets = allAssets
    ?.filter((a) => {
      if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.company.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      const aVal = Number((a as Record<string, unknown>)[sortBy] || 0);
      const bVal = Number((b as Record<string, unknown>)[sortBy] || 0);
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });

  const toggleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const chartData = costCurve?.assets.map((a) => ({
    name: a.name,
    c1Cost: a.c1Cost,
    aisc: a.aisc,
    production: a.production,
    esgScore: a.esgScore,
  })) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#171717]">Asset & Cost Curves</h1>
          <p className="text-sm text-[#525252] mt-1">Global mining asset database with cost curve analysis</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Assets", value: stats.totalAssets, icon: Pickaxe },
            { label: "Operating", value: stats.operatingAssets, icon: Zap, color: "text-green-600" },
            { label: "Avg ESG Score", value: stats.avgEsg, icon: Leaf, color: "text-emerald-600" },
            { label: "Countries", value: Object.keys(stats.byCountry || {}).length, icon: MapPin, color: "text-blue-600" },
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

      {/* Commodity Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {commodities?.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCommodity(c.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
              selectedCommodity === c.id
                ? "bg-[#3B82F6] text-white shadow-md shadow-blue-500/20"
                : "bg-white border border-[#E5E5E5] text-[#525252] hover:border-[#3B82F6] hover:text-[#3B82F6]"
            )}
          >
            {c.imageUrl && <img src={c.imageUrl} alt="" className="w-5 h-5 rounded object-cover" />}
            {c.name}
          </button>
        ))}
      </div>

      {/* Cost Curve Chart */}
      {costCurve && (
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-[#171717] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#3B82F6]" />
                {costCurve.commodity?.name} Cost Curve (2026)
              </h2>
              <div className="flex items-center gap-4 mt-1 text-xs text-[#525252]">
                <span>Median AISC: <span className="font-mono font-medium">${costCurve.medianCost.toFixed(2)}/lb</span></span>
                <span>Lowest: <span className="font-mono font-medium">${costCurve.lowestCost.toFixed(2)}/lb</span></span>
                <span>Highest: <span className="font-mono font-medium">${costCurve.highestCost.toFixed(2)}/lb</span></span>
                <span>Total Production: <span className="font-mono font-medium">{(costCurve.totalProduction / 1000).toFixed(1)}Mt</span></span>
              </div>
            </div>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "#525252" }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#525252" }}
                  axisLine={false}
                  tickLine={false}
                  label={{ value: "USD/lb", angle: -90, position: "insideLeft", style: { fontSize: 11, fill: "#525252" } }}
                />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid #E5E5E5",
                    borderRadius: "8px",
                    fontSize: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value: number, name: string) => [`$${value.toFixed(2)}/lb`, name === "c1Cost" ? "C1 Cost" : "AISC"]}
                />
                <Bar dataKey="c1Cost" fill="#3B82F6" radius={[2, 2, 0, 0]} name="c1Cost" />
                <Bar dataKey="aisc" fill="#93C5FD" radius={[2, 2, 0, 0]} name="aisc" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#3B82F6]" />
              <span className="text-[#525252]">C1 Cost (Direct Operating)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#93C5FD]" />
              <span className="text-[#525252]">AISC (All-In Sustaining)</span>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
          <input
            type="text"
            placeholder="Search assets or companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-[#E5E5E5] bg-white text-sm text-[#171717] placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#3B82F6]"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "h-10 px-4 rounded-lg border text-sm font-medium flex items-center gap-2 transition-all",
            showFilters ? "bg-[#EFF6FF] border-[#3B82F6] text-[#3B82F6]" : "border-[#E5E5E5] bg-white text-[#525252] hover:border-[#3B82F6]"
          )}
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Asset Table */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E5E5] bg-[#FAFAFA]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#525252] uppercase">
                  <button onClick={() => toggleSort("name")} className="flex items-center gap-1">
                    Asset <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#525252] uppercase">Company</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#525252] uppercase">Country</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#525252] uppercase">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#525252] uppercase">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#525252] uppercase">
                  <button onClick={() => toggleSort("c1Cost")} className="flex items-center gap-1 ml-auto">
                    C1 Cost <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#525252] uppercase">
                  <button onClick={() => toggleSort("aisc")} className="flex items-center gap-1 ml-auto">
                    AISC <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#525252] uppercase">
                  <button onClick={() => toggleSort("productionVolume")} className="flex items-center gap-1 ml-auto">
                    Production <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#525252] uppercase">
                  <button onClick={() => toggleSort("esgScore")} className="flex items-center gap-1 ml-auto">
                    ESG <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F5]">
              {filteredAssets?.map((a) => (
                <tr key={a.id} className="hover:bg-[#F5F5F5] transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-[#171717]">{a.name}</div>
                    <div className="text-xs text-[#A3A3A3]">Grade: {a.grade}%</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#525252]">{a.company}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm text-[#525252]">
                      <MapPin className="w-3 h-3 text-[#A3A3A3]" />
                      {a.country}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#525252]">{MINE_TYPE_LABELS[a.mineType] || a.mineType}</td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", STATUS_COLORS[a.status] || "bg-gray-50")}>
                      {a.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-[#171717]">${Number(a.c1Cost).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-[#171717]">${Number(a.aisc).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-[#171717]">
                    {(Number(a.productionVolume) / 1000).toFixed(0)}k
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Leaf className="w-3 h-3 text-emerald-500" />
                      <span className="font-mono text-sm text-[#171717]">{a.esgScore}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
