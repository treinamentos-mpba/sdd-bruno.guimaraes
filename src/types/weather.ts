export type Unit = 'celsius' | 'fahrenheit';

export interface City {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

export interface CurrentWeather {
  observedAt: string;
  temperatureC: number;
  apparentTemperatureC: number | null;
  relativeHumidity: number | null;
  windSpeedKmh: number | null;
  precipitationMm?: number | null;
  pressureHpa?: number | null;
  weatherCode: number;
}

export interface ForecastDay {
  /** Data local da cidade no formato YYYY-MM-DD. */
  date: string;
  minTemperatureC: number | null;
  maxTemperatureC: number | null;
  weatherCode: number | null;
  precipitationProbability?: number | null;
  incomplete: boolean;
}

export interface Forecast {
  timezone: string;
  days: ForecastDay[];
  incomplete: boolean;
}

/** Temperaturas em Celsius, sem arredondamento ou conversao para exibicao. */
export interface WeatherData {
  city: City;
  current: CurrentWeather;
  forecast: Forecast;
}

export type WeatherErrorKind =
  | 'network'
  | 'timeout'
  | 'rate-limit'
  | 'http'
  | 'invalid-response'
  | 'unavailable';

export interface WeatherError {
  kind: WeatherErrorKind;
  message: string;
}
