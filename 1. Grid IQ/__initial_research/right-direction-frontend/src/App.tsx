import { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { ComponentsPage } from './pages/ComponentsPage';
import { DashboardPage } from './pages/DashboardPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { TrackingPage } from './pages/TrackingPage';
import { useFleetMetrics } from './hooks/useFleet';
import type { ViewId } from './types/fleet';

export function App() {
  const [activeView, setActiveView] = useState<ViewId>('tracking');
  const { data } = useFleetMetrics();

  return (
    <div className="app">
      <Sidebar activeView={activeView} onChangeView={setActiveView} unreadMessages={data?.messagesUnread ?? 5} />
      <div className="view-area">{renderView(activeView)}</div>
    </div>
  );
}

function renderView(view: ViewId) {
  if (view === 'tracking') return <TrackingPage />;
  if (view === 'components') return <ComponentsPage />;
  if (view === 'dashboard') return <DashboardPage />;
  return <PlaceholderPage view={view} />;
}
