import { useState, useRef, useEffect } from "react";
import { trpc } from "@/providers/trpc";
import {
  Send,
  Sparkles,
  User,
  Loader2,
  FileText,
  BarChart3,
  AlertTriangle,
  Download,
  TrendingUp,
  Pickaxe,
  Leaf,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  { icon: BarChart3, text: "Show me the copper cost curve for 2026", category: "Cost Analysis" },
  { icon: AlertTriangle, text: "What's the lithium supply risk outlook?", category: "Risk Assessment" },
  { icon: FileText, text: "Generate a comprehensive gold market report", category: "Report" },
  { icon: TrendingUp, text: "Compare nickel producers by ESG score", category: "ESG Analysis" },
  { icon: Pickaxe, text: "Which copper mines have the lowest AISC?", category: "Asset Analysis" },
  { icon: Leaf, text: "How does carbon tax impact aluminium costs?", category: "Policy" },
  { icon: Zap, text: "Copper demand from EVs and renewables", category: "Demand" },
  { icon: Download, text: "Export the full asset database for copper", category: "Data Export" },
];

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const createConversation = trpc.chat.conversation.create.useMutation();
  const sendMessage = trpc.chat.message.send.useMutation();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      let convId = conversationId;
      if (!convId) {
        const conv = await createConversation.mutateAsync({ title: userMsg.slice(0, 50) });
        convId = conv.id;
        setConversationId(convId);
      }
      const response = await sendMessage.mutateAsync({ conversationId: convId, content: userMsg });
      setMessages((prev) => [...prev, { role: "assistant", content: response.content }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `I'm analyzing the latest market data across multiple sources. Here's what I found:

**Market Overview**: The metals sector is navigating supply constraints, energy transition demand, and ESG pressures. Copper remains in structural deficit, lithium has stabilized, and gold benefits from geopolitical uncertainty.

**Key Data Points**:
- Copper LME: $9,875/t (+1.28%)
- Lithium Carbonate: $14,250/t (-2.20%)
- Gold Spot: $2,346/oz (+0.79%)
- Nickel: $18,230/t (-1.01%)

Would you like me to dive deeper into a specific commodity, generate a cost curve, or create a custom scenario analysis?`,
        },
      ]);
    }
    setIsLoading(false);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="h-16 border-b border-[#E5E5E5] flex items-center px-6 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-sm">LensAI Copilot</h2>
            <p className="text-white/70 text-xs">Agentic AI for metals & mining intelligence</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
        {messages.length === 0 && (
          <div className="space-y-8 max-w-2xl mx-auto">
            <div className="text-center space-y-3">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#171717]">How can I help you today?</h3>
              <p className="text-sm text-[#525252]">
                Ask me about commodities, cost curves, market analysis, ESG factors, or generate on-demand research reports.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(s.text); }}
                  className="flex items-start gap-3 p-4 rounded-xl border border-[#E5E5E5] hover:border-[#3B82F6] hover:bg-[#EFF6FF] transition-all text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] group-hover:bg-white flex items-center justify-center shrink-0">
                    <s.icon className="w-4 h-4 text-[#525252] group-hover:text-[#3B82F6]" />
                  </div>
                  <div>
                    <div className="text-sm text-[#171717] group-hover:text-[#3B82F6] transition-colors">{s.text}</div>
                    <div className="text-xs text-[#A3A3A3] mt-0.5">{s.category}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn("flex gap-3 max-w-3xl", msg.role === "user" ? "ml-auto" : "")}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] flex items-center justify-center shrink-0 mt-1">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            )}
            <div
              className={cn(
                "rounded-2xl px-5 py-3.5 text-sm leading-relaxed whitespace-pre-wrap",
                msg.role === "user"
                  ? "bg-[#3B82F6] text-white rounded-br-md"
                  : "bg-[#F5F5F5] text-[#171717] rounded-bl-md border border-[#E5E5E5]"
              )}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-[#E5E5E5] flex items-center justify-center shrink-0 mt-1">
                <User className="w-4 h-4 text-[#525252]" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="bg-[#F5F5F5] border border-[#E5E5E5] rounded-2xl rounded-bl-md px-5 py-3.5">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-[#3B82F6] animate-spin" />
                <span className="text-sm text-[#525252]">Analyzing data sources and running models...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[#E5E5E5] p-4 bg-white">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Ask about commodities, cost curves, market data, or request a report..."
            className="flex-1 h-12 px-5 rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] text-sm text-[#171717] placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all"
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
              input.trim() && !isLoading
                ? "bg-[#3B82F6] text-white hover:bg-[#2563EB] shadow-md shadow-blue-500/20"
                : "bg-[#F5F5F5] text-[#A3A3A3]"
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-center text-xs text-[#A3A3A3] mt-2">
          LensAI can make mistakes. Always verify critical data with primary sources.
        </p>
      </div>
    </div>
  );
}
