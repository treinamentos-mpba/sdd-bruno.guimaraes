import { describe, expect, it } from 'vitest';
import {
  convertTemperature,
  formatTemperature,
  unitLabel,
} from '../../src/lib/temperature';

describe('convertTemperature', () => {
  it.each([
    [0, 'fahrenheit', 32],
    [100, 'fahrenheit', 212],
    [-40, 'fahrenheit', -40],
    [20, 'fahrenheit', 68],
    [20, 'celsius', 20],
  ] as const)('converte %s °C para %s como %s', (valueC, unit, expected) => {
    expect(convertTemperature(valueC, unit)).toBe(expected);
  });

  it('preserva temperaturas ausentes', () => {
    expect(convertTemperature(null, 'fahrenheit')).toBeNull();
  });
});

describe('formatTemperature', () => {
  it.each([
    [1.5, 'celsius', '2 °C'],
    [-1.5, 'celsius', '-2 °C'],
    [-0.1, 'celsius', '0 °C'],
    [20.4, 'fahrenheit', '69 °F'],
    [null, 'fahrenheit', '—'],
  ] as const)('formata %s °C em %s como %s', (valueC, unit, expected) => {
    expect(formatTemperature(valueC, unit)).toBe(expected);
  });
});

describe('unitLabel', () => {
  it.each([
    ['celsius', '°C'],
    ['fahrenheit', '°F'],
  ] as const)('retorna o símbolo de %s', (unit, expected) => {
    expect(unitLabel(unit)).toBe(expected);
  });
});
