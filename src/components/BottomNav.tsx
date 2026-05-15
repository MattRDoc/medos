interface BottomNavProps {
  current: string;
  onSelect: (screen: 'today' | 'history' | 'routine' | 'settings') => void;
}

function NavIcon({ id }: { id: (typeof items)[number]['id'] }) {
  if (id === 'today') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7.25 3.75v2.5M16.75 3.75v2.5M5.25 7.75h13.5" />
        <rect x="4.25" y="5.25" width="15.5" height="15" rx="3.2" />
        <path d="m8.5 14 2.2 2.1 4.8-5" />
      </svg>
    );
  }

  if (id === 'history') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5.25 17.25h13.5" />
        <path d="M6.5 15.25 10 11.7l2.7 2.55 4.9-6" />
        <path d="M17.75 8.25h-3.4M17.75 8.25v3.4" />
      </svg>
    );
  }

  if (id === 'routine') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8.25 6.5h10M8.25 12h10M8.25 17.5h10" />
        <path d="M4.75 6.5h.01M4.75 12h.01M4.75 17.5h.01" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4.5 7.25h8.25M16.75 7.25h2.75M4.5 16.75h2.75M11.25 16.75h8.25" />
      <circle cx="14.5" cy="7.25" r="2" />
      <circle cx="9.5" cy="16.75" r="2" />
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
