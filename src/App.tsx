import { useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import UnitToggle from './components/UnitToggle';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import { useWeather } from './hooks/useWeather';
import type { Unit } from './types/weather';

export default function App() {
  const { status, data, error, search, retry } = useWeather();
  const [unit, setUnit] = useState<Unit>('celsius');

  return (
    <div className="min-h-screen bg-gradient-to-br from-night-900 via-night-800 to-night-900 font-sans text-white">
      <a
        href="#weather-content"
        className="sr-only rounded-xl bg-accent-500 p-3 text-night-900 focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10"
      >
        Ir para o conteúdo
      </a>
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
        <header className="grid min-w-0 items-center gap-4 lg:grid-cols-[auto_minmax(0,1fr)_auto]">
          <div>
            <p className="text-sm font-medium text-accent-400">SDD Weather App</p>
            <h1 className="text-3xl font-bold tracking-tight">WeatherView</h1>
          </div>
          <SearchBar onSearch={search} disabled={status === 'loading'} />
          <div className="justify-self-start lg:justify-self-end">
            <UnitToggle unit={unit} onChange={setUnit} />
          </div>
        </header>

        <main
          id="weather-content"
          tabIndex={-1}
          aria-label="Condições meteorológicas"
          aria-live="polite"
          aria-busy={status === 'loading'}
          className="min-w-0 flex-1 space-y-6 rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
        >
          {status === 'idle' && (
            <EmptyState
              title="Busque uma cidade para começar"
              hint="Consulte o clima atual e a previsão para os próximos cinco dias."
            />
          )}
          {status === 'loading' && <LoadingState message="Carregando o clima..." />}
          {status === 'empty' && <EmptyState />}
          {status === 'error' && error !== null && <ErrorState message={error} onRetry={retry} />}
          {status === 'success' && data !== null && (
            <>
              <CurrentWeather city={data.city} current={data.current} unit={unit} />
              <ForecastList forecast={data.forecast} unit={unit} />
            </>
          )}
        </main>

        <footer className="text-center text-sm text-slate-300">
          SDD Weather App · Dados meteorológicos: Open-Meteo
        </footer>
      </div>
    </div>
  );
}
