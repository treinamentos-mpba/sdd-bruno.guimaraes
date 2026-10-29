import { describe, expect, it } from 'vitest';
import {
  formatDate,
  formatDayLabel,
  formatPrecipitationProbability,
  getShortDate,
} from '../../../src/lib/format';

describe('formatadores de apresentação', () => {
  it('formata a data local sem depender do fuso do dispositivo', () => {
    expect(formatDate('2026-10-29')).toBe('29/10/2026');
    expect(formatDayLabel('2026-10-29')).toBe('quinta-feira');
  });

  it.each([
    ['2026-10-29', 0, 'Hoje'],
    ['2026-10-30', 1, 'Amanhã'],
    ['2026-10-31', 2, 'sábado'],
    ['2026-11-01', 3, 'domingo'],
  ])('formata a data %s no índice %i como %s', (date, index, expected) => {
    expect(formatDayLabel(date, index)).toBe(expected);
  });

  it('formata data curta como dia e mês', () => {
    expect(getShortDate('2026-10-29')).toBe('29/10');
  });

  it('rejeita datas fora do formato ISO ou inexistentes', () => {
    expect(() => formatDate('29/10/2026')).toThrow(RangeError);
    expect(() => formatDayLabel('2026-02-30')).toThrow(RangeError);
    expect(() => getShortDate('2026-02-30')).toThrow(RangeError);
  });

  it.each([
    [0, '0%'],
    [65, '65%'],
    [65.5, '66%'],
    [100, '100%'],
    [null, '—'],
    [undefined, '—'],
    [-1, '—'],
    [101, '—'],
    [Number.NaN, '—'],
  ] as const)('formata probabilidade de chuva %s como %s', (value, expected) => {
    expect(formatPrecipitationProbability(value)).toBe(expected);
  });
});
