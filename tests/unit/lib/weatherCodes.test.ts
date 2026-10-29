import { describe, expect, it } from 'vitest';
import { getWeatherCondition } from '../../../src/lib/weatherCodes';

describe('getWeatherCondition', () => {
  it.each([
    0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86,
    95, 96, 99,
  ])('fornece descrição e ícone para o código WMO %s', (code) => {
    const condition = getWeatherCondition(code);
    expect(condition.description).not.toBe('Condição indisponível');
    expect(condition.icon).not.toBe('❔');
    expect(condition.description.length).toBeGreaterThan(0);
    expect(condition.icon.length).toBeGreaterThan(0);
  });

  it('traduz um código WMO conhecido', () => {
    expect(getWeatherCondition(61)).toEqual({ description: 'Chuva leve', icon: '🌧️' });
  });

  it('fornece fallback explícito para códigos desconhecidos', () => {
    expect(getWeatherCondition(999)).toEqual({
      description: 'Condição indisponível',
      icon: '❔',
    });
  });
});
