import { trpc } from "@/providers/trpc";
import {
  Download,
  FileSpreadsheet,
  FileText,
  FileJson,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  Database,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

const FILE_TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  csv: { icon: FileSpreadsheet, color: "text-green-600", bg: "bg-green-50", label: "CSV" },
  xlsx: { icon: FileSpreadsheet, color: "text-emerald-600", bg: "bg-emerald-50", label: "Excel" },
  pdf: { icon: FileText, color: "text-red-600", bg: "bg-red-50", label: "PDF" },
  json: { icon: FileJson, color: "text-blue-600", bg: "bg-blue-50", label: "JSON" },
};

const STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  pending: { icon: Clock, color: "text-amber-600", label: "Pending" },
  completed: { icon: CheckCircle2, color: "text-green-600", label: "Completed" },
  failed: { icon: XCircle, color: "text-red-600", label: "Failed" },
};

const SOURCE_LABELS: Record<string, string> = {
  cost_curve: "Cost Curve",
  market_data: "Market Data",
  scenario: "Scenario",
  chat_export: "Chat Export",
};

export default function ExportsPage() {
  const { data: exportsList, refetch } = trpc.export.list.useQuery();
  const deleteExport = trpc.export.delete.useMutation({ onSuccess: () => refetch() });
  const createExport = trpc.export.create.useMutation({ onSuccess: () => refetch() });

  const handleQuickExport = async (type: "csv" | "xlsx" | "pdf" | "json", source: "cost_curve" | "market_data" | "scenario" | "chat_export") => {
    await createExport.mutateAsync({
      name: `${SOURCE_LABELS[source]} Export ${new Date().toLocaleDateString()}`,
      fileType: type,
      source,
      recordCount: Math.floor(Math.random() * 5000) + 100,
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#171717]">Data & Exports</h1>
          <p className="text-sm text-[#525252] mt-1">Export data, manage downloads, and upload internal data</p>
        </div>
      </div>

      {/* Quick Export Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Cost Curve Data", source: "cost_curve" as const, desc: "Asset-level cost data" },
          { label: "Market Data", source: "market_data" as const, desc: "Commodity prices & S/D" },
          { label: "Scenario Results", source: "scenario" as const, desc: "Simulation outputs" },
          { label: "Chat History", source: "chat_export" as const, desc: "AI conversation logs" },
        ].map((item) => (
          <div key={item.source} className="bg-white rounded-xl border border-[#E5E5E5] p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] flex items-center justify-center">
                <Database className="w-4 h-4 text-[#3B82F6]" />
              </div>
              <div>
                <div className="text-sm font-medium text-[#171717]">{item.label}</div>
                <div className="text-xs text-[#A3A3A3]">{item.desc}</div>
              </div>
            </div>
            <div className="flex gap-1.5">
              {(["csv", "xlsx", "json"] as const).map((ft) => (
                <button
                  key={ft}
                  onClick={() => handleQuickExport(ft, item.source)}
                  className="flex-1 h-8 rounded border border-[#E5E5E5] text-xs font-medium text-[#525252] hover:border-[#3B82F6] hover:text-[#3B82F6] transition-colors flex items-center justify-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  {ft.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Internal Data Upload */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-5">
        <h2 className="text-sm font-semibold text-[#171717] mb-3 flex items-center gap-2">
          <Upload className="w-4 h-4 text-[#3B82F6]" />
          Integrate Your Internal Data
        </h2>
        <p className="text-sm text-[#525252] mb-4">
          Upload your own mine models, portfolio data, or cost spreadsheets to blend with our public data for personalized benchmarking and analysis.
        </p>
        <div className="border-2 border-dashed border-[#E5E5E5] rounded-xl p-8 text-center hover:border-[#3B82F6] hover:bg-[#EFF6FF] transition-all cursor-pointer">
          <Upload className="w-8 h-8 text-[#A3A3A3] mx-auto mb-2" />
          <p className="text-sm text-[#525252] font-medium">Drag and drop files here, or click to browse</p>
          <p className="text-xs text-[#A3A3A3] mt-1">Supports CSV, Excel, and JSON formats</p>
        </div>
      </div>

      {/* Export History */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E5E5E5] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#171717]">Export History</h2>
          <span className="text-xs text-[#A3A3A3]">{exportsList?.length || 0} exports</span>
        </div>
        <div className="divide-y divide-[#F5F5F5]">
          {exportsList?.map((exp) => {
            const typeConfig = FILE_TYPE_CONFIG[exp.fileType] || FILE_TYPE_CONFIG.csv;
            const statusConfig = STATUS_CONFIG[exp.status] || STATUS_CONFIG.pending;
            return (
              <div key={exp.id} className="p-4 flex items-center gap-4 hover:bg-[#F5F5F5] transition-colors">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", typeConfig.bg)}>
                  <typeConfig.icon className={cn("w-5 h-5", typeConfig.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#171717] truncate">{exp.name}</div>
                  <div className="flex items-center gap-2 text-xs text-[#A3A3A3]">
                    <span>{typeConfig.label}</span>
                    <span>·</span>
                    <span>{SOURCE_LABELS[exp.source] || exp.source}</span>
                    <span>·</span>
                    <span>{exp.recordCount.toLocaleString()} records</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className={cn("text-xs font-medium flex items-center gap-1", statusConfig.color)}>
                    <statusConfig.icon className="w-3 h-3" />
                    {statusConfig.label}
                  </span>
                </div>
                <button
                  onClick={() => deleteExport.mutate({ id: exp.id })}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#A3A3A3] hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
          {(!exportsList || exportsList.length === 0) && (
            <div className="p-12 text-center">
              <Download className="w-10 h-10 text-[#E5E5E5] mx-auto mb-3" />
              <p className="text-sm text-[#525252]">No exports yet</p>
              <p className="text-xs text-[#A3A3A3] mt-1">Use the quick export cards above to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
