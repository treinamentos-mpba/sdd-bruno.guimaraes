import type { WeatherData } from '../types/weather';

export const mockWeatherData: WeatherData = {
  city: {
    id: 3450554,
    name: 'Salvador',
    country: 'Brasil',
    admin1: 'Bahia',
    latitude: -12.9711,
    longitude: -38.5108,
  },
  current: {
    observedAt: '2026-10-29T15:00:00-03:00',
    temperatureC: 28.6,
    apparentTemperatureC: 31.2,
    relativeHumidity: 74,
    windSpeedKmh: 18.4,
    weatherCode: 2,
  },
  forecast: {
    timezone: 'America/Bahia',
    days: [
      {
        date: '2026-10-29',
        minTemperatureC: 24.3,
        maxTemperatureC: 29.8,
        weatherCode: 2,
        precipitationProbability: 10,
        incomplete: false,
      },
      {
        date: '2026-10-30',
        minTemperatureC: 24.1,
        maxTemperatureC: 30.2,
        weatherCode: 0,
        precipitationProbability: 0,
        incomplete: false,
      },
      {
        date: '2026-10-31',
        minTemperatureC: 23.8,
        maxTemperatureC: 28.7,
        weatherCode: 61,
        precipitationProbability: 65,
        incomplete: false,
      },
      {
        date: '2026-11-01',
        minTemperatureC: 24.5,
        maxTemperatureC: 29.4,
        weatherCode: 3,
        precipitationProbability: 5,
        incomplete: false,
      },
      {
        date: '2026-11-02',
        minTemperatureC: 24.2,
        maxTemperatureC: 30.6,
        weatherCode: 1,
        precipitationProbability: 20,
        incomplete: false,
      },
    ],
    incomplete: false,
  },
};
