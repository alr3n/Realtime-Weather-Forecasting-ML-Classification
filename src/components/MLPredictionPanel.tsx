'use client';

import { Sparkles, AlertCircle } from 'lucide-react';
import WeatherConditionIcon, {
  mapMainToCondition,
  type WeatherCondition,
} from './WeatherConditionIcon';
import { cn } from '@/lib/utils';
import type { MLPrediction, MLLabel } from '@/types/ml';

interface Props {
  prediction: MLPrediction | undefined;
  isLoading: boolean;
}

const LABEL_COLORS: Record<MLLabel, string> = {
  Sunny: 'var(--color-sunny)',
  Cloudy: 'var(--color-cloudy)',
  Rainy: 'var(--color-rainy)',
  Snowy: 'var(--color-snowy)',
};

export default function MLPredictionPanel({ prediction, isLoading }: Props) {
  if (isLoading || !prediction) {
    return (
      <section className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={16} className="text-accent-purple" />
          <h3 className="text-sm font-semibold tracking-wide uppercase text-white/80">
            ML Classification
          </h3>
        </div>
        <div className="h-6 w-40 rounded-md animate-shimmer mb-4" />
        <div className="grid grid-cols-4 gap-2">
          {(['Sunny', 'Cloudy', 'Rainy', 'Snowy'] as MLLabel[]).map((l) => (
            <div key={l} className="h-14 rounded-xl animate-shimmer" />
          ))}
        </div>
      </section>
    );
  }

  if (prediction.fallback) {
    return (
      <section className="glass-card rounded-2xl p-5 border-amber-400/20">
        <div className="flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-300 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">ML service offline</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              {prediction.error ?? 'The Python prediction service is unreachable.'}
              <br />
              Start it with{' '}
              <code className="px-1 py-0.5 rounded bg-white/10 font-mono text-[11px]">
                uvicorn api_server:app --reload --port 8000
              </code>{' '}
              in the <code className="font-mono text-[11px]">ml/</code> folder.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const label = prediction.label;
  const confidencePct = Math.round(prediction.confidence * 100);
  const condition: WeatherCondition = mapMainToCondition(label);

  return (
    <section className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-accent-purple" />
          <h3 className="text-xs font-semibold tracking-[0.18em] uppercase text-white/70">
            ML Classification
          </h3>
        </div>
        <span className="text-[11px] text-white/40 font-mono">XGBoost</span>
      </div>

      <div className="flex items-center gap-4 mb-5">
        <div className="relative h-14 w-14 shrink-0 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden">
          <WeatherConditionIcon condition={condition} size="md" />
        </div>
        <div className="flex-1">
          <div
            className="text-[22px] font-bold leading-none"
            style={{ color: LABEL_COLORS[label] }}
          >
            {label}
          </div>
          <div className="text-xs text-white/55 mt-1">
            Confidence: <span className="font-mono">{confidencePct}%</span>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        {(Object.keys(prediction.probabilities) as MLLabel[]).map((k) => {
          const p = prediction.probabilities[k];
          const pct = Math.round(p * 1000) / 10;
          const isWinner = k === label;
          return (
            <div key={k} className="grid grid-cols-[64px_1fr_46px] items-center gap-2.5">
              <span
                className={cn(
                  'text-xs font-semibold',
                  isWinner ? 'text-white' : 'text-white/55'
                )}
              >
                {k}
              </span>
              <div className="h-2 rounded-full bg-white/8 overflow-hidden">
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{
                    width: `${Math.max(2, p * 100)}%`,
                    backgroundColor: LABEL_COLORS[k],
                    boxShadow: isWinner ? `0 0 12px ${LABEL_COLORS[k]}` : undefined,
                  }}
                />
              </div>
              <span className="text-[11px] font-mono text-white/60 text-right">
                {pct.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
