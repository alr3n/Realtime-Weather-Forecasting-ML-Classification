// Server-only OpenWeatherMap client.
// The API key is read from process.env and NEVER exposed to the browser.

import 'server-only';

import type {
  CurrentWeather,
  DailyForecast,
  ForecastBucket,
  OWMCurrentResponse,
  OWMForecastItem,
  OWMForecastResponse,
  Units,
} from '@/types/weather';
import { localDateKey, formatLocalDay, formatShortDate } from './utils';

const OWM_BASE = 'https://api.openweathermap.org/data/2.5';

function apiKey(): string {
  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) {
    throw new Error(
      'OPENWEATHER_API_KEY is not set. Add it to .env.local (and to Vercel env in production).'
    );
  }
  return key;
}

/** Convert m/s wind speed (OWM metric) to km/h. */
function msToKmh(ms: number): number {
  return ms * 3.6;
}

/** Convert mph (OWM imperial) to km/h — used so our ML feature stays in km/h. */
function mphToKmh(mph: number): number {
  return mph * 1.609344;
}

export async function fetchCurrent(
  city: string,
  units: Units
): Promise<CurrentWeather> {
  const url = new URL(`${OWM_BASE}/weather`);
  url.searchParams.set('q', city);
  url.searchParams.set('appid', apiKey());
  url.searchParams.set('units', units);

  const res = await fetch(url.toString(), {
    // App-Router cache: revalidate every 10 minutes.
    next: { revalidate: 600 },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenWeather current failed (${res.status}): ${text}`);
  }
  const data = (await res.json()) as OWMCurrentResponse;
  return normalizeCurrent(data, units);
}

export async function fetchForecast(
  city: string,
  units: Units
): Promise<OWMForecastResponse> {
  const url = new URL(`${OWM_BASE}/forecast`);
  url.searchParams.set('q', city);
  url.searchParams.set('appid', apiKey());
  url.searchParams.set('units', units);

  const res = await fetch(url.toString(), {
    next: { revalidate: 600 },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenWeather forecast failed (${res.status}): ${text}`);
  }
  return (await res.json()) as OWMForecastResponse;
}

function normalizeCurrent(d: OWMCurrentResponse, units: Units): CurrentWeather {
  const w0 = d.weather[0];
  const windKmh = units === 'metric' ? msToKmh(d.wind.speed) : mphToKmh(d.wind.speed);
  return {
    city: d.name,
    country: d.sys.country,
    description: w0?.description ?? 'unknown',
    main: w0?.main ?? 'Unknown',
    icon: w0?.icon ?? '01d',
    temp: d.main.temp,
    feelsLike: d.main.feels_like,
    tempMin: d.main.temp_min,
    tempMax: d.main.temp_max,
    humidity: d.main.humidity,
    pressure: d.main.pressure,
    windSpeedKmh: windKmh,
    windDeg: d.wind.deg,
    cloudsPct: d.clouds.all,
    visibilityKm: d.visibility / 1000,
    sunrise: d.sys.sunrise,
    sunset: d.sys.sunset,
    dt: d.dt,
    timezone: d.timezone,
    lat: d.coord.lat,
    lon: d.coord.lon,
  };
}

export function bucketsFromForecast(
  forecast: OWMForecastResponse,
  units: Units
): ForecastBucket[] {
  return forecast.list.map((item: OWMForecastItem): ForecastBucket => {
    const w0 = item.weather[0];
    const windKmh = units === 'metric' ? msToKmh(item.wind.speed) : mphToKmh(item.wind.speed);
    return {
      dt: item.dt,
      temp: item.main.temp,
      tempMin: item.main.temp_min,
      tempMax: item.main.temp_max,
      description: w0?.description ?? 'unknown',
      main: w0?.main ?? 'Unknown',
      icon: w0?.icon ?? '01d',
      pop: item.pop ?? 0,
      humidity: item.main.humidity,
      windSpeedKmh: windKmh,
      cloudsPct: item.clouds.all,
    };
  });
}

/** Aggregate the 3-hour buckets into 5 daily summaries. */
export function dailyFromForecast(
  forecast: OWMForecastResponse,
  buckets: ForecastBucket[]
): DailyForecast[] {
  const tzOffset = forecast.city.timezone;
  const groups = new Map<string, ForecastBucket[]>();

  for (const b of buckets) {
    const key = localDateKey(b.dt, tzOffset);
    const arr = groups.get(key);
    if (arr) arr.push(b);
    else groups.set(key, [b]);
  }

  const days: DailyForecast[] = [];
  for (const [date, items] of groups) {
    if (!items.length) continue;
    // Pick a representative bucket near local noon
    const representative =
      items.find((it) => {
        const ms = (it.dt + tzOffset) * 1000;
        const hour = new Date(ms).getUTCHours();
        return hour >= 11 && hour <= 14;
      }) ?? items[Math.floor(items.length / 2)] ?? items[0]!;

    const tempMin = Math.min(...items.map((i) => i.tempMin));
    const tempMax = Math.max(...items.map((i) => i.tempMax));
    const pop = Math.max(...items.map((i) => i.pop));

    days.push({
      dt: representative.dt,
      date,
      dayName: formatLocalDay(representative.dt, tzOffset, 'long'),
      tempMin,
      tempMax,
      description: representative.description,
      main: representative.main,
      icon: representative.icon,
      pop,
    });
  }

  // Sort by date ascending, take first 5
  days.sort((a, b) => a.dt - b.dt);
  return days.slice(0, 5);
}

/** Helper used in the metrics card. */
export function formatDayLabel(unixSeconds: number, tzOffsetSeconds: number) {
  return {
    day: formatLocalDay(unixSeconds, tzOffsetSeconds, 'long'),
    short: formatShortDate(unixSeconds, tzOffsetSeconds),
  };
}
