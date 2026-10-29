import { assert, describe, expect, expectTypeOf, it } from 'vitest';
import { mockWeatherData } from '../../../src/mocks/weather';
import type {
  City,
  CurrentWeather,
  ForecastDay,
  Unit,
  WeatherData,
} from '../../../src/types/weather';

describe('contratos meteorologicos', () => {
  it('representa unidades, campos opcionais e valores ausentes', () => {
    expectTypeOf<Unit>().toEqualTypeOf<'celsius' | 'fahrenheit'>();
    expectTypeOf<City['admin1']>().toEqualTypeOf<string | undefined>();
    expectTypeOf<CurrentWeather['temperatureC']>().toEqualTypeOf<number>();
    expectTypeOf<CurrentWeather['weatherCode']>().toEqualTypeOf<number>();
    expectTypeOf<CurrentWeather['apparentTemperatureC']>().toEqualTypeOf<number | null>();
    expectTypeOf<CurrentWeather['relativeHumidity']>().toEqualTypeOf<number | null>();
    expectTypeOf<CurrentWeather['windSpeedKmh']>().toEqualTypeOf<number | null>();
    expectTypeOf<ForecastDay['minTemperatureC']>().toEqualTypeOf<number | null>();
    expectTypeOf<ForecastDay['maxTemperatureC']>().toEqualTypeOf<number | null>();
    expectTypeOf<ForecastDay['weatherCode']>().toEqualTypeOf<number | null>();
    expectTypeOf(mockWeatherData).toEqualTypeOf<WeatherData>();
  });

  it('oferece cidade e clima atual com precisao original em Celsius', () => {
    const { city, current } = mockWeatherData;

    expect(city.name).toBe('Salvador');
    expect(city.latitude).toBeGreaterThanOrEqual(-90);
    expect(city.latitude).toBeLessThanOrEqual(90);
    expect(city.longitude).toBeGreaterThanOrEqual(-180);
    expect(city.longitude).toBeLessThanOrEqual(180);
    expect(current.temperatureC).toBe(28.6);
    expect(current.apparentTemperatureC).toBe(31.2);
    expect(current.relativeHumidity).toBeGreaterThanOrEqual(0);
    expect(current.relativeHumidity).toBeLessThanOrEqual(100);
    expect(current.windSpeedKmh).toBeGreaterThanOrEqual(0);
    expect(current.weatherCode).toBe(2);
  });

  it('oferece exatamente cinco dias locais consecutivos, completos e ordenados', () => {
    const { current, forecast } = mockWeatherData;
    const observedDate = new Intl.DateTimeFormat('en-CA', {
      timeZone: forecast.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(current.observedAt));

    expect(forecast.timezone).toBe('America/Bahia');
    expect(forecast.incomplete).toBe(false);
    expect(forecast.days).toHaveLength(5);
    expect(forecast.days[0].date).toBe(observedDate);

    for (const [index, day] of forecast.days.entries()) {
      const expectedDate = new Date(`${observedDate}T00:00:00Z`);
      expectedDate.setUTCDate(expectedDate.getUTCDate() + index);

      expect(day.date).toBe(expectedDate.toISOString().slice(0, 10));
      expect(day.incomplete).toBe(false);
      assert(typeof day.minTemperatureC === 'number');
      assert(typeof day.maxTemperatureC === 'number');
      expect(day.minTemperatureC).toBeLessThanOrEqual(day.maxTemperatureC);
      expect(day.weatherCode).toEqual(expect.any(Number));
    }
  });
});
