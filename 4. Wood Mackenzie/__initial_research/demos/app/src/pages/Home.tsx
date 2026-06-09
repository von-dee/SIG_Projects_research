import { useMemo } from "react";
import { trpc } from "@/providers/trpc";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Pickaxe,
  Leaf,
  Sparkles,
  ArrowRight,
  Zap,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E5E5] p-5 hover:shadow-md hover:border-[#3B82F6]/20 transition-all duration-300 animate-fade-up">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#3B82F6]" />
        </div>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
              trend === "up" ? "bg-green-50 text-green-600" : trend === "down" ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-600"
            )}
          >
            {trend === "up" ? <TrendingUp className="w-3 h-3" /> : trend === "down" ? <TrendingDown className="w-3 h-3" /> : null}
            {trend === "up" ? "+1.8%" : trend === "down" ? "-0.5%" : "0.0%"}
          </div>
        )}
      </div>
      <div className="font-mono text-2xl font-semibold text-[#171717]">{value}</div>
      <div className="text-sm text-[#525252] mt-1">{title}</div>
      <div className="text-xs text-[#A3A3A3] mt-0.5">{subtitle}</div>
    </div>
  );
}

function CommodityPriceRow({
  name,
  symbol,
  price,
  change,
  changePercent,
  unit,
  chartData,
}: {
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  unit: string;
  chartData: number[];
}) {
  const isPositive = changePercent >= 0;
  const sparklineData = chartData.map((v, i) => ({ v, i }));

  return (
    <div className="flex items-center gap-4 py-3 px-4 hover:bg-[#F5F5F5] transition-colors rounded-lg group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#171717]">{name}</span>
          <span className="text-xs text-[#A3A3A3] font-mono">{symbol}</span>
        </div>
        <div className="text-xs text-[#525252]">{unit}</div>
      </div>

      <div className="w-24 h-8">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparklineData}>
            <Area
              type="monotone"
              dataKey="v"
              stroke={isPositive ? "#16a34a" : "#dc2626"}
              fill={isPositive ? "#16a34a20" : "#dc262620"}
              strokeWidth={1.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="text-right">
        <div className="font-mono text-sm font-semibold text-[#171717]">
          ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div
          className={cn(
            "text-xs font-mono font-medium",
            isPositive ? "text-green-600" : "text-red-600"
          )}
        >
          {isPositive ? "+" : ""}
          {changePercent.toFixed(2)}%
        </div>
      </div>
    </div>
  );
}

function IntelligenceCard({
  title,
  summary,
  impact,
  commodity,
  timestamp,
  index,
}: {
  title: string;
  summary: string;
  impact: string;
  commodity: string;
  timestamp: string;
  index: number;
}) {
  return (
    <div
      className="bg-white rounded-xl border border-[#E5E5E5] p-5 hover:shadow-md hover:border-[#3B82F6]/20 transition-all duration-300 cursor-pointer group animate-fade-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              impact === "high"
                ? "bg-red-50 text-red-600"
                : "bg-amber-50 text-amber-600"
            )}
          >
            {impact.toUpperCase()} IMPACT
          </span>
          <span className="text-xs text-[#A3A3A3]">{commodity}</span>
        </div>
        <span className="text-xs text-[#A3A3A3]">{timestamp}</span>
      </div>
      <h3 className="text-sm font-semibold text-[#171717] mb-2 group-hover:text-[#3B82F6] transition-colors">
        {title}
      </h3>
      <p className="text-sm text-[#525252] leading-relaxed line-clamp-3">{summary}</p>
      <div className="flex items-center gap-1 mt-3 text-[#3B82F6] text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        Analyze with LensAI <ArrowRight className="w-3 h-3" />
      </div>
    </div>
  );
}

