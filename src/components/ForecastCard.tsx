import { useId } from 'react';
import { formatDate, formatDayLabel, formatPrecipitationProbability } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCodes';
import type { ForecastDay, Unit } from '../types/weather';

interface ForecastCardProps {
  day: ForecastDay;
  unit: Unit;
}

export default function ForecastCard({ day, unit }: ForecastCardProps) {
  const headingId = useId();
  const condition = getWeatherCondition(day.weatherCode ?? -1);
  const incomplete =
    day.incomplete ||
    day.minTemperatureC === null ||
    day.maxTemperatureC === null ||
    day.weatherCode === null;

  return (
    <article
      aria-labelledby={headingId}
      className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white shadow-glass backdrop-blur-md"
    >
      <header className="text-center">
        <h3 id={headingId} className="font-semibold capitalize">
          {formatDayLabel(day.date)}
        </h3>
        <time dateTime={day.date} className="mt-1 block text-sm text-white/70">
          {formatDate(day.date)}
        </time>
      </header>

      <div className="my-4 text-center">
        <span aria-hidden="true" className="text-4xl">
          {condition.icon}
        </span>
        <p className="mt-2 text-sm">{condition.description}</p>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 text-center">
        <div>
          <dt className="text-xs text-white/70">Máx.</dt>
          <dd className="mt-1 font-semibold">{formatTemperature(day.maxTemperatureC, unit)}</dd>
        </div>
        <div>
          <dt className="text-xs text-white/70">Mín.</dt>
          <dd className="mt-1 font-semibold">{formatTemperature(day.minTemperatureC, unit)}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs text-white/70">Chuva</dt>
          <dd className="mt-1 font-semibold">
            {formatPrecipitationProbability(day.precipitationProbability)}
          </dd>
        </div>
      </dl>

      {incomplete && (
        <p role="status" className="mt-3 text-center text-xs text-white/70">
          Dados incompletos
        </p>
      )}
    </article>
  );
}
