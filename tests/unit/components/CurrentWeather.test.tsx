import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import CurrentWeather from '../../../src/components/CurrentWeather';
import UnitToggle from '../../../src/components/UnitToggle';
import { mockWeatherData } from '../../../src/mocks/weather';
import type { Unit } from '../../../src/types/weather';

afterEach(cleanup);

const { city, current } = mockWeatherData;

function metricValue(label: string) {
  return screen.getByText(label, { selector: 'dt' }).nextElementSibling;
}

describe('CurrentWeather', () => {
  it('exibe 32 °F ao selecionar Fahrenheit no UnitToggle com temperatura de 0 °C', async () => {
    const user = userEvent.setup();

    function WeatherWithUnitToggle() {
      const [unit, setUnit] = useState<Unit>('celsius');

      return (
        <>
          <UnitToggle unit={unit} onChange={setUnit} />
          <CurrentWeather city={city} current={{ ...current, temperatureC: 0 }} unit={unit} />
        </>
      );
    }

    render(<WeatherWithUnitToggle />);
    const weather = within(screen.getByRole('region', { name: 'Salvador, Bahia, Brasil' }));
    expect(weather.getByText('0 °C', { exact: true })).toBeVisible();

    await user.click(screen.getByRole('button', { name: '°F' }));

    expect(weather.getByText('32 °F', { exact: true })).toBeVisible();
    expect(weather.queryByText('0 °C', { exact: true })).not.toBeInTheDocument();
  });

  it('exibe cidade, condição, horário e todas as métricas com unidades', () => {
    render(
      <CurrentWeather
        city={city}
        current={{ ...current, precipitationMm: 1.2, pressureHpa: 1013 }}
        unit="celsius"
      />,
    );

    const region = screen.getByRole('region', { name: 'Salvador, Bahia, Brasil' });
    expect(within(region).getByRole('heading', { level: 2 })).toHaveTextContent(
      'Salvador, Bahia, Brasil',
    );
    expect(within(region).getByText('29 °C')).toBeInTheDocument();
    expect(within(region).getByText('Parcialmente nublado')).toBeInTheDocument();
    expect(within(region).getByText('Sensação térmica: 31 °C')).toBeInTheDocument();
    expect(within(region).getByText('15:00')).toHaveAttribute('datetime', current.observedAt);
    expect(metricValue('Umidade')).toHaveTextContent('74 %');
    expect(metricValue('Vento')).toHaveTextContent('18 km/h');
    expect(metricValue('Precipitação')).toHaveTextContent('1,2 mm');
    expect(metricValue('Pressão')).toHaveTextContent('1.013 hPa');
  });

  it('alterna unidades a partir do valor original sem alterar outras métricas', () => {
    const { rerender } = render(<CurrentWeather city={city} current={current} unit="celsius" />);

    for (let index = 0; index < 3; index += 1) {
      rerender(<CurrentWeather city={city} current={current} unit="fahrenheit" />);
      expect(screen.getByText('83 °F')).toBeInTheDocument();
      expect(screen.getByText('Sensação térmica: 88 °F')).toBeInTheDocument();
      expect(metricValue('Vento')).toHaveTextContent('18 km/h');

      rerender(<CurrentWeather city={city} current={current} unit="celsius" />);
      expect(screen.getByText('29 °C')).toBeInTheDocument();
    }

    expect(current.temperatureC).toBe(28.6);
  });

  it('mantém rótulos e indica ausência de complementares e condição desconhecida', () => {
    render(
      <CurrentWeather
        city={{ ...city, admin1: undefined }}
        current={{
          ...current,
          apparentTemperatureC: null,
          relativeHumidity: null,
          windSpeedKmh: null,
          precipitationMm: null,
          pressureHpa: null,
          weatherCode: 999,
        }}
        unit="fahrenheit"
      />,
    );

    expect(screen.getByRole('region', { name: 'Salvador, Brasil' })).toBeInTheDocument();
    expect(screen.getByText('Condição indisponível')).toBeInTheDocument();
    expect(screen.getByText('Sensação térmica: —')).toBeInTheDocument();
    for (const label of ['Umidade', 'Vento', 'Precipitação', 'Pressão']) {
      expect(metricValue(label)).toHaveTextContent('—');
    }
  });

  it('aceita produtores existentes sem precipitação e pressão', () => {
    render(<CurrentWeather city={city} current={current} unit="celsius" />);
    expect(metricValue('Precipitação')).toHaveTextContent('—');
    expect(metricValue('Pressão')).toHaveTextContent('—');
  });

  it('preserva métricas iguais a zero e rejeita complementares inválidos', () => {
    const { rerender } = render(
      <CurrentWeather
        city={city}
        current={{ ...current, relativeHumidity: 0, windSpeedKmh: 0, precipitationMm: 0 }}
        unit="celsius"
      />,
    );
    expect(metricValue('Umidade')).toHaveTextContent('0 %');
    expect(metricValue('Vento')).toHaveTextContent('0 km/h');
    expect(metricValue('Precipitação')).toHaveTextContent('0 mm');

    rerender(
      <CurrentWeather
        city={city}
        current={{
          ...current,
          relativeHumidity: 101,
          windSpeedKmh: -1,
          precipitationMm: Number.NaN,
          pressureHpa: Number.POSITIVE_INFINITY,
        }}
        unit="celsius"
      />,
    );
    for (const label of ['Umidade', 'Vento', 'Precipitação', 'Pressão']) {
      expect(metricValue(label)).toHaveTextContent('—');
    }
  });
});
