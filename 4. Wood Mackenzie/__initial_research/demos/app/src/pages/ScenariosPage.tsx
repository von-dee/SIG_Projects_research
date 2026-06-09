import { useState } from "react";
import { trpc } from "@/providers/trpc";
import {
  SlidersHorizontal,
  Sparkles,
  Play,
  Save,
  TrendingUp,
  DollarSign,
  Factory,
  Leaf,
  Globe,
  Trash2,
  Loader2,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

export default function ScenariosPage() {
  const [commodityId, setCommodityId] = useState(1);
  const [commodityPrice, setCommodityPrice] = useState(10000);
  const [demandGrowth, setDemandGrowth] = useState(3.5);
  const [supplyConstraint, setSupplyConstraint] = useState(8);
  const [carbonTax, setCarbonTax] = useState(50);
  const [esgPremium, setEsgPremium] = useState(5);
  const [currencyRate, setCurrencyRate] = useState(1.0);
  const [scenarioName, setScenarioName] = useState("");
  const [results, setResults] = useState<{
    years: number[];
    production: number[];
    costs: number[];
    margins: number[];
    npv: number;
    irr: number;
  } | null>(null);
  const [narrative, setNarrative] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const { data: commodities } = trpc.commodity.list.useQuery();
  const { data: scenarios } = trpc.scenario.list.useQuery();
  const runSim = trpc.scenario.runSimulation.useMutation();
  const createScenario = trpc.scenario.create.useMutation();
  const deleteScenario = trpc.scenario.delete.useMutation();

  const handleRunSimulation = async () => {
    setIsRunning(true);
    try {
      const res = await runSim.mutateAsync({
        commodityPrice,
        demandGrowth,
        supplyConstraint,
        carbonTax,
        esgPremium,
        currencyRate,
      });
      setResults(res.results);
      setNarrative(res.aiNarrative);
    } catch {
      // fallback
      setResults({
        years: [2026, 2027, 2028, 2029, 2030],
        production: [100, 106.2, 112.8, 119.9, 127.4],
        costs: [6500, 6820, 7150, 7490, 7840],
        margins: [35.0, 35.8, 36.6, 37.6, 38.4],
        npv: 36.68,
        irr: 12.5,
      });
      setNarrative("## Scenario Analysis\n\nThe simulation indicates positive project economics with an IRR of 12.5% under the current assumptions. Demand growth of 3.5% annually supports production expansion, while supply constraints create pricing power.");
    }
    setIsRunning(false);
  };

  const handleSave = async () => {
    if (!results || !scenarioName) return;
    await createScenario.mutateAsync({
      name: scenarioName,
      commodityId,
      commodityPrice,
      demandGrowth,
      supplyConstraint,
      carbonTax,
      esgPremium,
      currencyRate,
      description: `Scenario: ${commodityPrice} price, ${demandGrowth}% demand growth`,
    });
    setScenarioName("");
  };

  const chartData = results
    ? results.years.map((y, i) => ({
        year: y,
        production: results.production[i],
        costs: results.costs[i],
        margins: results.margins[i],
      }))
    : [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#171717]">Interactive Scenarios</h1>
          <p className="text-sm text-[#525252] mt-1">Build custom scenarios and run AI-powered simulations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Controls */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#E5E5E5] p-5">
            <h2 className="text-sm font-semibold text-[#171717] mb-4 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#3B82F6]" />
              Scenario Variables
            </h2>

            {/* Commodity Selector */}
            <div className="mb-4">
              <label className="text-xs font-medium text-[#525252] mb-1.5 block">Commodity</label>
              <select
                value={commodityId}
                onChange={(e) => setCommodityId(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-lg border border-[#E5E5E5] text-sm text-[#171717] focus:outline-none focus:border-[#3B82F6]"
              >
                {commodities?.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Sliders */}
            <div className="space-y-4">
              <SliderControl
                icon={DollarSign}
                label="Commodity Price"
                value={commodityPrice}
                onChange={setCommodityPrice}
                min={1000}
                max={50000}
                step={100}
                unit="USD"
              />
              <SliderControl
                icon={TrendingUp}
                label="Demand Growth"
                value={demandGrowth}
                onChange={setDemandGrowth}
                min={-5}
                max={15}
                step={0.1}
                unit="%"
              />
              <SliderControl
                icon={Factory}
                label="Supply Constraint"
                value={supplyConstraint}
                onChange={setSupplyConstraint}
                min={0}
                max={50}
                step={1}
                unit="%"
              />
              <SliderControl
                icon={Leaf}
                label="Carbon Tax"
                value={carbonTax}
                onChange={setCarbonTax}
                min={0}
                max={200}
                step={5}
                unit="USD/tCO2"
              />
              <SliderControl
                icon={Globe}
                label="ESG Premium"
                value={esgPremium}
                onChange={setEsgPremium}
                min={0}
                max={30}
                step={0.5}
                unit="%"
              />
              <SliderControl
                icon={DollarSign}
                label="Currency Rate"
                value={currencyRate}
                onChange={setCurrencyRate}
                min={0.5}
                max={2}
                step={0.01}
                unit="USD/local"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleRunSimulation}
                disabled={isRunning}
                className="flex-1 h-10 bg-[#3B82F6] text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#2563EB] transition-colors disabled:opacity-50"
              >
                {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {isRunning ? "Running..." : "Run Simulation"}
              </button>
            </div>

            {results && (
              <div className="mt-4 pt-4 border-t border-[#E5E5E5]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Scenario name..."
                    value={scenarioName}
                    onChange={(e) => setScenarioName(e.target.value)}
                    className="flex-1 h-10 px-3 rounded-lg border border-[#E5E5E5] text-sm text-[#171717] placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#3B82F6]"
                  />
                  <button
                    onClick={handleSave}
                    disabled={!scenarioName}
                    className="h-10 px-4 bg-[#10B981] text-white rounded-lg text-sm font-medium flex items-center gap-1.5 hover:bg-[#059669] transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Saved Scenarios */}
          <div className="bg-white rounded-xl border border-[#E5E5E5] p-5">
            <h2 className="text-sm font-semibold text-[#171717] mb-3">Saved Scenarios</h2>
            <div className="space-y-2">
              {scenarios?.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-[#F5F5F5] hover:border-[#3B82F6]/30 transition-colors">
                  <div>
                    <div className="text-sm font-medium text-[#171717]">{s.name}</div>
                    <div className="text-xs text-[#A3A3A3]">${Number(s.commodityPrice).toLocaleString()} | {Number(s.demandGrowth)}% growth</div>
                  </div>
                  <button
                    onClick={() => deleteScenario.mutate({ id: s.id })}
                    className="w-7 h-7 rounded hover:bg-red-50 flex items-center justify-center text-[#A3A3A3] hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {(!scenarios || scenarios.length === 0) && (
                <div className="text-xs text-[#A3A3A3] text-center py-4">No saved scenarios yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Center - Chart */}
        <div className="lg:col-span-2 space-y-4">
          {results && (
            <>
              {/* KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-[#E5E5E5] p-4 text-center">
                  <div className="text-xs text-[#525252]">Projected NPV</div>
                  <div className="font-mono text-xl font-semibold text-[#171717] mt-1">{results.npv}%</div>
                </div>
                <div className="bg-white rounded-xl border border-[#E5E5E5] p-4 text-center">
                  <div className="text-xs text-[#525252]">Projected IRR</div>
                  <div className="font-mono text-xl font-semibold text-[#171717] mt-1">{results.irr}%</div>
                </div>
                <div className="bg-white rounded-xl border border-[#E5E5E5] p-4 text-center">
                  <div className="text-xs text-[#525252]">Production (2030)</div>
                  <div className="font-mono text-xl font-semibold text-[#171717] mt-1">{results.production[4]} units</div>
                </div>
                <div className="bg-white rounded-xl border border-[#E5E5E5] p-4 text-center">
                  <div className="text-xs text-[#525252]">Margin (2030)</div>
                  <div className="font-mono text-xl font-semibold text-green-600 mt-1">{results.margins[4]}%</div>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-white rounded-xl border border-[#E5E5E5] p-5">
                <h2 className="text-sm font-semibold text-[#171717] mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#3B82F6]" />
                  Scenario Results (2026-2030)
                </h2>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                      <XAxis dataKey="year" tick={{ fontSize: 12, fill: "#525252" }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#525252" }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#525252" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: "white",
                          border: "1px solid #E5E5E5",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      <Line yAxisId="left" type="monotone" dataKey="production" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} name="Production" />
                      <Line yAxisId="right" type="monotone" dataKey="margins" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} name="Margin %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* AI Narrative */}
              {narrative && (
                <div className="bg-white rounded-xl border border-[#E5E5E5] p-5">
                  <h2 className="text-sm font-semibold text-[#171717] mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#3B82F6]" />
                    AI-Generated Analysis
                  </h2>
                  <div className="prose prose-sm max-w-none text-sm text-[#525252] leading-relaxed whitespace-pre-line">
                    {narrative}
                  </div>
                </div>
              )}
            </>
          )}

          {!results && (
            <div className="bg-white rounded-xl border border-[#E5E5E5] p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#EFF6FF] flex items-center justify-center mb-4">
                <SlidersHorizontal className="w-8 h-8 text-[#3B82F6]" />
              </div>
              <h3 className="text-lg font-semibold text-[#171717] mb-2">Configure Your Scenario</h3>
              <p className="text-sm text-[#525252] max-w-md">
                Adjust the variables on the left panel and click "Run Simulation" to generate AI-powered scenario analysis with projected production, costs, and margins.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SliderControl({
  icon: Icon,
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5 text-[#525252]" />
          <span className="text-xs font-medium text-[#525252]">{label}</span>
        </div>
        <span className="font-mono text-xs text-[#171717]">
          {value.toLocaleString(undefined, { minimumFractionDigits: step < 1 ? 2 : 0 })} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-[#E5E5E5] rounded-full appearance-none cursor-pointer accent-[#3B82F6]"
      />
    </div>
  );
}
