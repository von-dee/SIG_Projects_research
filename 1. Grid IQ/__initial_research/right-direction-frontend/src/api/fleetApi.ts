import { metrics, vehicles } from '../data/fleet';
import type { FleetMetrics, Vehicle } from '../types/fleet';

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export interface FleetApi {
  getVehicles: () => Promise<Vehicle[]>;
  getMetrics: () => Promise<FleetMetrics>;
  getVehicleById: (id: string) => Promise<Vehicle | undefined>;
}

export const fleetApi: FleetApi = {
  async getVehicles() {
    await wait(280);
    return vehicles;
  },
  async getMetrics() {
    await wait(180);
    return metrics;
  },
  async getVehicleById(id: string) {
    await wait(120);
    return vehicles.find((vehicle) => vehicle.id === id);
  }
};