export default function Home() {
  const { data: summary } = trpc.dashboard.getSummary.useQuery();
  const { data: news } = trpc.dashboard.getNews.useQuery();
  const { data: intelligence } = trpc.dashboard.getIntelligence.useQuery();
  const { data: priceHistory } = trpc.commodity.getPriceHistory.useQuery({ id: 1 });

  const chartData = useMemo(() => {
    if (!priceHistory) return [];
    return priceHistory;
  }, [priceHistory]);

  const newsItems = useMemo(() => {
    if (!news) return [];
    return news.slice(0, 6);
  }, [news]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#171717]">Intelligence Hub</h1>
          <p className="text-sm text-[#525252] mt-1">
            Real-time market intelligence for metals & mining
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#525252] bg-white px-3 py-2 rounded-lg border border-[#E5E5E5]">
          <Activity className="w-3.5 h-3.5 text-green-500" />
          Live data feed
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Commodities Tracked"
          value={summary ? String(summary.metrics.totalCommodities) : "8"}
          subtitle="Active markets"
          icon={BarChart3}
          trend="up"
        />
        <MetricCard
          title="Mining Assets"
          value={summary ? String(summary.metrics.totalAssets) : "42"}
          subtitle="Global coverage"
          icon={Pickaxe}
          trend="neutral"
        />
        <MetricCard
          title="Operating Assets"
          value={summary ? String(summary.metrics.operatingAssets) : "38"}
          subtitle="91% operational"
          icon={Zap}
          trend="up"
        />
        <MetricCard
          title="Avg ESG Score"
          value={summary ? String(summary.metrics.avgEsg) : "71"}
          subtitle="Out of 100"
          icon={Leaf}
          trend="up"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Intelligence Cards */}
        <div className="lg:col-span-2 space-y-4">
          {/* Chart Section */}
          <div className="bg-white rounded-xl border border-[#E5E5E5] p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-[#171717]">Copper Price Trend (12M)</h2>
                <p className="text-xs text-[#525252] mt-0.5">USD per tonne, LME official</p>
              </div>
              <div className="text-right">
                <div className="font-mono text-lg font-semibold text-[#171717]">$9,875.50</div>
                <div className="text-xs text-green-600 font-mono">+1.28% today</div>
              </div>
            </div>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#525252" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#525252" }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      border: "1px solid #E5E5E5",
                      borderRadius: "8px",
                      fontSize: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, "Price"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#colorPrice)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Intelligence Cards */}
          <div>
            <h2 className="text-sm font-semibold text-[#171717] mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#3B82F6]" />
              AI-Generated Intelligence
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {summary?.intelligenceCards.map((card, i) => (
                <IntelligenceCard key={card.id} {...card} index={i} />
              ))}
            </div>
          </div>

          {/* Daily Brief */}
          {intelligence && (
            <div className="bg-white rounded-xl border border-[#E5E5E5] p-5">
              <h2 className="text-sm font-semibold text-[#171717] mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#3B82F6]" />
                Daily Market Brief
              </h2>
              <p className="text-sm text-[#525252] leading-relaxed mb-4">{intelligence.dailyBrief}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xs font-semibold text-red-600 mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Key Risks
                  </h3>
                  <ul className="space-y-1.5">
                    {intelligence.keyRisks.map((risk, i) => (
                      <li key={i} className="text-xs text-[#525252] flex items-start gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-red-400 mt-1.5 shrink-0" />
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-green-600 mb-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Opportunities
                  </h3>
                  <ul className="space-y-1.5">
                    {intelligence.opportunities.map((opp, i) => (
                      <li key={i} className="text-xs text-[#525252] flex items-start gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-green-400 mt-1.5 shrink-0" />
                        {opp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Price Ticker & News */}
        <div className="space-y-6">
          {/* Price Ticker */}
          <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E5E5]">
              <h2 className="text-sm font-semibold text-[#171717] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#3B82F6]" />
                Live Prices
              </h2>
            </div>
            <div className="divide-y divide-[#F5F5F5]">
              {summary?.commodityPrices.map((c) => (
                <CommodityPriceRow
                  key={c.symbol}
                  name={c.name}
                  symbol={c.symbol}
                  price={c.price}
                  change={c.change}
                  changePercent={c.changePercent}
                  unit={c.unit}
                  chartData={[c.price * 0.95, c.price * 0.97, c.price * 0.96, c.price * 0.98, c.price * 0.99, c.price]}
                />
              ))}
            </div>
          </div>

          {/* News Feed */}
          <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E5E5]">
              <h2 className="text-sm font-semibold text-[#171717]">Latest News</h2>
            </div>
            <div className="divide-y divide-[#F5F5F5]">
              {newsItems.map((item) => (
                <div key={item.id} className="p-4 hover:bg-[#F5F5F5] transition-colors cursor-pointer group">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-medium text-[#3B82F6] bg-[#EFF6FF] px-1.5 py-0.5 rounded">
                      {item.source}
                    </span>
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full",
                        item.sentiment === "positive"
                          ? "bg-green-500"
                          : item.sentiment === "negative"
                          ? "bg-red-500"
                          : "bg-gray-400"
                      )}
                    />
                  </div>
                  <h3 className="text-sm font-medium text-[#171717] group-hover:text-[#3B82F6] transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#525252] mt-1 line-clamp-2">{item.summary}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-xl p-5 text-white">
            <h2 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#3B82F6]" />
              Agentic AI Platform
            </h2>
            <p className="text-xs text-gray-300 mb-4 leading-relaxed">
              Nexus AI replaces static reports with real-time, conversational intelligence. Ask questions, run scenarios, and get alerts.
            </p>
            <div className="space-y-2">
              {[
                { icon: Droplets, text: "Water stress at Chilean mines" },
                { icon: Zap, text: "Copper supply deficit widening" },
                { icon: TrendingDown, text: "Lithium price floor analysis" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                  <item.icon className="w-3.5 h-3.5" />
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
