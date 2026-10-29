import type { City, ForecastDay, WeatherData, WeatherErrorKind } from '../types/weather';

export class WeatherServiceError extends Error {
  constructor(
    message: string,
    public readonly kind: WeatherErrorKind = 'http',
    public readonly status?: number,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'WeatherServiceError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function invalidResponse() {
  return new WeatherServiceError(
    'O serviço de busca retornou uma resposta inválida.',
    'invalid-response',
  );
}

function mapCity(value: unknown): City {
  if (
    !isRecord(value) ||
    typeof value.id !== 'number' ||
    !Number.isInteger(value.id) ||
    typeof value.name !== 'string' ||
    !value.name.trim() ||
    typeof value.country !== 'string' ||
    !value.country.trim() ||
    typeof value.latitude !== 'number' ||
    !Number.isFinite(value.latitude) ||
    Math.abs(value.latitude) > 90 ||
    typeof value.longitude !== 'number' ||
    !Number.isFinite(value.longitude) ||
    Math.abs(value.longitude) > 180 ||
    (value.admin1 !== undefined && typeof value.admin1 !== 'string')
  ) {
    throw invalidResponse();
  }

  return {
    id: value.id,
    name: value.name,
    country: value.country,
    latitude: value.latitude,
    longitude: value.longitude,
    ...(value.admin1 === undefined ? {} : { admin1: value.admin1 }),
  };
}

export async function searchCities(name: string): Promise<City[]> {
  const term = name.trim().normalize('NFC');
  if (!term) return [];

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(term)}&count=10&language=pt&format=json`;
  const payload = await requestJson(url, 'busca');
  if (!isRecord(payload) || ('error' in payload && payload.error !== false)) {
    throw invalidResponse();
  }
  if (payload.results === undefined) return [];
  if (!Array.isArray(payload.results)) throw invalidResponse();

  return payload.results.map(mapCity).slice(0, 10);
}

export async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    return await fetch(url, { signal: controller.signal });
  } catch (cause) {
    const aborted = isRecord(cause) && cause.name === 'AbortError';
    throw new WeatherServiceError(
      aborted ? 'A requisição demorou demais.' : 'Falha de rede.',
      aborted ? 'timeout' : 'network',
      undefined,
      { cause },
    );
  } finally {
    clearTimeout(timeout);
  }
}

async function requestJson(url: string, service: string): Promise<unknown> {
  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new WeatherServiceError(
      response.status === 429
        ? 'Limite de consultas atingido. Tente novamente mais tarde.'
        : `Não foi possível consultar o serviço de ${service}. Tente novamente.`,
      response.status === 429 ? 'rate-limit' : 'http',
      response.status,
    );
  }

  try {
    return await response.json();
  } catch (cause) {
    throw new WeatherServiceError(
      `O serviço de ${service} retornou uma resposta inválida.`,
      'invalid-response',
      undefined,
      { cause },
    );
  }
}

function incompleteWeather() {
  return new WeatherServiceError(
    'O serviço de previsão retornou uma resposta incompleta ou inválida.',
    'invalid-response',
  );
}

function finiteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function boundedNumber(value: unknown, min: number, max = Number.POSITIVE_INFINITY) {
  const number = finiteNumber(value);
  return number !== null && number >= min && number <= max ? number : null;
}

function weatherCode(value: unknown) {
  const number = boundedNumber(value, 0);
  return number !== null && Number.isInteger(number) ? number : null;
}

function localDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function mapForecast(daily: Record<string, unknown>): ForecastDay[] {
  if (!Array.isArray(daily.time) || daily.time.length < 5) throw incompleteWeather();
  function valueAt(key: string, index: number): unknown {
    const values = daily[key];
    return Array.isArray(values) ? values[index] : undefined;
  }

  const days = daily.time
    .map((date, index): ForecastDay => {
      if (!localDate(date)) throw incompleteWeather();
      let min = finiteNumber(valueAt('temperature_2m_min', index));
      let max = finiteNumber(valueAt('temperature_2m_max', index));
      if (min !== null && max !== null && min > max) {
        min = null;
        max = null;
      }
      const code = weatherCode(valueAt('weather_code', index));
      return {
        date,
        minTemperatureC: min,
        maxTemperatureC: max,
        weatherCode: code,
        precipitationProbability: boundedNumber(
          valueAt('precipitation_probability_max', index),
          0,
          100,
        ),
        incomplete: min === null || max === null || code === null,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  for (let index = 1; index < days.length; index += 1) {
    const previous = Date.parse(`${days[index - 1].date}T00:00:00Z`);
    if (Date.parse(`${days[index].date}T00:00:00Z`) - previous !== 86_400_000) {
      throw incompleteWeather();
    }
  }
  return days;
}

export async function getWeather(city: City): Promise<WeatherData> {
  if (
    boundedNumber(city.latitude, -90, 90) === null ||
    boundedNumber(city.longitude, -180, 180) === null
  ) {
    throw new WeatherServiceError('As coordenadas da cidade são inválidas.', 'invalid-response');
  }

  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.search = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code',
    daily: 'temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    timezone: 'auto',
    forecast_days: '5',
  }).toString();
  const payload = await requestJson(url.toString(), 'previsão');
  if (
    !isRecord(payload) ||
    ('error' in payload && payload.error !== false) ||
    !isRecord(payload.current) ||
    !isRecord(payload.daily) ||
    typeof payload.timezone !== 'string'
  ) {
    throw incompleteWeather();
  }
  try {
    new Intl.DateTimeFormat('pt-BR', { timeZone: payload.timezone });
  } catch (error) {
    if (error instanceof RangeError) throw incompleteWeather();
    throw error;
  }

  const current = payload.current;
  const temperature = finiteNumber(current.temperature_2m);
  const code = weatherCode(current.weather_code);
  if (
    temperature === null ||
    code === null ||
    typeof current.time !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/.test(current.time) ||
    !localDate(current.time.slice(0, 10)) ||
    Number(current.time.slice(11, 13)) > 23 ||
    Number(current.time.slice(14, 16)) > 59 ||
    Number(current.time.slice(17, 19)) > 59
  ) {
    throw incompleteWeather();
  }
  const days = mapForecast(payload.daily);
  return {
    city,
    current: {
      observedAt: current.time,
      temperatureC: temperature,
      apparentTemperatureC: finiteNumber(current.apparent_temperature),
      relativeHumidity: boundedNumber(current.relative_humidity_2m, 0, 100),
      windSpeedKmh: boundedNumber(current.wind_speed_10m, 0),
      weatherCode: code,
    },
    forecast: {
      timezone: payload.timezone,
      days,
      incomplete: days.some((day) => day.incomplete),
    },
  };
}
