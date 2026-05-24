import { NextResponse, type NextRequest } from 'next/server';
import { predict } from '@/lib/mlClient';
import type { MLFeatures } from '@/types/ml';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isValidFeatures(x: unknown): x is MLFeatures {
  if (!x || typeof x !== 'object') return false;
  const f = x as Record<string, unknown>;
  const required: Array<keyof MLFeatures> = [
    'Temperature',
    'Humidity',
    'Wind Speed',
    'Precipitation (%)',
    'Cloud Cover',
    'Atmospheric Pressure',
    'UV Index',
    'Season',
    'Visibility (km)',
    'Location',
  ];
  return required.every((k) => typeof f[k] === 'number' && Number.isFinite(f[k] as number));
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        label: null,
        class_id: null,
        confidence: 0,
        probabilities: { Sunny: 0, Cloudy: 0, Rainy: 0, Snowy: 0 },
        fallback: true,
        error: 'Invalid JSON body',
      },
      { status: 200 }
    );
  }

  const features = (body as { features?: unknown })?.features;

  if (!isValidFeatures(features)) {
    return NextResponse.json(
      {
        label: null,
        class_id: null,
        confidence: 0,
        probabilities: { Sunny: 0, Cloudy: 0, Rainy: 0, Snowy: 0 },
        fallback: true,
        error: 'Invalid or missing "features" object',
      },
      { status: 200 }
    );
  }

  const prediction = await predict(features);
  return NextResponse.json(prediction, { status: 200 });
}
