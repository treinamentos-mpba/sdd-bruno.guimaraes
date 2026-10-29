import type { Unit } from '../types/weather';

const temperatureFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 0,
});

export function convertTemperature(valueC: number | null, unit: Unit): number | null {
  if (valueC === null) return null;
  if (!Number.isFinite(valueC)) {
    throw new RangeError('A temperatura deve ser finita.');
  }

  return unit === 'fahrenheit' ? (valueC * 9) / 5 + 32 : valueC;
}

export function unitLabel(unit: Unit): string {
  return unit === 'fahrenheit' ? '°F' : '°C';
}

export function formatTemperature(valueC: number | null, unit: Unit): string {
  const value = convertTemperature(valueC, unit);
  if (value === null) return '—';
  const rounded = temperatureFormatter.format(value);
  return `${rounded === '-0' ? '0' : rounded} ${unitLabel(unit)}`;
}
