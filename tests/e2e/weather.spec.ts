import { expect, test } from '@playwright/test';
import { mockWeatherData } from '../../src/mocks/weather';

test.beforeEach(async ({ page }) => {
  const { city, current, forecast } = mockWeatherData;

  await page.route('https://geocoding-api.open-meteo.com/**', (route) =>
    route.fulfill({
      json: { results: [city] },
    }),
  );
  await page.route('https://api.open-meteo.com/**', (route) =>
    route.fulfill({
      json: {
        timezone: forecast.timezone,
        current: {
          time: current.observedAt.slice(0, 19),
          temperature_2m: 0,
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
    }),
  );
});

test('busca uma cidade, exibe cinco dias e converte a temperatura para Fahrenheit', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByLabel('Cidade', { exact: true }).fill('Salvador');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();

  const currentWeather = page.getByRole('region', { name: 'Salvador, Bahia, Brasil', exact: true });
  await expect(
    currentWeather.getByRole('heading', { name: 'Salvador, Bahia, Brasil', exact: true }),
  ).toBeVisible();
  const forecastRegion = page.getByRole('region', { name: 'Previsão para 5 dias', exact: true });
  await expect(forecastRegion).toBeVisible();
  await expect(forecastRegion.getByRole('article')).toHaveCount(5);
  await expect(currentWeather.getByText('0 °C', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: '°F', exact: true }).click();

  await expect(currentWeather.getByText('32 °F', { exact: true })).toBeVisible();
  await expect(currentWeather.getByText('0 °C', { exact: true })).toHaveCount(0);
});

test('mostra estado vazio quando o geocoding retorna um objeto sem results', async ({ page }) => {
  await page.route('https://geocoding-api.open-meteo.com/**', (route) =>
    route.fulfill({ json: {} }),
  );

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade', exact: true }).fill('Cidade inexistente');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();

  await expect(
    page.getByRole('heading', { name: 'Nenhuma cidade encontrada', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('busca uma cidade e renderiza o clima em viewport mobile de 375x812', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade', exact: true }).fill('Salvador');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();

  const currentWeather = page.getByRole('region', { name: 'Salvador, Bahia, Brasil', exact: true });
  await expect(
    currentWeather.getByRole('heading', { name: 'Salvador, Bahia, Brasil', exact: true }),
  ).toBeVisible();
  await expect(currentWeather.getByText('0 °C', { exact: true })).toBeVisible();
  await expect(currentWeather.getByText('Parcialmente nublado', { exact: true })).toBeVisible();

  const forecastRegion = page.getByRole('region', { name: 'Previsão para 5 dias', exact: true });
  await expect(forecastRegion).toBeVisible();
  await expect(forecastRegion.getByRole('article')).toHaveCount(5);
});
