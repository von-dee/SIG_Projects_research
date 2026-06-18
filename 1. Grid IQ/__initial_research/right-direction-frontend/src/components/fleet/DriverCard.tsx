import { Card } from '../ui/Card';
import type { Driver } from '../../types/fleet';

export function DriverCard({ driver }: { driver: Driver }) {
  return (
    <Card>
      <div className="block-label">Driver Assignment</div>
      <div className="driver-info">
        <div className="driver-avatar">{driver.initials}</div>
        <div className="driver-meta">
          <strong>{driver.name}</strong>
          <small>
            License #{driver.license} · {driver.role}
          </small>
        </div>
        <div className="driver-rating" aria-label={`Driver rating ${driver.rating}`}>
          ★ {driver.rating}
        </div>
      </div>
    </Card>
  );
}
