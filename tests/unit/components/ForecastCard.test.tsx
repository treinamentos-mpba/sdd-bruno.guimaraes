import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import ForecastCard from '../../../src/components/ForecastCard';
import { mockWeatherData } from '../../../src/mocks/weather';

afterEach(cleanup);

const day = mockWeatherData.forecast.days[0];

describe('ForecastCard', () => {
  it('exibe rótulo do dia, data, condição, temperaturas e probabilidade de chuva', () => {
    render(<ForecastCard day={{ ...day, precipitationProbability: 65 }} unit="celsius" />);

    const card = screen.getByRole('article', { name: 'quinta-feira' });
    expect(within(card).getByText('29/10/2026')).toBeInTheDocument();
    expect(within(card).getByText('Parcialmente nublado')).toBeInTheDocument();
    expect(within(card).getByText('Máx.').nextElementSibling).toHaveTextContent('30 °C');
    expect(within(card).getByText('Mín.').nextElementSibling).toHaveTextContent('24 °C');
    expect(within(card).getByText('Chuva').nextElementSibling).toHaveTextContent('65%');
  });

  it('mostra valores ausentes e identifica dados incompletos', () => {
    render(
      <ForecastCard
        day={{
          ...day,
          maxTemperatureC: null,
          minTemperatureC: null,
          precipitationProbability: null,
          weatherCode: null,
          incomplete: true,
        }}
        unit="fahrenheit"
      />,
    );

    expect(screen.getByText('Máx.').nextElementSibling).toHaveTextContent('—');
    expect(screen.getByText('Mín.').nextElementSibling).toHaveTextContent('—');
    expect(screen.getByText('Chuva').nextElementSibling).toHaveTextContent('—');
    expect(screen.getByText('Condição indisponível')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Dados incompletos');
  });
});
