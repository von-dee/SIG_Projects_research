import { fleetApi } from '../api/fleetApi';
import { useAsyncData } from './useAsyncData';

export function useFleet() {
  return useAsyncData(() => fleetApi.getVehicles(), []);
}

export function useFleetMetrics() {
  return useAsyncData(() => fleetApi.getMetrics(), []);
}
