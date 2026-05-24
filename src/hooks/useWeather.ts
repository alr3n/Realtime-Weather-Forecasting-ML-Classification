'use client';

import useSWR, { type SWRConfiguration } from 'swr';
import type { WeatherPayload, Units, LocationKind } from '@/types/weather';

const fetcher = async (url: string): Promise<WeatherPayload> => {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(body?.error ?? `Weather request failed (${res.status})`);
  }
  return (await res.json()) as WeatherPayload;
};

export interface UseWeatherArgs {
  city: string;
  units: Units;
  locationKind: LocationKind;
}

export function useWeather({ city, units, locationKind }: UseWeatherArgs) {
  const key = city
    ? `/api/weather?city=${encodeURIComponent(city)}&units=${units}&location=${locationKind}`
    : null;

  const config: SWRConfiguration<WeatherPayload> = {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    // Revalidate every 10 minutes (600s).
    refreshInterval: 600_000,
    dedupingInterval: 60_000,
    errorRetryCount: 2,
  };

  return useSWR<WeatherPayload, Error>(key, fetcher, config);
}
