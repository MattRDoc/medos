const WEEKDAY = new Intl.DateTimeFormat('en-GB', { weekday: 'long' });
const MONTH_DAY = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  month: 'long',
  day: 'numeric',
});
const MONTH_LABEL = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' });

function pad(value: number) {
  return String(value).padStart(2, '0');
}

export function getTodayDate(value = new Date()) {
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}

export function toDateInput(value: Date) {
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}

export function parseDateInput(value: string) {
  return new Date(`${value}T12:00:00`);
}

export function formatTodayLabel(value: string) {
  const date = parseDateInput(value);
  return {
    full: MONTH_DAY.format(date),
    weekday: WEEKDAY.format(date),
    numeric: date.getDate(),
  };
}

export function formatMonthLabel(value: Date) {
  return MONTH_LABEL.format(value);
}

export function getGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function addDays(value: string, amount: number) {
  const next = parseDateInput(value);
  next.setDate(next.getDate() + amount);
  return toDateInput(next);
}

export function buildMonthGrid(month: Date) {
  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  const firstWeekday = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - firstWeekday);

  return Array.from({ length: 42 }, (_, index) => {
    const next = new Date(start);
    next.setDate(start.getDate() + index);
    return next;
  });
}
