import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  fetchWithTimeout,
  getWeather,
  searchCities,
  WeatherServiceError,
} from '../../../src/services/weatherService';

const city = {
  id: 2267057,
  name: 'Lisboa',
  country: 'Portugal',
  admin1: 'Lisboa',
  latitude: 38.71667,
  longitude: -9.13333,
};

function mockResponse(payload: unknown, status = 200) {
  const response = new Response(JSON.stringify(payload), { status });
  const fetch = vi.fn().mockResolvedValue(response);
  vi.stubGlobal('fetch', fetch);
  return fetch;
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('fetchWithTimeout', () => {
  it('retorna a resposta original e limpa o timer no sucesso', async () => {
    vi.useFakeTimers();
    const clear = vi.spyOn(globalThis, 'clearTimeout');
    const response = new Response('{}');
    const fetch = vi.fn().mockResolvedValue(response);
    vi.stubGlobal('fetch', fetch);

    await expect(fetchWithTimeout('https://example.test')).resolves.toBe(response);
    expect(fetch).toHaveBeenCalledExactlyOnceWith('https://example.test', {
      signal: expect.any(AbortSignal),
    });
    const signal: AbortSignal = fetch.mock.calls[0][1].signal;
    expect(clear).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(signal.aborted).toBe(false);
  });

  it.each([
    [new DOMException('Aborted', 'AbortError'), 'timeout', 'A requisição demorou demais.'],
    [new TypeError('Failed to fetch'), 'network', 'Falha de rede.'],
  ])('normaliza %s e limpa o timer na falha', async (cause, kind, message) => {
    vi.useFakeTimers();
    const clear = vi.spyOn(globalThis, 'clearTimeout');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(cause));

    const request = fetchWithTimeout('https://example.test');
    await expect(request).rejects.toBeInstanceOf(WeatherServiceError);
    await expect(request).rejects.toMatchObject({ kind, message, cause });
    expect(clear).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([
    'helper',
    'search',
    'forecast',
  ])('aborta em exatamente 10 s, sem retry, no fluxo %s', async (operation) => {
    vi.useFakeTimers();
    const clear = vi.spyOn(globalThis, 'clearTimeout');
    let signal: AbortSignal | undefined;
    const fetch = vi.fn((_url: string, options: RequestInit) => {
      signal = options.signal ?? undefined;
      return new Promise<Response>((_resolve, reject) => {
        signal?.addEventListener(
          'abort',
          () => {
            reject(new DOMException('Aborted', 'AbortError'));
          },
          { once: true },
        );
      });
    });
    vi.stubGlobal('fetch', fetch);
    const request =
      operation === 'search'
        ? searchCities('Lisboa')
        : operation === 'forecast'
          ? getWeather(city)
          : fetchWithTimeout('https://example.test');
    const rejection = expect(request).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'timeout',
      message: 'A requisição demorou demais.',
    });

    await vi.advanceTimersByTimeAsync(9_999);
    expect(signal?.aborted).toBe(false);
    expect(clear).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    await rejection;
    expect(signal?.aborted).toBe(true);
    expect(clear).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

function forecastResponse() {
  return {
    timezone: 'Europe/Lisbon',
    current: {
      time: '2026-10-29T15:00',
      temperature_2m: 21.4,
      relative_humidity_2m: 58,
      apparent_temperature: 21.03,
      wind_speed_10m: 12.6,
      weather_code: 2,
    },
    daily: {
      time: ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'],
      temperature_2m_min: [15.2, 14.8, 15, 14.1, 13.9],
      temperature_2m_max: [22.1, 21.7, 20.8, 19.9, 20.3],
      weather_code: [2, 3, 61, 2, 1],
      precipitation_probability_max: [0, 10, 65, 20, 5],
    },
  };
}

describe('getWeather', () => {
  it('consulta as coordenadas selecionadas com current, daily e unidades de origem', async () => {
    const fetch = mockResponse(forecastResponse());
    await getWeather(city);
    expect(fetch).toHaveBeenCalledTimes(1);
    const url = new URL(fetch.mock.calls[0][0]);
    expect(url.origin + url.pathname).toBe('https://api.open-meteo.com/v1/forecast');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      latitude: String(city.latitude),
      longitude: String(city.longitude),
      current:
        'temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code',
      daily: 'temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max',
      temperature_unit: 'celsius',
      wind_speed_unit: 'kmh',
      timezone: 'auto',
      forecast_days: '5',
    });
  });

  it('mapeia current e os cinco índices de daily sem arredondar ou mutar', async () => {
    const payload = forecastResponse();
    const original = structuredClone(payload);
    mockResponse(payload);
    const data = await getWeather(city);
    expect(data.city).toBe(city);
    expect(data.current).toEqual({
      observedAt: payload.current.time,
      temperatureC: 21.4,
      apparentTemperatureC: 21.03,
      relativeHumidity: 58,
      windSpeedKmh: 12.6,
      weatherCode: 2,
    });
    expect(data.forecast.timezone).toBe('Europe/Lisbon');
    expect(data.forecast.incomplete).toBe(false);
    expect(data.forecast.days).toHaveLength(5);
    payload.daily.time.forEach((date, index) => {
      expect(data.forecast.days[index]).toEqual({
        date,
        minTemperatureC: payload.daily.temperature_2m_min[index],
        maxTemperatureC: payload.daily.temperature_2m_max[index],
        weatherCode: payload.daily.weather_code[index],
        precipitationProbability: payload.daily.precipitation_probability_max[index],
        incomplete: false,
      });
    });
    expect(payload).toEqual(original);
  });

  it('ordena datas preservando os índices paralelos e limita a cinco itens', async () => {
    const payload = forecastResponse();
    payload.daily.time.reverse();
    payload.daily.time.push('2026-11-03');
    mockResponse(payload);
    const data = await getWeather(city);
    expect(data.forecast.days).toHaveLength(5);
    expect(data.forecast.days[0]).toMatchObject({
      date: '2026-10-29',
      minTemperatureC: 13.9,
      maxTemperatureC: 20.3,
      weatherCode: 1,
    });
  });

  it('usa null para complementos atuais inválidos e não inventa probabilidade', async () => {
    const payload = forecastResponse();
    mockResponse({
      ...payload,
      current: {
        ...payload.current,
        apparent_temperature: null,
        relative_humidity_2m: 101,
        wind_speed_10m: -1,
      },
      daily: { ...payload.daily, precipitation_probability_max: [null, 101, -1] },
    });
    const data = await getWeather(city);
    expect(data.current).toMatchObject({
      apparentTemperatureC: null,
      relativeHumidity: null,
      windSpeedKmh: null,
    });
    expect(data.forecast.days.every((day) => day.precipitationProbability === null)).toBe(true);
    expect(data.forecast.incomplete).toBe(false);
  });

  it('marca campos diários ausentes e mínima maior que máxima como incompletos', async () => {
    const payload = forecastResponse();
    mockResponse({
      ...payload,
      daily: {
        ...payload.daily,
        temperature_2m_min: [50, null],
        weather_code: [999],
      },
    });
    const data = await getWeather(city);
    expect(data.forecast.days).toHaveLength(5);
    expect(data.forecast.days[0]).toMatchObject({
      minTemperatureC: null,
      maxTemperatureC: null,
      weatherCode: 999,
      incomplete: true,
    });
    expect(data.forecast.days[1]).toMatchObject({
      minTemperatureC: null,
      weatherCode: null,
      incomplete: true,
    });
    expect(data.forecast.incomplete).toBe(true);
  });

  it.each([
    {},
    { current: {} },
    { daily: {} },
    { ...forecastResponse(), current: null },
    { ...forecastResponse(), daily: null },
    { ...forecastResponse(), timezone: 'Invalid/Timezone' },
    { ...forecastResponse(), current: { time: '2026-10-29T15:00', weather_code: 2 } },
    { ...forecastResponse(), current: { ...forecastResponse().current, weather_code: null } },
    { ...forecastResponse(), current: { ...forecastResponse().current, time: '2026-02-30T25:00' } },
    { ...forecastResponse(), daily: { time: [] } },
    { ...forecastResponse(), daily: { time: ['2026-10-29'] } },
    {
      ...forecastResponse(),
      daily: { time: ['2026-10-29', '2026-10-29', '2026-10-31', '2026-11-01', '2026-11-02'] },
    },
    {
      ...forecastResponse(),
      daily: { time: ['invalid', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'] },
    },
    { error: true, reason: 'Invalid parameter' },
    null,
  ])('lança erro tipado para resposta incompleta ou inválida: %j', async (payload) => {
    mockResponse(payload);
    const request = getWeather(city);
    await expect(request).rejects.toBeInstanceOf(WeatherServiceError);
    await expect(request).rejects.toMatchObject({ kind: 'invalid-response' });
  });

  it.each([400, 429, 500])('trata HTTP %s sem tentar mapear dados', async (status) => {
    mockResponse({}, status);
    await expect(getWeather(city)).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: status === 429 ? 'rate-limit' : 'http',
      status,
    });
  });

  it('normaliza falhas de rede e de JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));
    await expect(getWeather(city)).rejects.toMatchObject({ kind: 'network' });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('invalid')));
    await expect(getWeather(city)).rejects.toMatchObject({ kind: 'invalid-response' });
  });

  it('rejeita coordenadas inválidas antes de chamar a rede', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    await expect(getWeather({ ...city, latitude: Number.NaN })).rejects.toBeInstanceOf(
      WeatherServiceError,
    );
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('searchCities', () => {
  it.each(['', ' ', '\t\n\u00a0'])('retorna vazio sem rede para %j', async (name) => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    await expect(searchCities(name)).resolves.toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('codifica o termo normalizado e envia os parâmetros de geocoding', async () => {
    const fetch = mockResponse({ results: [city] });
    await searchCities('  Sa\u0303o Paulo & 東京/北?  ');
    expect(fetch).toHaveBeenCalledExactlyOnceWith(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent('São Paulo & 東京/北?')}&count=10&language=pt&format=json`,
      { signal: expect.any(AbortSignal) },
    );
  });

  it('mapeia apenas campos de City, preservando identidade, coordenadas e ordem', async () => {
    const second = { ...city, id: 2, name: 'Outra cidade' };
    const { admin1: _admin1, ...withoutRegion } = second;
    mockResponse({
      results: [{ ...city, population: 1000, country_code: 'PT' }, withoutRegion],
    });

    await expect(searchCities('Lisboa')).resolves.toEqual([city, withoutRegion]);
  });

  it('limita a dez cidades na ordem recebida', async () => {
    const cities = Array.from({ length: 12 }, (_, id) => ({ ...city, id }));
    mockResponse({ results: cities });
    await expect(searchCities('Lisboa')).resolves.toEqual(cities.slice(0, 10));
  });

  it.each([
    {},
    { generationtime_ms: 0.1 },
    { results: [] },
  ])('retorna vazio para resposta válida sem resultados: %j', async (payload) => {
    mockResponse(payload);
    await expect(searchCities('Inexistente')).resolves.toEqual([]);
  });

  it.each([400, 429, 500, 503])('lança erro tipado em HTTP %s sem ler JSON', async (status) => {
    const json = vi.fn();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status, json }));
    const request = searchCities('Lisboa');
    await expect(request).rejects.toBeInstanceOf(WeatherServiceError);
    await expect(request).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: status === 429 ? 'rate-limit' : 'http',
      status,
    });
    expect(json).not.toHaveBeenCalled();
  });

  it('distingue falha de rede de busca vazia e preserva a causa', async () => {
    const cause = new TypeError('Failed to fetch');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(cause));
    await expect(searchCities('Lisboa')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'network',
      cause,
    });
  });

  it('rejeita JSON inválido com erro tipado', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('not json')));
    await expect(searchCities('Lisboa')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'invalid-response',
    });
  });

  it.each([
    null,
    [],
    { error: true, reason: 'Invalid parameter' },
    { results: null },
    { results: {} },
    { results: [null] },
    { results: [{ ...city, id: '2267057' }] },
    { results: [{ ...city, name: '' }] },
    { results: [{ ...city, country: undefined }] },
    { results: [{ ...city, latitude: 91 }] },
    { results: [{ ...city, longitude: -181 }] },
    { results: [{ ...city, admin1: 123 }] },
  ])('rejeita payload malformado sem confundir com vazio: %j', async (payload) => {
    mockResponse(payload);
    await expect(searchCities('Lisboa')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'invalid-response',
    });
  });
});
