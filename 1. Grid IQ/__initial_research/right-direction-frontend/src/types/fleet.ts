export type VehicleStatus = 'on-route' | 'working' | 'idle';

export type ViewId =
  | 'dashboard'
  | 'chats'
  | 'partners'
  | 'tracking'
  | 'analysis'
  | 'history'
  | 'components';

export type FilterId = 'all' | VehicleStatus;

export interface Driver {
  id: string;
  name: string;
  initials: string;
  license: string;
  role: string;
  rating: number;
  phone: string;
}

export interface RoutePoint {
  label: string;
  city: string;
  time: string;
  x: number;
  y: number;
}

export interface CargoPhoto {
  id: string;
  time: string;
  label: string;
  verified: boolean;
  tone: 'blue' | 'green' | 'amber' | 'purple';
}

export interface Vehicle {
  id: string;
  plate: string;
  status: VehicleStatus;
  route: {
    origin: string;
    destination: string;
    totalKm: number;
    remainingKm: number;
    eta: string;
    speedKph: number;
    progressPercent: number;
    originPoint: RoutePoint;
    currentPoint: RoutePoint;
    destinationPoint: RoutePoint;
  };
  driver: Driver;
  capacity: {
    loadedTons: number;
    maxTons: number;
  };
  cargoPhotos: CargoPhoto[];
}

export interface FleetMetrics {
  activeVehicles: number;
  activeDeliveries: number;
  totalDistanceKm: number;
  messagesUnread: number;
  workingVehicles: number;
  onRouteVehicles: number;
}

export interface ApiState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}
