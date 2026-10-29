import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useWeather } from '../../../src/hooks/useWeather';
import { mockWeatherData } from '../../../src/mocks/weather';
import {
  getWeather,
  searchCities,
  WeatherServiceError,
} from '../../../src/services/weatherService';
import type { City, WeatherData } from '../../../src/types/weather';

vi.mock('../../../src/services/weatherService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../src/services/weatherService')>()),
  searchCities: vi.fn(),
  getWeather: vi.fn(),
}));

const city = mockWeatherData.city;
const otherCity: City = { ...city, id: 2, name: 'Lisboa', latitude: 38.72, longitude: -9.14 };
const otherWeather: WeatherData = { ...mockWeatherData, city: otherCity };

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(searchCities).mockResolvedValue([city, otherCity]);
  vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
});

afterEach(cleanup);

describe('useWeather', () => {
  it('inicia idle e não consulta serviços, mesmo com retry sem operação anterior', async () => {
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.retry());
    expect(result.current).toMatchObject({
      status: 'idle',
      data: null,
      cities: [],
      error: null,
      query: '',
    });
    expect(searchCities).not.toHaveBeenCalled();
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('normaliza a busca, mantém loading nas duas etapas e carrega a primeira cidade', async () => {
    const cities = deferred<City[]>();
    const weather = deferred<WeatherData>();
    vi.mocked(searchCities).mockReturnValueOnce(cities.promise);
    vi.mocked(getWeather).mockReturnValueOnce(weather.promise);
    const { result } = renderHook(() => useWeather());
    let operation!: Promise<void>;
    act(() => {
      operation = result.current.search('  Sa\u0303o Paulo  ');
    });
    expect(result.current).toMatchObject({ status: 'loading', query: 'São Paulo', error: null });
    expect(searchCities).toHaveBeenCalledWith('São Paulo');
    expect(getWeather).not.toHaveBeenCalled();

    await act(async () => cities.resolve([city, otherCity]));
    expect(result.current).toMatchObject({ status: 'loading', cities: [city, otherCity] });
    expect(getWeather).toHaveBeenCalledExactlyOnceWith(city);
    await act(async () => {
      weather.resolve(mockWeatherData);
      await operation;
    });
    expect(result.current).toMatchObject({ status: 'success', data: mockWeatherData, error: null });
  });

  it('mostra empty somente para busca sem resultados e remove dados antigos', async () => {
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search('Salvador'));
    vi.mocked(searchCities).mockResolvedValueOnce([]);
    await act(() => result.current.search('Inexistente'));
    expect(result.current).toMatchObject({
      status: 'empty',
      query: 'Inexistente',
      cities: [],
      data: null,
      error: null,
    });
    expect(getWeather).toHaveBeenCalledTimes(1);
  });

  it.each([
    '   ',
    'a'.repeat(101),
  ])('não consulta serviços com termo inválido: %j', async (term) => {
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search(term));
    expect(result.current.status).toBe('error');
    expect(result.current.error).toContain('1 a 100');
    expect(searchCities).not.toHaveBeenCalled();
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('conta pontos de código Unicode em vez de unidades UTF-16', async () => {
    const { result } = renderHook(() => useWeather());
    const term = '𠮷'.repeat(100);
    await act(() => result.current.search(term));
    expect(searchCities).toHaveBeenCalledWith(term);
    expect(result.current.status).toBe('success');
  });

  it('expõe falha de busca e retry repete a busca normalizada', async () => {
    vi.mocked(searchCities).mockRejectedValueOnce(
      new WeatherServiceError('Falha de rede.', 'network'),
    );
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search(' Salvador '));
    expect(result.current).toMatchObject({ status: 'error', error: 'Falha de rede.', data: null });
    expect(getWeather).not.toHaveBeenCalled();
    await act(() => result.current.retry());
    expect(searchCities).toHaveBeenNthCalledWith(2, 'Salvador');
    expect(result.current).toMatchObject({ status: 'success', error: null, data: mockWeatherData });
  });

  it('retry de busca com falha meteorológica repete a ação completa', async () => {
    vi.mocked(getWeather).mockRejectedValueOnce(
      new WeatherServiceError('A requisição demorou demais.', 'timeout'),
    );
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search('Salvador'));
    expect(result.current).toMatchObject({
      status: 'error',
      error: 'A requisição demorou demais.',
      cities: [city, otherCity],
      data: null,
    });
    await act(() => result.current.retry());
    expect(searchCities).toHaveBeenCalledTimes(2);
    expect(getWeather).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe('success');
  });

  it('seleciona pela identidade, limpa dados e erro e retry não repete geocoding', async () => {
    const weather = deferred<WeatherData>();
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search('Salvador'));
    vi.mocked(getWeather).mockReturnValueOnce(weather.promise).mockResolvedValueOnce(otherWeather);
    let operation!: Promise<void>;
    act(() => {
      operation = result.current.selectCity(otherCity);
    });
    expect(result.current).toMatchObject({
      status: 'loading',
      data: null,
      error: null,
      query: 'Salvador',
      cities: [city, otherCity],
    });
    await act(async () => {
      weather.reject(new WeatherServiceError('Limite de consultas atingido.', 'rate-limit'));
      await operation;
    });
    expect(result.current.status).toBe('error');
    await act(() => result.current.retry());
    expect(getWeather).toHaveBeenNthCalledWith(2, otherCity);
    expect(getWeather).toHaveBeenNthCalledWith(3, otherCity);
    expect(searchCities).toHaveBeenCalledTimes(1);
    expect(result.current).toMatchObject({ status: 'success', error: null, data: otherWeather });
  });

  it.each(['resolve', 'reject'] as const)('descarta busca obsoleta: %s', async (outcome) => {
    const stale = deferred<City[]>();
    vi.mocked(searchCities).mockReturnValueOnce(stale.promise);
    const { result } = renderHook(() => useWeather());
    let operation!: Promise<void>;
    act(() => {
      operation = result.current.search('Antiga');
    });
    await act(() => result.current.search('Atual'));
    await act(async () => {
      if (outcome === 'resolve') stale.resolve([otherCity]);
      else stale.reject(new Error('Erro antigo'));
      await operation;
    });
    expect(result.current).toMatchObject({
      status: 'success',
      query: 'Atual',
      data: mockWeatherData,
    });
    expect(getWeather).toHaveBeenCalledTimes(1);
  });

  it.each([
    'resolve',
    'reject',
  ] as const)('descarta clima obsoleto entre ações: %s', async (outcome) => {
    const stale = deferred<WeatherData>();
    vi.mocked(getWeather).mockReturnValueOnce(stale.promise);
    const { result } = renderHook(() => useWeather());
    let operation!: Promise<void>;
    act(() => {
      operation = result.current.selectCity(otherCity);
    });
    await act(() => result.current.search('Salvador'));
    await act(async () => {
      if (outcome === 'resolve') stale.resolve(otherWeather);
      else stale.reject(new Error('Erro antigo'));
      await operation;
    });
    expect(result.current).toMatchObject({ status: 'success', data: mockWeatherData });
    await act(() => result.current.retry());
    expect(searchCities).toHaveBeenCalledTimes(2);
  });

  it('descarta resposta anterior da mesma cidade', async () => {
    const stale = deferred<WeatherData>();
    vi.mocked(getWeather).mockReturnValueOnce(stale.promise);
    const { result } = renderHook(() => useWeather());
    let operation!: Promise<void>;
    act(() => {
      operation = result.current.selectCity(city);
    });
    await act(() => result.current.selectCity(city));
    await act(async () => {
      stale.resolve({
        ...mockWeatherData,
        current: { ...mockWeatherData.current, temperatureC: -10 },
      });
      await operation;
    });
    expect(result.current.data).toEqual(mockWeatherData);
  });

  it('não inicia clima se a busca concluir após desmontagem', async () => {
    const cities = deferred<City[]>();
    vi.mocked(searchCities).mockReturnValueOnce(cities.promise);
    const { result, unmount } = renderHook(() => useWeather());
    let operation!: Promise<void>;
    act(() => {
      operation = result.current.search('Salvador');
    });
    unmount();
    await act(async () => {
      cities.resolve([city]);
      await operation;
    });
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('expõe mensagem recuperável para rejeição sem Error', async () => {
    vi.mocked(searchCities).mockRejectedValueOnce(null);
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search('Salvador'));
    expect(result.current).toMatchObject({
      status: 'error',
      error: 'Não foi possível consultar o clima. Tente novamente.',
    });
  });
});
