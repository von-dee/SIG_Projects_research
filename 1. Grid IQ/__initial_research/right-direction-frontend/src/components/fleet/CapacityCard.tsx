import { Card } from '../ui/Card';
import { capacityPercent } from '../../utils/format';

interface CapacityCardProps {
  loadedTons: number;
  maxTons: number;
}

export function CapacityCard({ loadedTons, maxTons }: CapacityCardProps) {
  const percent = capacityPercent(loadedTons, maxTons);
  const dashOffset = 226 - (226 * percent) / 100;

  return (
    <Card>
      <div className="block-label">Current Truck Capacity</div>
      <div className="capacity-wrap">
        <div className="capacity-ring">
          <svg width="78" height="78" viewBox="0 0 78 78" aria-hidden="true">
            <defs>
              <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#60a5fa" />
              </linearGradient>
            </defs>
            <circle className="track" cx="39" cy="39" r="36" />
            <circle className="fill" cx="39" cy="39" r="36" style={{ strokeDashoffset: dashOffset }} />
          </svg>
          <div className="capacity-value">{percent}%</div>
        </div>
        <div className="capacity-detail">
          <div className="big">
            {percent}
            <span>%</span>
          </div>
          <div className="sub">
            {loadedTons.toFixed(2)} of {maxTons} tons loaded
          </div>
          <div className="cap-bar">
            <i style={{ width: `${percent}%` }} />
          </div>
        </div>
      </div>
    </Card>
  );
}
