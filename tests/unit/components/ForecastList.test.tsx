import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import ForecastList from '../../../src/components/ForecastList';
import { mockWeatherData } from '../../../src/mocks/weather';

afterEach(cleanup);

describe('ForecastList', () => {
  it('renderiza os cartões de previsão na unidade selecionada', () => {
    render(<ForecastList forecast={mockWeatherData.forecast} unit="fahrenheit" />);

    const section = screen.getByRole('region', { name: 'Previsão para 5 dias' });
    expect(within(section).getAllByRole('article')).toHaveLength(5);
    expect(within(section).getByText('10%')).toBeInTheDocument();
    expect(within(section).getByText('84 °F')).toBeInTheDocument();
    expect(within(section).getAllByText(/°F/)).toHaveLength(10);
  });

  it('informa previsão incompleta e apresenta estado vazio', () => {
    render(
      <ForecastList
        forecast={{ ...mockWeatherData.forecast, days: [], incomplete: true }}
        unit="celsius"
      />,
    );

    const statuses = screen.getAllByRole('status');
    expect(statuses[0]).toHaveTextContent('Previsão incompleta');
    expect(statuses[1]).toHaveTextContent('Previsão indisponível.');
  });
});
