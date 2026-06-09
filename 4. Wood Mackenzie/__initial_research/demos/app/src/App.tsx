import { Routes, Route, useLocation } from "react-router";
import { Sidebar } from "./components/Sidebar";
import { ChatFAB } from "./components/ChatFAB";
import { ChatOverlay } from "./components/ChatOverlay";
import { useState } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import MarketPage from "./pages/MarketPage";
import AssetsPage from "./pages/AssetsPage";
import ScenariosPage from "./pages/ScenariosPage";
import AlertsPage from "./pages/AlertsPage";
import ExportsPage from "./pages/ExportsPage";
import ChatPage from "./pages/ChatPage";

function Layout({ children }: { children: React.ReactNode }) {
  const [chatOpen, setChatOpen] = useState(false);
  const location = useLocation();
  const isLogin = location.pathname === "/login";

  if (isLogin) return <>{children}</>;

  return (
    <div className="flex h-screen bg-[#FAFAFA]">
      <Sidebar />
      <main className="flex-1 ml-[260px] overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin">
          {children}
        </div>
      </main>
      <ChatFAB onClick={() => setChatOpen(true)} />
      <ChatOverlay isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="*" element={
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/market" element={<MarketPage />} />
            <Route path="/assets" element={<AssetsPage />} />
            <Route path="/scenarios" element={<ScenariosPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/exports" element={<ExportsPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      } />
    </Routes>
  );
}
