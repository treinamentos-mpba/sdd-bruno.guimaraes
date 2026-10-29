import { useId } from 'react';
import { formatTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCodes';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData;
  unit: Unit;
}

function formatMetric(value: number | null | undefined, unit: string, fractionDigits = 0) {
  if (value == null || !Number.isFinite(value) || value < 0) return '—';
  return `${value.toLocaleString('pt-BR', {
    maximumFractionDigits: fractionDigits,
  })} ${unit}`;
}

export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const headingId = useId();
  const condition = getWeatherCondition(current.weatherCode);
  const metrics = [
    {
      label: 'Umidade',
      value: formatMetric(
        current.relativeHumidity !== null && current.relativeHumidity <= 100
          ? current.relativeHumidity
          : null,
        '%',
      ),
    },
    { label: 'Vento', value: formatMetric(current.windSpeedKmh, 'km/h') },
    { label: 'Precipitação', value: formatMetric(current.precipitationMm, 'mm', 1) },
    { label: 'Pressão', value: formatMetric(current.pressureHpa, 'hPa') },
  ];

  return (
    <section
      aria-labelledby={headingId}
      className="rounded-3xl border border-white/10 bg-white/5 p-6 font-sans text-white shadow-glass backdrop-blur-md sm:p-8"
    >
      <header>
        <p className="text-sm text-white/70">Clima atual</p>
        <h2 id={headingId} className="break-words text-2xl font-semibold sm:text-3xl">
          {[city.name, city.admin1, city.country].filter(Boolean).join(', ')}
        </h2>
        <p className="mt-1 text-sm text-white/70">
          Horário de referência:{' '}
          <time dateTime={current.observedAt}>{current.observedAt.slice(11, 16)}</time>
        </p>
      </header>

      <div className="my-8 flex flex-wrap items-center gap-6">
        <span aria-hidden="true" className="text-6xl text-sun sm:text-8xl">
          {condition.icon}
        </span>
        <div>
          <p className="text-6xl font-semibold tracking-tight sm:text-8xl">
            {formatTemperature(current.temperatureC, unit)}
          </p>
          <p className="mt-2 text-lg">{condition.description}</p>
          <p className="mt-1 text-sm text-white/70">
            Sensação térmica: {formatTemperature(current.apparentTemperatureC, unit)}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6 sm:grid-cols-4">
        {metrics.map(({ label, value }) => (
          <div key={label}>
            <dt className="text-sm text-white/70">{label}</dt>
            <dd className="mt-1 text-lg font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
