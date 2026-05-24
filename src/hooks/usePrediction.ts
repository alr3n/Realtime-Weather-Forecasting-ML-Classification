'use client';

import useSWR from 'swr';
import type { MLFeatures, MLPrediction } from '@/types/ml';

const fetcher = async ([url, features]: [string, MLFeatures]): Promise<MLPrediction> => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ features }),
  });
  // The /api/predict route always returns 200 (with a fallback body if needed).
  return (await res.json()) as MLPrediction;
};

/** Stable cache key derived from the features object. */
function featuresKey(f: MLFeatures): string {
  return [
    f.Temperature,
    f.Humidity,
    f['Wind Speed'],
    f['Precipitation (%)'],
    f['Cloud Cover'],
    f['Atmospheric Pressure'],
    f['UV Index'],
    f.Season,
    f['Visibility (km)'],
    f.Location,
  ].join('|');
}

export function usePrediction(features: MLFeatures | undefined) {
  const swrKey =
    features !== undefined ? (['/api/predict', features] as const) : null;
  // SWR will hash the array; we also include a stringified key in the URL for clarity.
  return useSWR<MLPrediction, Error>(
    swrKey,
    swrKey ? () => fetcher(['/api/predict', features!]) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30_000,
      // Force-revalidate when feature fingerprint changes.
      compare: (a, b) =>
        JSON.stringify(a) === JSON.stringify(b),
    }
  );
}

export { featuresKey };
