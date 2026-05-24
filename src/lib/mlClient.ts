// Server-side client for the FastAPI ML microservice.
// Gracefully degrades to a "fallback" prediction when the Python service is unreachable.

import 'server-only';

import type { MLFeatures, MLPrediction, MLProbabilities } from '@/types/ml';

const EMPTY_PROBS: MLProbabilities = { Sunny: 0, Cloudy: 0, Rainy: 0, Snowy: 0 };

function pythonUrl(): string {
  return process.env.PYTHON_API_URL?.replace(/\/$/, '') ?? 'http://127.0.0.1:8000';
}

/**
 * POST features to the FastAPI service and return its prediction.
 * On any failure (network, non-200, malformed body), returns a fallback object
 * so the UI keeps rendering instead of crashing.
 */
export async function predict(features: MLFeatures): Promise<MLPrediction> {
  const url = `${pythonUrl()}/predict`;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ features }),
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return fallback(`ML service responded ${res.status}: ${text.slice(0, 120)}`);
    }

    const body = (await res.json()) as Partial<MLPrediction> & {
      label?: string;
      probabilities?: Partial<MLProbabilities>;
    };

    if (!body.label || !body.probabilities) {
      return fallback('ML service returned malformed payload');
    }

    return {
      label: body.label as MLPrediction['label'],
      class_id: typeof body.class_id === 'number' ? body.class_id : 0,
      confidence: typeof body.confidence === 'number' ? body.confidence : 0,
      probabilities: {
        Sunny: body.probabilities.Sunny ?? 0,
        Cloudy: body.probabilities.Cloudy ?? 0,
        Rainy: body.probabilities.Rainy ?? 0,
        Snowy: body.probabilities.Snowy ?? 0,
      },
    } as MLPrediction;
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error';
    return fallback(`ML service unavailable: ${msg}`);
  }
}

function fallback(error: string): MLPrediction {
  return {
    label: null,
    class_id: null,
    confidence: 0,
    probabilities: { ...EMPTY_PROBS },
    fallback: true,
    error,
  };
}
