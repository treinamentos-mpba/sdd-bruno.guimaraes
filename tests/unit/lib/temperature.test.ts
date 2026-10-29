import { describe, expect, it } from 'vitest';
import { formatTemperature } from '../../../src/lib/temperature';

describe('formatTemperature', () => {
  it.each([
    [0, 'celsius', '0 °C'],
    [0, 'fahrenheit', '32 °F'],
    [20, 'fahrenheit', '68 °F'],
    [-40, 'fahrenheit', '-40 °F'],
    [1.5, 'celsius', '2 °C'],
    [-1.5, 'celsius', '-2 °C'],
    [-0.1, 'celsius', '0 °C'],
    [null, 'fahrenheit', '—'],
  ] as const)('formata %s na unidade %s como %s', (value, unit, expected) => {
    expect(formatTemperature(value, unit)).toBe(expected);
  });

  it.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])('sinaliza temperatura inválida: %s', (value) => {
    expect(() => formatTemperature(value, 'celsius')).toThrow(RangeError);
  });
});
