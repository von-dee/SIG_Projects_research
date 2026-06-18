import { Icon } from '../Icon';
import type { CargoPhoto } from '../../types/fleet';

export function CargoPhotos({ photos }: { photos: CargoPhoto[] }) {
  return (
    <section className="cargo-block">
      <div className="cargo-head">
        <h3>
          <Icon name="image" />
          Cargo Photo Reports
        </h3>
        <button className="cargo-link" type="button">
          View all (8)
        </button>
      </div>
      <div className="photo-grid">
        {photos.map((photo) => (
          <button className={`photo-thumb ${photo.verified ? 'verify' : ''} photo-${photo.tone}`} key={photo.id} type="button">
            <span className="photo-time">
              {photo.time} · {photo.label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
