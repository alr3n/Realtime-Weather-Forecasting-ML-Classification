// Type definitions for OpenWeatherMap responses and our normalized weather shape.

export type Units = 'metric' | 'imperial';

export interface OWMCurrentResponse {
  coord: { lon: number; lat: number };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  visibility: number;
  wind: { speed: number; deg: number; gust?: number };
  clouds: { all: number };
  rain?: { '1h'?: number; '3h'?: number };
  snow?: { '1h'?: number; '3h'?: number };
  dt: number;
  sys: {
    type?: number;
    id?: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export interface OWMForecastItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  clouds: { all: number };
  wind: { speed: number; deg: number; gust?: number };
  visibility: number;
  pop: number; // probability of precipitation 0..1
  rain?: { '3h'?: number };
  snow?: { '3h'?: number };
  sys: { pod: 'd' | 'n' };
  dt_txt: string;
}

export interface OWMForecastResponse {
  cod: string;
  message: number;
  cnt: number;
  list: OWMForecastItem[];
  city: {
    id: number;
    name: string;
    coord: { lat: number; lon: number };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

/** Our normalized "current weather" used by the UI. */
export interface CurrentWeather {
  city: string;
  country: string;
  description: string;
  main: string; // "Clear", "Clouds", "Rain", "Snow", etc.
  icon: string;
  temp: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  pressure: number;
  windSpeedKmh: number;
  windDeg: number;
  cloudsPct: number;
  visibilityKm: number;
  sunrise: number; // unix seconds
  sunset: number;
  dt: number;
  timezone: number; // seconds offset from UTC
  lat: number;
  lon: number;
}

/** A single forecast bucket (3-hour or aggregated daily). */
export interface ForecastBucket {
  dt: number;
  temp: number;
  tempMin: number;
  tempMax: number;
  description: string;
  main: string;
  icon: string;
  pop: number; // 0..1
  humidity: number;
  windSpeedKmh: number;
  cloudsPct: number;
}

export interface DailyForecast {
  dt: number; // noon-ish unix timestamp of that day
  date: string; // ISO date "YYYY-MM-DD"
  dayName: string; // "Friday"
  tempMin: number;
  tempMax: number;
  description: string;
  main: string;
  icon: string;
  pop: number;
}

export type LocationKind = 'inland' | 'coastal' | 'mountain';

/** Final aggregated payload returned by /api/weather. */
export interface WeatherPayload {
  current: CurrentWeather;
  hourly: ForecastBucket[]; // first ~8 3-hour buckets ("today + tomorrow")
  daily: DailyForecast[]; // 5 days
  mlFeatures: import('./ml').MLFeatures;
  locationKind: LocationKind;
  units: Units;
}

export interface WeatherErrorResponse {
  error: string;
  status: number;
}
