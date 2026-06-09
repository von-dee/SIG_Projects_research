import { Sparkles } from "lucide-react";

interface ChatFABProps {
  onClick: () => void;
}

export function ChatFAB({ onClick }: ChatFABProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] text-white rounded-full shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all duration-200 animate-pulse-glow"
    >
      <Sparkles className="w-5 h-5" />
      <span className="text-sm font-medium">LensAI</span>
    </button>
  );
}
