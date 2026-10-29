import { expect, test } from '@playwright/test';
import { mockWeatherData } from '../../src/mocks/weather';

test('consulta mantém os cinco estados sem rolagem horizontal nas larguras previstas', async ({
  page,
}) => {
  let mode: 'empty' | 'error' | 'success' = 'empty';
  let weatherGate = Promise.resolve();
  const { city, current, forecast } = mockWeatherData;
  await page.route('https://geocoding-api.open-meteo.com/**', (route) =>
    route.fulfill({
      status: mode === 'error' ? 503 : 200,
      json: { results: mode === 'empty' ? [] : [city] },
    }),
  );
  await page.route('https://api.open-meteo.com/**', async (route) => {
    await weatherGate;
    await route.fulfill({
      json: {
        timezone: forecast.timezone,
        current: {
          time: current.observedAt.slice(0, 19),
          temperature_2m: current.temperatureC,
          apparent_temperature: current.apparentTemperatureC,
          relative_humidity_2m: current.relativeHumidity,
          wind_speed_10m: current.windSpeedKmh,
          weather_code: current.weatherCode,
        },
        daily: {
          time: forecast.days.map((day) => day.date),
          temperature_2m_min: forecast.days.map((day) => day.minTemperatureC),
          temperature_2m_max: forecast.days.map((day) => day.maxTemperatureC),
          weather_code: forecast.days.map((day) => day.weatherCode),
          precipitation_probability_max: forecast.days.map((day) => day.precipitationProbability),
        },
      },
    });
  });

  async function checkLayout(width: number, state: string) {
    await expect(page.getByRole('main')).toBeVisible();
    const size = await page.evaluate(() => ({
      content: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
    }));
    expect(size.content, `${width}px / ${state}`).toBeLessThanOrEqual(size.viewport);
  }

  for (const width of [320, 360, 414, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.getByRole('main')).toContainText('Busque uma cidade para começar');
    await checkLayout(width, 'idle');

    mode = 'empty';
    await page.getByRole('searchbox', { name: 'Cidade' }).fill('Salvador');
    await page.getByRole('button', { name: 'Buscar', exact: true }).click();
    await expect(page.getByRole('main')).toContainText('Nenhuma cidade encontrada');
    await checkLayout(width, 'empty');

    mode = 'error';
    await page.getByRole('button', { name: 'Buscar', exact: true }).click();
    await expect(page.getByRole('alert')).toBeVisible();
    await checkLayout(width, 'error');

    mode = 'success';
    let releaseWeather!: () => void;
    weatherGate = new Promise((resolve) => {
      releaseWeather = resolve;
    });
    await page.getByRole('button', { name: 'Tentar novamente' }).click();
    await expect(page.getByRole('status')).toContainText('Carregando o clima...');
    await expect(page.getByRole('searchbox')).toBeDisabled();
    await checkLayout(width, 'loading');
    releaseWeather();

    await expect(page.getByRole('region', { name: 'Salvador, Bahia, Brasil' })).toBeVisible();
    await expect(page.getByRole('article')).toHaveCount(5);
    await checkLayout(width, 'success');
  }

  const currentWeather = page.getByRole('region', { name: 'Salvador, Bahia, Brasil' });
  await page.getByRole('button', { name: '°F' }).click();
  await expect(currentWeather.getByText('83 °F', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '°C' }).click();
  await expect(currentWeather.getByText('29 °C', { exact: true })).toBeVisible();
});
