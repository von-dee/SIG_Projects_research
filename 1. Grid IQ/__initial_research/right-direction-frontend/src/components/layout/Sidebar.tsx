import { Icon } from '../Icon';
import { useTheme } from '../../context/ThemeContext';
import type { ViewId } from '../../types/fleet';

interface SidebarProps {
  activeView: ViewId;
  onChangeView: (view: ViewId) => void;
  unreadMessages: number;
}

interface NavItem {
  id: ViewId;
  label: string;
  icon: React.ComponentProps<typeof Icon>['name'];
  badge?: number;
}

const mainNav: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'chats', label: 'Chats', icon: 'chat', badge: 5 },
  { id: 'partners', label: 'Partners', icon: 'users' },
  { id: 'tracking', label: 'Tracking', icon: 'pin' }
];

const trackingNav = [
  { label: 'Trucks', icon: 'truck', badge: undefined },
  { label: 'Cargos', icon: 'box', badge: 2 },
  { label: 'Repair', icon: 'tool', badge: undefined },
  { label: 'Drivers', icon: 'target', badge: undefined },
  { label: 'Reports', icon: 'file', badge: 1 }
] satisfies Array<{ label: string; icon: React.ComponentProps<typeof Icon>['name']; badge?: number }>;

const systemNav: NavItem[] = [
  { id: 'analysis', label: 'Analysis', icon: 'chart' },
  { id: 'history', label: 'History', icon: 'history' },
  { id: 'components', label: 'UI Components', icon: 'settings' }
];

export function Sidebar({ activeView, onChangeView, unreadMessages }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-mark">
          <Icon name="arrow" />
        </div>
        <div className="logo-text">
          Right Direction
          <span>Fleet Manager</span>
        </div>
      </div>

      <nav className="nav-group" aria-label="Application navigation">
        <div className="nav-label">Main</div>
        {mainNav.map((item) => (
          <button
            className={`nav-item ${activeView === item.id ? 'active' : ''}`}
            key={item.id}
            onClick={() => onChangeView(item.id)}
            type="button"
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
            {item.id === 'chats' ? <span className="nav-badge">{unreadMessages}</span> : item.badge ? <span className="nav-badge">{item.badge}</span> : null}
          </button>
        ))}

        <div className="nav-submenu" aria-label="Tracking shortcuts">
          {trackingNav.map((item, index) => (
            <button
              className={`sub-item ${activeView === 'tracking' && index === 0 ? 'active-sub' : ''}`}
              key={item.label}
              onClick={() => onChangeView('tracking')}
              type="button"
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
            </button>
          ))}
        </div>

        <div className="nav-label">System</div>
        {systemNav.map((item) => (
          <button
            className={`nav-item ${activeView === item.id ? 'active' : ''}`}
            key={item.id}
            onClick={() => onChangeView(item.id)}
            type="button"
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="theme-toggle" onClick={toggleTheme} type="button">
          <Icon name={theme === 'dark' ? 'moon' : 'sun'} />
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <button className="user-chip" type="button">
          <span className="avatar">MK</span>
          <span className="user-meta">
            <strong>Marco Keller</strong>
            <small>Fleet Dispatcher</small>
          </span>
        </button>
      </div>
    </aside>
  );
}
