import { act, cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { formatTemperature } from '../../src/lib/temperature';
import { mockWeatherData } from '../../src/mocks/weather';
import { getWeather, searchCities } from '../../src/services/weatherService';
import type { City, Unit, WeatherData } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', () => ({
  searchCities: vi.fn(),
  getWeather: vi.fn(),
}));

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(searchCities).mockResolvedValue([mockWeatherData.city]);
  vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
});

afterEach(cleanup);

describe('App', () => {
  it('inicia com estrutura acessível, Celsius e orientação, sem consultas ou prévia', () => {
    render(<App />);

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'WeatherView' })).toBeInTheDocument();
    expect(screen.getByRole('search', { name: 'Buscar cidade' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '°C' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('main')).toHaveTextContent('Busque uma cidade para começar');
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Open-Meteo');
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    expect(searchCities).not.toHaveBeenCalled();
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('busca por Enter, exibe vazio e recupera com os dados retornados pelo serviço', async () => {
    const user = userEvent.setup();
    const city: City = { ...mockWeatherData.city, id: 2, name: 'Recife', admin1: 'Pernambuco' };
    vi.mocked(searchCities).mockResolvedValueOnce([]).mockResolvedValueOnce([city]);
    vi.mocked(getWeather).mockResolvedValueOnce({ ...mockWeatherData, city });
    render(<App />);
    const input = screen.getByRole('searchbox', { name: 'Cidade' });

    await user.type(input, 'Inexistente{Enter}');
    expect(await screen.findByText('Nenhuma cidade encontrada')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(getWeather).not.toHaveBeenCalled();

    await user.clear(input);
    await user.type(input, '  Recife  ');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(
      await screen.findByRole('region', { name: 'Recife, Pernambuco, Brasil' }),
    ).toBeInTheDocument();
    expect(searchCities).toHaveBeenLastCalledWith('Recife');
    expect(getWeather).toHaveBeenCalledExactlyOnceWith(city);
    expect(screen.getAllByRole('article')).toHaveLength(5);
  });

  it('mostra loading nas duas consultas, desabilita busca e remove dados anteriores', async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByRole('searchbox', { name: 'Cidade' });
    await user.type(input, 'Salvador{Enter}');
    await screen.findByRole('region', { name: 'Salvador, Bahia, Brasil' });

    let resolveCities!: (cities: City[]) => void;
    let resolveWeather!: (data: WeatherData) => void;
    vi.mocked(searchCities).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveCities = resolve;
      }),
    );
    vi.mocked(getWeather).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveWeather = resolve;
      }),
    );
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(screen.getByRole('status')).toHaveTextContent('Carregando o clima...');
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled();
    expect(input).toBeDisabled();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('region', { name: 'Salvador, Bahia, Brasil' }),
    ).not.toBeInTheDocument();

    await act(async () => resolveCities([mockWeatherData.city]));
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(getWeather).toHaveBeenCalledTimes(2);
    await user.click(screen.getByRole('button', { name: '°F' }));
    await act(async () => resolveWeather(mockWeatherData));
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'false');
    expect(input).toBeEnabled();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByText('83 °F')).toBeInTheDocument();
  });

  it.each([
    'search',
    'weather',
  ] as const)('exibe erro de %s e repete a busca pelo retry preservando a unidade', async (stage) => {
    const user = userEvent.setup();
    const service = stage === 'search' ? searchCities : getWeather;
    vi.mocked(service).mockRejectedValueOnce(new Error('Falha de rede.'));
    render(<App />);
    await user.click(screen.getByRole('button', { name: '°F' }));
    await user.type(screen.getByRole('searchbox'), 'Recife{Enter}');

    expect(await screen.findByRole('alert')).toHaveTextContent('Falha de rede.');
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    await screen.findByRole('region', { name: 'Salvador, Bahia, Brasil' });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(searchCities).toHaveBeenNthCalledWith(1, 'Recife');
    expect(searchCities).toHaveBeenNthCalledWith(2, 'Recife');
    expect(getWeather).toHaveBeenCalledTimes(stage === 'search' ? 1 : 2);
    expect(screen.getByRole('button', { name: '°F' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('83 °F')).toBeInTheDocument();
  });

  it('preserva a unidade entre buscas e converte todos os campos sem mutação ou refetch', async () => {
    const user = userEvent.setup();
    const original = structuredClone(mockWeatherData);
    render(<App />);
    await user.type(screen.getByRole('searchbox'), 'Salvador{Enter}');
    await screen.findByRole('region', { name: 'Salvador, Bahia, Brasil' });

    for (const unit of ['fahrenheit', 'celsius', 'fahrenheit'] satisfies Unit[]) {
      await user.click(screen.getByRole('button', { name: unit === 'celsius' ? '°C' : '°F' }));
      const current = within(screen.getByRole('region', { name: 'Salvador, Bahia, Brasil' }));
      expect(
        current.getByText(formatTemperature(original.current.temperatureC, unit)),
      ).toBeInTheDocument();
      expect(
        current.getByText(
          `Sensação térmica: ${formatTemperature(original.current.apparentTemperatureC, unit)}`,
        ),
      ).toBeInTheDocument();
      const cards = screen.getAllByRole('article');
      original.forecast.days.forEach((day, index) => {
        const card = within(cards[index]);
        expect(card.getByText(formatTemperature(day.minTemperatureC, unit))).toBeInTheDocument();
        expect(card.getByText(formatTemperature(day.maxTemperatureC, unit))).toBeInTheDocument();
        expect(cards[index].querySelector('time')).toHaveAttribute('datetime', day.date);
      });
    }

    expect(searchCities).toHaveBeenCalledTimes(1);
    expect(getWeather).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await screen.findByRole('region', { name: 'Salvador, Bahia, Brasil' });
    expect(screen.getByRole('button', { name: '°F' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('83 °F')).toBeInTheDocument();
    expect(mockWeatherData).toEqual(original);
  });
});
