import type { TimeOfDay } from '../types';

interface TimeWindowIconProps {
  option: TimeOfDay;
}

export function TimeWindowIcon({ option }: TimeWindowIconProps) {
  if (option === 'Morning') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="3.4" />
        <path d="M12 4.5v2.1M12 17.4v2.1M19.5 12h-2.1M6.6 12H4.5M17.3 6.7l-1.5 1.5M8.2 15.8l-1.5 1.5M17.3 17.3l-1.5-1.5M8.2 8.2 6.7 6.7" />
      </svg>
    );
  }

  if (option === 'Afternoon') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="6.8" />
        <path d="M12 5.2v13.6" />
      </svg>
    );
  }

  if (option === 'Evening') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4.5 14.4h15" />
        <path d="M8 14.4a4 4 0 0 1 8 0" />
        <path d="M7 18.2h10" />
      </svg>
    );
  }

  if (option === 'Bedtime') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15.7 5.2a6.6 6.6 0 1 0 3.1 11.7A7.4 7.4 0 1 1 15.7 5.2Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="7.2" />
      <path d="M12 7.8v4.5l3 1.8" />
    </svg>
  );
}
