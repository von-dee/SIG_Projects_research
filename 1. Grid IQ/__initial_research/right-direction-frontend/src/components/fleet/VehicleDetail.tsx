import { Icon } from '../Icon';
import { Button } from '../ui/Button';
import { CapacityCard } from './CapacityCard';
import { CargoPhotos } from './CargoPhotos';
import { DriverCard } from './DriverCard';
import { RouteMap } from './RouteMap';
import { StatusBadge } from './StatusBadge';
import { useToast } from '../../context/ToastContext';
import type { Vehicle } from '../../types/fleet';

export function VehicleDetail({ vehicle }: { vehicle: Vehicle }) {
  const { showToast } = useToast();

  return (
    <main className="detail">
      <div className="detail-topbar">
        <div className="topbar-left">
          <span className="plate-lg">{vehicle.plate}</span>
          <StatusBadge status={vehicle.status} />
        </div>
        <div className="topbar-actions">
          <Button onClick={() => showToast(`Connecting to ${vehicle.driver.name}...`, 'info')} variant="primary">
            <Icon name="phone" />
            Call Driver
          </Button>
          <Button onClick={() => showToast('Opening chat window...', 'success')}>
            <Icon name="chat" />
            Chat with Driver
          </Button>
        </div>
      </div>

      <div className="detail-body">
        <div className="stat-row">
          <DriverCard driver={vehicle.driver} />
          <CapacityCard loadedTons={vehicle.capacity.loadedTons} maxTons={vehicle.capacity.maxTons} />
        </div>
        <RouteMap vehicle={vehicle} />
        <CargoPhotos photos={vehicle.cargoPhotos} />
      </div>
    </main>
  );
}
