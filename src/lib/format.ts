const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  timeZone: 'UTC',
  year: 'numeric',
});

const shortDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  timeZone: 'UTC',
});

const dayLabelFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'UTC',
  weekday: 'long',
});

const probabilityFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 0,
});

function parseLocalDate(date: string): Date {
  const parsedDate = new Date(`${date}T00:00:00Z`);
  if (!Number.isFinite(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) {
    throw new RangeError('A data deve estar no formato YYYY-MM-DD e ser válida.');
  }
  return parsedDate;
}

export function formatDate(date: string): string {
  return dateFormatter.format(parseLocalDate(date));
}

export function getShortDate(date: string): string {
  return shortDateFormatter.format(parseLocalDate(date));
}

export function formatDayLabel(date: string, index?: number): string {
  const parsedDate = parseLocalDate(date);
  if (index === 0) return 'Hoje';
  if (index === 1) return 'Amanhã';
  return dayLabelFormatter.format(parsedDate);
}

export function formatPrecipitationProbability(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value) || value < 0 || value > 100) return '—';
  return `${probabilityFormatter.format(value)}%`;
}
