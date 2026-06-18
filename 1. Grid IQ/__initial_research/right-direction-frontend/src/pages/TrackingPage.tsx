import { useMemo, useState } from 'react';
import { EmptyState } from '../components/ui/EmptyState';
import { FleetList } from '../components/fleet/FleetList';
import { Skeleton } from '../components/ui/Skeleton';
import { VehicleDetail } from '../components/fleet/VehicleDetail';
import { useFleet } from '../hooks/useFleet';
import { formatRoute } from '../utils/format';
import type { FilterId, Vehicle } from '../types/fleet';

export function TrackingPage() {
  const { data: vehicles, error, isLoading } = useFleet();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('sd-752069247');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterId>('all');

  const filteredVehicles = useMemo(() => {
    if (!vehicles) return [];
    const query = searchQuery.trim().toLowerCase();
    return vehicles.filter((vehicle) => {
      const matchesFilter = activeFilter === 'all' || vehicle.status === activeFilter;
      const route = formatRoute(vehicle.route.origin, vehicle.route.destination).toLowerCase();
      const matchesSearch = !query || vehicle.plate.toLowerCase().includes(query) || route.includes(query) || vehicle.driver.name.toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchQuery, vehicles]);

  const selectedVehicle = useMemo<Vehicle | undefined>(() => {
    if (!vehicles) return undefined;
    return vehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? filteredVehicles[0] ?? vehicles[0];
  }, [filteredVehicles, selectedVehicleId, vehicles]);

  if (isLoading) {
    return (
      <div className="tracking-grid">
        <section className="fleet">
          <div className="fleet-header">
            <div className="fleet-title">
              <h2>Active Fleet</h2>
            </div>
          </div>
          <Skeleton rows={6} />
        </section>
        <main className="detail">
          <Skeleton rows={8} />
        </main>
      </div>
    );
  }

  if (error || !vehicles) {
    return <EmptyState title="Fleet data unavailable" description={error ?? 'Unable to load fleet data right now.'} />;
  }

  if (!selectedVehicle) {
    return <EmptyState title="No vehicles found" description="Adjust your filters or search terms to see fleet results." />;
  }

  return (
    <div className="tracking-grid">
      <FleetList
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        onSearchChange={setSearchQuery}
        onSelectVehicle={(vehicle) => setSelectedVehicleId(vehicle.id)}
        searchQuery={searchQuery}
        selectedVehicleId={selectedVehicle.id}
        vehicles={filteredVehicles}
      />
      <VehicleDetail vehicle={selectedVehicle} />
    </div>
  );
}
