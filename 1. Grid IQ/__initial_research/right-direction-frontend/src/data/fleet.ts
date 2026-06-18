import type { FleetMetrics, Vehicle } from '../types/fleet';

const photos = [
  { id: 'cargo-1', time: '08:14', label: 'Loading', verified: true, tone: 'blue' },
  { id: 'cargo-2', time: '08:32', label: 'Departure', verified: true, tone: 'green' },
  { id: 'cargo-3', time: '10:05', label: 'Checkpoint', verified: true, tone: 'amber' },
  { id: 'cargo-4', time: '11:48', label: 'In transit', verified: false, tone: 'purple' }
] as const;

export const vehicles: Vehicle[] = [
  {
    id: 'xr-936383762',
    plate: 'XR - 936383762',
    status: 'working',
    route: {
      origin: 'Berlin',
      destination: 'Munich',
      totalKm: 584,
      remainingKm: 228,
      eta: '2h 15m',
      speedKph: 71,
      progressPercent: 61,
      originPoint: { label: 'Origin', city: 'Berlin', time: '07:40', x: 12, y: 26 },
      currentPoint: { label: 'Current Position', city: 'Nuremberg', time: 'Live', x: 59, y: 54 },
      destinationPoint: { label: 'Destination', city: 'Munich', time: '13:05', x: 84, y: 76 }
    },
    driver: {
      id: 'driver-js',
      name: 'Julia Schmidt',
      initials: 'JS',
      license: 'DE-59284011',
      role: 'Heavy Cargo Specialist',
      rating: 4.8,
      phone: '+49 30 1209 4920'
    },
    capacity: { loadedTons: 19.2, maxTons: 26 },
    cargoPhotos: photos.map((photo) => ({ ...photo }))
  },
  {
    id: 'sd-752069247',
    plate: 'SD - 752069247',
    status: 'on-route',
    route: {
      origin: 'Hamburg',
      destination: 'Cologne',
      totalKm: 438,
      remainingKm: 192,
      eta: '4h 30m',
      speedKph: 86,
      progressPercent: 56,
      originPoint: { label: 'Origin', city: 'Hamburg', time: '08:14', x: 10, y: 79 },
      currentPoint: { label: 'Current Position', city: 'A1 corridor', time: 'Live', x: 45, y: 46 },
      destinationPoint: { label: 'Destination', city: 'Cologne', time: '14:44', x: 90, y: 21 }
    },
    driver: {
      id: 'driver-th',
      name: 'Thomas Hoffmann',
      initials: 'TH',
      license: 'DE-29481756',
      role: 'Senior Operator',
      rating: 4.9,
      phone: '+49 40 9824 1756'
    },
    capacity: { loadedTons: 14.75, maxTons: 25 },
    cargoPhotos: photos.map((photo) => ({ ...photo }))
  },
  {
    id: 'al-113949207',
    plate: 'AL - 113949207',
    status: 'on-route',
    route: {
      origin: 'Frankfurt',
      destination: 'Leipzig',
      totalKm: 392,
      remainingKm: 116,
      eta: '1h 45m',
      speedKph: 79,
      progressPercent: 70,
      originPoint: { label: 'Origin', city: 'Frankfurt', time: '09:05', x: 16, y: 72 },
      currentPoint: { label: 'Current Position', city: 'Erfurt', time: 'Live', x: 62, y: 39 },
      destinationPoint: { label: 'Destination', city: 'Leipzig', time: '12:20', x: 88, y: 23 }
    },
    driver: {
      id: 'driver-mk',
      name: 'Markus Klein',
      initials: 'MK',
      license: 'DE-91048266',
      role: 'Regional Operator',
      rating: 4.7,
      phone: '+49 69 4921 8120'
    },
    capacity: { loadedTons: 21.4, maxTons: 28 },
    cargoPhotos: photos.map((photo) => ({ ...photo }))
  },
  {
    id: 'bv-482019375',
    plate: 'BV - 482019375',
    status: 'working',
    route: {
      origin: 'Stuttgart',
      destination: 'Nuremberg',
      totalKm: 209,
      remainingKm: 84,
      eta: '3h 05m',
      speedKph: 42,
      progressPercent: 60,
      originPoint: { label: 'Origin', city: 'Stuttgart', time: '06:55', x: 19, y: 66 },
      currentPoint: { label: 'Current Position', city: 'Aalen depot', time: 'Live', x: 49, y: 49 },
      destinationPoint: { label: 'Destination', city: 'Nuremberg', time: '12:50', x: 78, y: 32 }
    },
    driver: {
      id: 'driver-lf',
      name: 'Lena Fischer',
      initials: 'LF',
      license: 'DE-66214098',
      role: 'Depot Transfer Lead',
      rating: 4.6,
      phone: '+49 711 7420 3981'
    },
    capacity: { loadedTons: 10.4, maxTons: 24 },
    cargoPhotos: photos.map((photo) => ({ ...photo }))
  },
  {
    id: 'nt-820144931',
    plate: 'NT - 820144931',
    status: 'idle',
    route: {
      origin: 'Dresden',
      destination: 'Bremen',
      totalKm: 512,
      remainingKm: 512,
      eta: '—',
      speedKph: 0,
      progressPercent: 0,
      originPoint: { label: 'Origin', city: 'Dresden', time: 'Pending', x: 22, y: 70 },
      currentPoint: { label: 'Current Position', city: 'Dresden Depot', time: 'Idle', x: 22, y: 70 },
      destinationPoint: { label: 'Destination', city: 'Bremen', time: 'TBD', x: 82, y: 28 }
    },
    driver: {
      id: 'driver-ak',
      name: 'Anika Kruger',
      initials: 'AK',
      license: 'DE-77193440',
      role: 'Reserve Operator',
      rating: 4.5,
      phone: '+49 351 6650 1182'
    },
    capacity: { loadedTons: 0, maxTons: 22 },
    cargoPhotos: photos.map((photo) => ({ ...photo, verified: false }))
  }
];

export const metrics: FleetMetrics = {
  activeVehicles: 12,
  activeDeliveries: 48,
  totalDistanceKm: 14392,
  messagesUnread: 5,
  workingVehicles: vehicles.filter((vehicle) => vehicle.status === 'working').length,
  onRouteVehicles: vehicles.filter((vehicle) => vehicle.status === 'on-route').length
};
