import { useId } from 'react';
import type { Forecast, Unit } from '../types/weather';
import ForecastCard from './ForecastCard';

interface ForecastListProps {
  forecast: Forecast;
  unit: Unit;
}

export default function ForecastList({ forecast, unit }: ForecastListProps) {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-glass backdrop-blur-md sm:p-8"
    >
      <h2 id={headingId} className="mb-6 text-2xl font-semibold">
        Previsão para 5 dias
      </h2>

      {forecast.incomplete && (
        <p role="status" className="mb-4 text-sm text-white/70">
          Previsão incompleta
        </p>
      )}

      {forecast.days.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {forecast.days.map((day) => (
            <ForecastCard key={day.date} day={day} unit={unit} />
          ))}
        </div>
      ) : (
        <p role="status" className="text-sm text-white/70">
          Previsão indisponível.
        </p>
      )}
    </section>
  );
}
