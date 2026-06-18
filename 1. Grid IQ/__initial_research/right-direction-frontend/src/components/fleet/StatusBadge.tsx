import { formatStatus } from '../../utils/format';
import type { VehicleStatus } from '../../types/fleet';

export function StatusBadge({ status }: { status: VehicleStatus }) {
  return (
    <span className={`vc-status ${status}`}>
      <span className="dot" />
      {formatStatus(status)}
    </span>
  );
}
