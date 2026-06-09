import { useState, useRef, useEffect } from "react";
import { trpc } from "@/providers/trpc";
import {
  X,
  Send,
  Sparkles,
  User,
  Loader2,
  FileText,
  BarChart3,
  AlertTriangle,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUGGESTIONS = [
  { icon: BarChart3, text: "Show copper cost curve 2026" },
  { icon: AlertTriangle, text: "Lithium supply risk assessment" },
  { icon: FileText, text: "Generate gold market report" },
  { icon: Download, text: "Export ESG comparison data" },
];

export function ChatOverlay({ isOpen, onClose }: ChatOverlayProps) {
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

      const response = await sendMessage.mutateAsync({
        conversationId: convId,
        content: userMsg,
      });

      setMessages((prev) => [...prev, { role: "assistant", content: response.content }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `I apologize, but I'm having trouble connecting to the analysis engine right now. Let me provide a general response:

**Market Overview**: The metals and mining sector is currently navigating a complex landscape of supply constraints, energy transition demand, and ESG pressures. Copper remains in structural deficit, lithium prices have stabilized after a significant correction, and gold continues to benefit from geopolitical uncertainty.

Would you like me to try again or explore a specific topic?`,
        },
      ]);
    }
    setIsLoading(false);
  };

  const handleSuggestion = (text: string) => {
    setInput(text);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

      {/* Chat Panel */}
      <div className="relative w-full max-w-[640px] bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="h-16 border-b border-[#E5E5E5] flex items-center justify-between px-6 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-sm">LensAI Copilot</h2>
              <p className="text-white/70 text-xs">AI-powered mining intelligence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {messages.length === 0 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] flex items-center justify-center mx-auto">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#171717]">How can I help you today?</h3>
                <p className="text-sm text-[#525252]">
                  Ask me about commodities, cost curves, market analysis, or generate reports
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestion(s.text)}
                    className="flex items-center gap-3 p-3 rounded-lg border border-[#E5E5E5] hover:border-[#3B82F6] hover:bg-[#EFF6FF] transition-all text-left group"
                  >
                    <s.icon className="w-4 h-4 text-[#525252] group-hover:text-[#3B82F6]" />
                    <span className="text-sm text-[#171717]">{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-3",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] flex items-center justify-center shrink-0 mt-1">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
                  msg.role === "user"
                    ? "bg-[#3B82F6] text-white rounded-br-md"
                    : "bg-[#F5F5F5] text-[#171717] rounded-bl-md border border-[#E5E5E5]"
                )}
              >
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-[#E5E5E5] flex items-center justify-center shrink-0 mt-1">
                  <User className="w-3.5 h-3.5 text-[#525252]" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-[#F5F5F5] border border-[#E5E5E5] rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-[#3B82F6] animate-spin" />
                  <span className="text-sm text-[#525252]">Analyzing data sources...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-[#E5E5E5] p-4 bg-white">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Ask about commodities, cost curves, market data..."
              className="flex-1 h-11 px-4 rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] text-sm text-[#171717] placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all"
            />
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              className={cn(
                "w-11 h-11 rounded-lg flex items-center justify-center transition-all",
                input.trim() && !isLoading
                  ? "bg-[#3B82F6] text-white hover:bg-[#2563EB]"
                  : "bg-[#F5F5F5] text-[#A3A3A3]"
              )}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
