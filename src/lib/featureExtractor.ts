// Convert a normalized OWM current-weather response into the exact 10-feature
// vector that the XGBoost classifier (trained in Colab) expects.

import type { CurrentWeather, LocationKind } from '@/types/weather';
import type { MLFeatures } from '@/types/ml';

/** Map OWM clouds.all (%) to the trained model's categorical Cloud Cover index. */
export function cloudCoverIndex(cloudsPct: number): number {
  if (cloudsPct <= 10) return 0; // clear
  if (cloudsPct <= 40) return 1; // partly cloudy
  if (cloudsPct <= 80) return 2; // cloudy
  return 3; // overcast
}

/** Map UTC month -> Season index used during training. */
export function seasonFromMonth(monthZeroBased: number): number {
  // 0=Spring (Mar-May), 1=Summer (Jun-Aug), 2=Autumn (Sep-Nov), 3=Winter (Dec-Feb)
  const m = monthZeroBased; // 0..11
  if (m >= 2 && m <= 4) return 0;
  if (m >= 5 && m <= 7) return 1;
  if (m >= 8 && m <= 10) return 2;
  return 3;
}

export function locationIndex(kind: LocationKind): number {
  switch (kind) {
    case 'inland':
      return 0;
    case 'coastal':
      return 1;
    case 'mountain':
      return 2;
  }
}

/** Convert wind speed to km/h regardless of input units. */
function toKmh(speed: number, units: 'metric' | 'imperial'): number {
  return units === 'metric' ? speed * 3.6 : speed * 1.609344;
}

/**
 * Build the 10-feature ML payload from a normalized CurrentWeather object.
 * UV Index is rarely present on the free OWM Current endpoint, so it defaults
 * to a reasonable 3 (matches the spec).
 */
export function buildMLFeatures(
  current: CurrentWeather,
  locationKind: LocationKind,
  opts: { uvIndex?: number; nowMs?: number } = {}
): MLFeatures {
  const nowMs = opts.nowMs ?? Date.now();
  const month = new Date(nowMs).getUTCMonth(); // 0..11

  // Temperature is already in metric °C (we always call OWM with units=metric
  // server-side for ML, even if the user is viewing °F).
  const features: MLFeatures = {
    Temperature: round1(current.temp),
    Humidity: round1(current.humidity),
    'Wind Speed': round1(current.windSpeedKmh),
    'Precipitation (%)': round1(current.cloudsPct), // proxy per spec
    'Cloud Cover': cloudCoverIndex(current.cloudsPct),
    'Atmospheric Pressure': round1(current.pressure),
    'UV Index': clampInt(opts.uvIndex ?? 3, 0, 13),
    Season: seasonFromMonth(month),
    'Visibility (km)': round1(current.visibilityKm),
    Location: locationIndex(locationKind),
  };
  return features;
}

/** Re-build features from raw OWM "metric" values (used in the API route). */
export function featuresFromRaw(args: {
  tempC: number;
  humidity: number;
  windSpeedMs: number;
  cloudsPct: number;
  pressure: number;
  visibilityM: number;
  locationKind: LocationKind;
  uvIndex?: number;
  nowMs?: number;
}): MLFeatures {
  const month = new Date(args.nowMs ?? Date.now()).getUTCMonth();
  return {
    Temperature: round1(args.tempC),
    Humidity: round1(args.humidity),
    'Wind Speed': round1(toKmh(args.windSpeedMs, 'metric')),
    'Precipitation (%)': round1(args.cloudsPct),
    'Cloud Cover': cloudCoverIndex(args.cloudsPct),
    'Atmospheric Pressure': round1(args.pressure),
    'UV Index': clampInt(args.uvIndex ?? 3, 0, 13),
    Season: seasonFromMonth(month),
    'Visibility (km)': round1(args.visibilityM / 1000),
    Location: locationIndex(args.locationKind),
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function clampInt(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, Math.round(n)));
}
