interface BottomNavProps {
  current: string;
  onSelect: (screen: 'today' | 'history' | 'routine' | 'settings') => void;
}

function NavIcon({ id }: { id: (typeof items)[number]['id'] }) {
  if (id === 'today') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="5.5" />
        <path d="M12 2.75v2.5M12 18.75v2.5M21.25 12h-2.5M5.25 12h-2.5" />
      </svg>
    );
  }

  if (id === 'history') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 5.5h12M6 12h12M6 18.5h12" />
        <circle cx="7.5" cy="5.5" r="1" />
        <circle cx="10.5" cy="12" r="1" />
        <circle cx="14.5" cy="18.5" r="1" />
      </svg>
    );
  }

  if (id === 'routine') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 5.25v13.5M5.25 12h13.5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 4.75v2.1M12 17.15v2.1M19.25 12h-2.1M6.85 12h-2.1M16.98 7.02l-1.48 1.48M8.5 15.5l-1.48 1.48M16.98 16.98l-1.48-1.48M8.5 8.5 7.02 7.02" />
      <circle cx="12" cy="12" r="3.15" />
    </svg>
  );
}

const items = [
  { id: 'today', label: 'Today' },
  { id: 'history', label: 'History' },
  { id: 'routine', label: 'Routine' },
  { id: 'settings', label: 'Settings' },
] as const;

export function BottomNav({ current, onSelect }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {items.map((item) => (
        <button
          key={item.id}
          className={`nav-item${current === item.id ? ' active' : ''}`}
          type="button"
          onClick={() => onSelect(item.id)}
          aria-current={current === item.id ? 'page' : undefined}
        >
          <span className="nav-icon" aria-hidden="true">
            <NavIcon id={item.id} />
          </span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
