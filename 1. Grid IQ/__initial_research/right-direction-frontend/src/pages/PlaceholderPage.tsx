import { Card } from '../components/ui/Card';
import { PageShell } from '../components/layout/PageShell';
import type { ViewId } from '../types/fleet';

const content: Record<Exclude<ViewId, 'tracking' | 'components' | 'dashboard'>, { title: string; eyebrow: string; description: string }> = {
  chats: {
    title: 'Chats',
    eyebrow: 'Communications',
    description: 'Driver and dispatcher conversations, incident notes, and route handoff messages will live here.'
  },
  partners: {
    title: 'Partners',
    eyebrow: 'Network',
    description: 'Manage carriers, warehouses, depots, and service partners involved in fleet operations.'
  },
  analysis: {
    title: 'Analysis',
    eyebrow: 'Insights',
    description: 'Performance analytics for route efficiency, fleet utilisation, service reliability, and capacity trends.'
  },
  history: {
    title: 'History',
    eyebrow: 'Archive',
    description: 'Historical routes, vehicle events, cargo photo reports, and driver activity records.'
  }
};

export function PlaceholderPage({ view }: { view: Exclude<ViewId, 'tracking' | 'components' | 'dashboard'> }) {
  const item = content[view];
  return (
    <PageShell description={item.description} eyebrow={item.eyebrow} title={item.title}>
      <Card>
        <div className="block-label">Next Build Area</div>
        <p className="page-copy">
          This route is wired into the React shell and ready for backend integration. Add API hooks and page-specific components here as the application surface expands.
        </p>
      </Card>
    </PageShell>
  );
}
