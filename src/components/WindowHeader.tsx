import type { TimeOfDay } from '../types';
import { TimeWindowIcon } from './TimeWindowIcon';

interface WindowHeaderProps {
  slot: TimeOfDay;
  primary: string;
  secondary?: string;
}

export function WindowHeader({ slot, primary, secondary }: WindowHeaderProps) {
  return (
    <div className="window-header">
      <div className="window-title-row">
        <span className="time-window-icon" aria-hidden="true">
          <TimeWindowIcon option={slot} />
        </span>
        <h2>{slot}</h2>
      </div>
      <div className="window-count">
        <span>{primary}</span>
        {secondary && <strong>{secondary}</strong>}
      </div>
    </div>
  );
}
