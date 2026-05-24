import { NextResponse, type NextRequest } from 'next/server';
import {
  bucketsFromForecast,
  dailyFromForecast,
  fetchCurrent,
  fetchForecast,
} from '@/lib/openweather';
import { buildMLFeatures } from '@/lib/featureExtractor';
import type {
  LocationKind,
  Units,
  WeatherPayload,
} from '@/types/weather';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function parseUnits(value: string | null): Units {
  return value === 'imperial' ? 'imperial' : 'metric';
}

function parseLocation(value: string | null): LocationKind {
  if (value === 'coastal' || value === 'mountain') return value;
  return 'inland';
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get('city')?.trim();
  const units = parseUnits(searchParams.get('units'));
  const locationKind = parseLocation(searchParams.get('location'));

  if (!city) {
    return NextResponse.json(
      { error: 'Missing "city" query parameter', status: 400 },
      { status: 400 }
    );
  }

  try {
    // We always fetch the user-facing data in their selected units,
    // BUT we also need metric data for the ML feature extractor since the
    // model was trained on °C and km/h.
    const [currentDisplay, forecastDisplay] = await Promise.all([
      fetchCurrent(city, units),
      fetchForecast(city, units),
    ]);

    let currentMetric = currentDisplay;
    if (units !== 'metric') {
      currentMetric = await fetchCurrent(city, 'metric');
    }

    const hourly = bucketsFromForecast(forecastDisplay, units).slice(0, 8);
    const daily = dailyFromForecast(
      forecastDisplay,
      bucketsFromForecast(forecastDisplay, units)
    );
    const mlFeatures = buildMLFeatures(currentMetric, locationKind);

    const payload: WeatherPayload = {
      current: currentDisplay,
      hourly,
      daily,
      mlFeatures,
      locationKind,
      units,
    };

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const isNotFound = /404/.test(message) || /city not found/i.test(message);
    return NextResponse.json(
      { error: message, status: isNotFound ? 404 : 500 },
      { status: isNotFound ? 404 : 500 }
    );
  }
}
