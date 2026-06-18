import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { PageShell } from '../components/layout/PageShell';
import { Skeleton } from '../components/ui/Skeleton';
import { useFleetMetrics } from '../hooks/useFleet';
import { formatNumber } from '../utils/format';

export function DashboardPage() {
  const { data, isLoading, error } = useFleetMetrics();

  return (
    <PageShell
      description="Operational overview for dispatch, route performance, message backlog, and active delivery health."
      eyebrow="Control Room"
      title="Fleet Dashboard"
    >
      {isLoading ? <Skeleton rows={4} /> : null}
      {error ? <div className="error-banner">{error}</div> : null}
      {data ? (
        <>
          <div className="metric-grid">
            <MetricCard label="Active Vehicles" value={formatNumber(data.activeVehicles)} badge="Live" />
            <MetricCard label="Active Deliveries" value={formatNumber(data.activeDeliveries)} badge="In Transit" />
            <MetricCard label="Distance Today" value={`${formatNumber(data.totalDistanceKm)} km`} badge="+12%" />
            <MetricCard label="Unread Messages" value={formatNumber(data.messagesUnread)} badge="Priority" tone="warning" />
          </div>
          <div className="dashboard-grid">
            <Card>
              <div className="block-label">Fleet Mix</div>
              <div className="split-stat">
                <span>On Route</span>
                <strong>{data.onRouteVehicles}</strong>
              </div>
              <div className="split-stat">
                <span>Working</span>
                <strong>{data.workingVehicles}</strong>
              </div>
              <div className="split-stat">
                <span>Idle or Pending</span>
                <strong>{data.activeVehicles - data.onRouteVehicles - data.workingVehicles}</strong>
              </div>
            </Card>
            <Card>
              <div className="block-label">Dispatch Focus</div>
              <p className="page-copy">
                Highest priority today is keeping Hamburg to Cologne and Frankfurt to Leipzig routes ahead of handoff windows while resolving two cargo verification follow-ups.
              </p>
            </Card>
          </div>
        </>
      ) : null}
    </PageShell>
  );
}

function MetricCard({ label, value, badge, tone = 'info' }: { label: string; value: string; badge: string; tone?: 'info' | 'warning' }) {
  return (
    <Card className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <Badge tone={tone}>{badge}</Badge>
    </Card>
  );
}
