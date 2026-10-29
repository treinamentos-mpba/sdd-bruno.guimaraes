import { useCallback, useEffect, useRef, useState } from 'react';
import { getWeather, searchCities } from '../services/weatherService';
import type { City, WeatherData } from '../types/weather';

export type WeatherStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

interface WeatherState {
  status: WeatherStatus;
  data: WeatherData | null;
  cities: City[];
  error: string | null;
  query: string;
}

type Operation = { type: 'search'; name: string } | { type: 'select'; city: City };

export function useWeather() {
  const [state, setState] = useState<WeatherState>({
    status: 'idle',
    data: null,
    cities: [],
    error: null,
    query: '',
  });
  const lastOperation = useRef<Operation | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    return () => {
      requestId.current += 1;
    };
  }, []);

  const execute = useCallback(async (operation: Operation) => {
    lastOperation.current = operation;
    const id = ++requestId.current;

    setState((previous) => ({
      ...previous,
      status: 'loading',
      data: null,
      error: null,
      ...(operation.type === 'search' ? { query: operation.name, cities: [] } : {}),
    }));

    if (
      operation.type === 'search' &&
      (!operation.name || Array.from(operation.name).length > 100)
    ) {
      setState((previous) => ({
        ...previous,
        status: 'error',
        error: 'Informe o nome de uma cidade com 1 a 100 caracteres.',
      }));
      return;
    }

    try {
      let city: City;
      if (operation.type === 'search') {
        const cities = await searchCities(operation.name);
        if (id !== requestId.current) return;
        const firstCity = cities[0];
        if (!firstCity) {
          setState((previous) => ({ ...previous, status: 'empty', cities }));
          return;
        }
        setState((previous) => ({ ...previous, cities }));
        city = firstCity;
      } else {
        city = operation.city;
      }

      const data = await getWeather(city);
      if (id !== requestId.current) return;
      setState((previous) => ({ ...previous, status: 'success', data }));
    } catch (error) {
      if (id !== requestId.current) return;
      setState((previous) => ({
        ...previous,
        status: 'error',
        error:
          error instanceof Error
            ? error.message
            : 'Não foi possível consultar o clima. Tente novamente.',
      }));
    }
  }, []);

  const search = useCallback(
    (name: string) => execute({ type: 'search', name: name.trim().normalize('NFC') }),
    [execute],
  );
  const selectCity = useCallback((city: City) => execute({ type: 'select', city }), [execute]);
  const retry = useCallback(
    () => (lastOperation.current ? execute(lastOperation.current) : Promise.resolve()),
    [execute],
  );

  return { ...state, search, selectCity, retry };
}

export default useWeather;
