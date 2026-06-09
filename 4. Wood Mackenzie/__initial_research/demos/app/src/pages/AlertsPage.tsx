import { useState } from "react";
import { trpc } from "@/providers/trpc";
import {
  AlertTriangle,
  Plus,
  Bell,
  TrendingUp,
  TrendingDown,
  Leaf,
  Factory,
  DollarSign,
  Trash2,
  Power,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ALERT_TYPES = [
  { value: "price_threshold", label: "Price Threshold", icon: DollarSign },
  { value: "price_divergence", label: "Price Divergence", icon: TrendingUp },
  { value: "esg_incident", label: "ESG Incident", icon: Leaf },
  { value: "production_change", label: "Production Change", icon: Factory },
  { value: "cost_guidance", label: "Cost Guidance", icon: DollarSign },
];

const FREQUENCIES = ["realtime", "hourly", "daily", "weekly"];

export default function AlertsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [alertType, setAlertType] = useState("price_threshold");
  const [commodityId, setCommodityId] = useState<number | undefined>();
  const [conditionValue, setConditionValue] = useState(10000);
  const [frequency, setFrequency] = useState("daily");

  const { data: alerts, refetch } = trpc.alert.list.useQuery();
  const { data: commodities } = trpc.commodity.list.useQuery();
  const createAlert = trpc.alert.create.useMutation({ onSuccess: () => { refetch(); setShowCreate(false); } });
  const toggleAlert = trpc.alert.toggle.useMutation({ onSuccess: () => refetch() });
  const deleteAlert = trpc.alert.delete.useMutation({ onSuccess: () => refetch() });

  const handleCreate = async () => {
    await createAlert.mutateAsync({
      name,
      alertType: alertType as "price_threshold" | "price_divergence" | "esg_incident" | "production_change" | "cost_guidance",
      condition: { operator: ">=", value: conditionValue, unit: "USD" },
      frequency: frequency as "realtime" | "hourly" | "daily" | "weekly",
      commodityId,
    });
    setName("");
  };

  const activeAlerts = alerts?.filter((a) => a.isActive).length || 0;
  const inactiveAlerts = alerts?.filter((a) => !a.isActive).length || 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#171717]">Alert Monitor</h1>
          <p className="text-sm text-[#525252] mt-1">Personalized agentic alerts for market conditions</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="h-10 px-4 bg-[#3B82F6] text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#2563EB] transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Alert
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center">
            <Bell className="w-5 h-5 text-[#3B82F6]" />
          </div>
          <div>
            <div className="font-mono text-xl font-semibold text-[#171717]">{alerts?.length || 0}</div>
            <div className="text-xs text-[#525252]">Total Alerts</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <Power className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <div className="font-mono text-xl font-semibold text-green-600">{activeAlerts}</div>
            <div className="text-xs text-[#525252]">Active</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
            <Bell className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <div className="font-mono text-xl font-semibold text-gray-500">{inactiveAlerts}</div>
            <div className="text-xs text-[#525252]">Inactive</div>
          </div>
        </div>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-5 animate-fade-up">
          <h2 className="text-sm font-semibold text-[#171717] mb-4">Create New Alert</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-[#525252] mb-1.5 block">Alert Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Copper price above $10,000"
                className="w-full h-10 px-3 rounded-lg border border-[#E5E5E5] text-sm text-[#171717] placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#3B82F6]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#525252] mb-1.5 block">Alert Type</label>
              <select
                value={alertType}
                onChange={(e) => setAlertType(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#E5E5E5] text-sm text-[#171717] focus:outline-none focus:border-[#3B82F6]"
              >
                {ALERT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[#525252] mb-1.5 block">Commodity</label>
              <select
                value={commodityId || ""}
                onChange={(e) => setCommodityId(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full h-10 px-3 rounded-lg border border-[#E5E5E5] text-sm text-[#171717] focus:outline-none focus:border-[#3B82F6]"
              >
                <option value="">All Commodities</option>
                {commodities?.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[#525252] mb-1.5 block">Threshold Value</label>
              <input
                type="number"
                value={conditionValue}
                onChange={(e) => setConditionValue(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-lg border border-[#E5E5E5] text-sm text-[#171717] focus:outline-none focus:border-[#3B82F6]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#525252] mb-1.5 block">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#E5E5E5] text-sm text-[#171717] focus:outline-none focus:border-[#3B82F6]"
              >
                {FREQUENCIES.map((f) => (
                  <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleCreate}
              disabled={!name}
              className="h-10 px-6 bg-[#3B82F6] text-white rounded-lg text-sm font-medium hover:bg-[#2563EB] transition-colors disabled:opacity-50"
            >
              Create Alert
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="h-10 px-6 border border-[#E5E5E5] text-[#525252] rounded-lg text-sm font-medium hover:bg-[#F5F5F5] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Alerts List */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
        <div className="divide-y divide-[#F5F5F5]">
          {alerts?.map((alert) => {
            const typeConfig = ALERT_TYPES.find((t) => t.value === alert.alertType);
            const condition = alert.condition as { operator: string; value: number; unit: string };
            return (
              <div key={alert.id} className="p-4 flex items-center gap-4 hover:bg-[#F5F5F5] transition-colors">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                  alert.isActive ? "bg-[#EFF6FF]" : "bg-gray-50"
                )}>
                  {typeConfig && <typeConfig.icon className={cn("w-5 h-5", alert.isActive ? "text-[#3B82F6]" : "text-gray-400")} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#171717]">{alert.name}</span>
                    <span className={cn(
                      "text-xs px-1.5 py-0.5 rounded-full",
                      alert.isActive ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
                    )}>
                      {alert.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="text-xs text-[#525252] mt-0.5">
                    {typeConfig?.label} | {condition.operator} {condition.value.toLocaleString()} {condition.unit} | {alert.frequency}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleAlert.mutate({ id: alert.id })}
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                      alert.isActive ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-50"
                    )}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteAlert.mutate({ id: alert.id })}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
          {(!alerts || alerts.length === 0) && (
            <div className="p-12 text-center">
              <Bell className="w-10 h-10 text-[#E5E5E5] mx-auto mb-3" />
              <p className="text-sm text-[#525252]">No alerts configured yet</p>
              <p className="text-xs text-[#A3A3A3] mt-1">Create your first alert to get notified</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
