import { Icon } from '../Icon';
import type { Vehicle } from '../../types/fleet';

export function RouteMap({ vehicle }: { vehicle: Vehicle }) {
  const { route } = vehicle;

  return (
    <section className="map-block">
      <div className="map-head">
        <h3>
          <Icon name="map" />
          Route
        </h3>
        <div className="map-meta">
          <span>
            <strong>{route.totalKm} km</strong> total
          </span>
          <span>
            <strong>{route.remainingKm} km</strong> remaining
          </span>
          <span>
            <strong>{route.eta}</strong> ETA
          </span>
        </div>
      </div>
      <div className="map-canvas" aria-label={`${route.origin} to ${route.destination} route map`}>
        <div className="map-grid" />
        <svg className="map-roads" viewBox="0 0 800 280" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 80 Q200 60 400 100 T800 70" />
          <path d="M0 200 Q150 180 350 210 T800 190" />
          <path d="M120 0 L140 280" />
          <path d="M580 0 L600 280" />
          <path d="M0 140 L800 140" />
        </svg>
        <svg className="map-route" viewBox="0 0 800 280" preserveAspectRatio="none" aria-hidden="true">
          <path className="route-complete" d="M80 220 C 180 180, 240 120, 360 130" />
          <path className="route-remaining" d="M360 130 C 480 140, 580 90, 720 60" />
        </svg>
        <MapMarker type="origin" x={route.originPoint.x} y={route.originPoint.y} title={route.origin} subtitle={`Departed · ${route.originPoint.time}`} />
        <MapMarker
          type="current"
          x={route.currentPoint.x}
          y={route.currentPoint.y}
          title={route.currentPoint.label}
          subtitle={`${route.currentPoint.time} · ${route.speedKph} km/h`}
        />
        <MapMarker type="destination" x={route.destinationPoint.x} y={route.destinationPoint.y} title={route.destination} subtitle={`Arrival · ${route.destinationPoint.time}`} />
        <div className="map-controls">
          <button className="map-ctrl" title="Zoom in" type="button">
            <Icon name="plus" />
          </button>
          <button className="map-ctrl" title="Zoom out" type="button">
            <Icon name="minus" />
          </button>
        </div>
        <div className="map-legend">
          <span className="legend-item">
            <span className="legend-dot green" /> Traveled path
          </span>
          <span className="legend-item">
            <span className="legend-dot blue" /> Remaining route
          </span>
          <span className="legend-item">
            <span className="legend-dot red" /> Destination
          </span>
        </div>
      </div>
    </section>
  );
}

function MapMarker({ type, x, y, title, subtitle }: { type: 'origin' | 'current' | 'destination'; x: number; y: number; title: string; subtitle: string }) {
  return (
    <>
      <div className={`map-marker marker-${type}`} style={{ left: `${x}%`, top: `${y}%` }} />
      <div className={`map-label ${type === 'current' ? 'is-current' : ''}`} style={{ left: `${x}%`, top: `${y}%` }}>
        {title}
        <small>{subtitle}</small>
      </div>
    </>
  );
}
