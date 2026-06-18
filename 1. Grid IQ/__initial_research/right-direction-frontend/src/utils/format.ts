import type { VehicleStatus } from '../types/fleet';

export function formatStatus(status: VehicleStatus): string {
  const labels: Record<VehicleStatus, string> = {
    'on-route': 'On Route',
    working: 'Working',
    idle: 'Idle'
  };
  return labels[status];
}

export function formatRoute(origin: string, destination: string): string {
  return `${origin} → ${destination}`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function capacityPercent(loadedTons: number, maxTons: number): number {
  return Math.round((loadedTons / maxTons) * 100);
}
