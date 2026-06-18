import { Icon } from '../Icon';
import { StatusBadge } from './StatusBadge';
import { formatRoute } from '../../utils/format';
import type { FilterId, Vehicle } from '../../types/fleet';

interface FleetListProps {
  vehicles: Vehicle[];
  selectedVehicleId: string;
  searchQuery: string;
  activeFilter: FilterId;
  onSearchChange: (value: string) => void;
  onFilterChange: (filter: FilterId) => void;
  onSelectVehicle: (vehicle: Vehicle) => void;
}

const filters: Array<{ id: FilterId; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'on-route', label: 'On Route' },
  { id: 'working', label: 'Working' },
  { id: 'idle', label: 'Idle' }
];

export function FleetList({
  vehicles,
  selectedVehicleId,
  searchQuery,
  activeFilter,
  onSearchChange,
  onFilterChange,
  onSelectVehicle
}: FleetListProps) {
  return (
    <section className="fleet" aria-label="Fleet vehicles">
      <div className="fleet-header">
        <div className="fleet-title">
          <h2>Active Fleet</h2>
          <span className="fleet-count">{vehicles.length} vehicles</span>
        </div>
        <label className="search-box">
          <Icon name="search" />
          <input
            aria-label="Search vehicles"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by plate or route..."
            type="search"
            value={searchQuery}
          />
        </label>
        <div className="filter-tabs" role="tablist" aria-label="Fleet status filters">
          {filters.map((filter) => (
            <button
              aria-selected={activeFilter === filter.id}
              className={`filter-tab ${activeFilter === filter.id ? 'active' : ''}`}
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              role="tab"
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="fleet-list">
        {vehicles.map((vehicle) => (
          <button
            className={`vehicle-card ${selectedVehicleId === vehicle.id ? 'selected' : ''}`}
            key={vehicle.id}
            onClick={() => onSelectVehicle(vehicle)}
            type="button"
          >
            <span className="vc-top">
              <span className="vc-plate">{vehicle.plate}</span>
              <StatusBadge status={vehicle.status} />
            </span>
            <span className="vc-bottom">
              <span className="vc-route">
                <Icon name="pin" />
                {formatRoute(vehicle.route.origin, vehicle.route.destination)}
              </span>
              <span className="vc-eta">
                ETA <strong>{vehicle.route.eta}</strong>
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
