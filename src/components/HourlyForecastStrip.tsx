'use client';

import { useMemo } from 'react';
import WeatherConditionIcon, {
  mapMainToCondition,
} from './WeatherConditionIcon';
import { cn, degSymbol, formatLocalTime, roundTemp } from '@/lib/utils';
import type { ForecastBucket, Units } from '@/types/weather';

interface Props {
  hourly: ForecastBucket[];
  tzOffsetSeconds: number;
  units: Units;
  currentTemp?: number;
}

export default function HourlyForecastStrip({
  hourly,
  tzOffsetSeconds,
  units,
  currentTemp,
}: Props) {
  const sym = degSymbol(units);

  // Build a "Now" pill at the front using the live current temperature.
  const items = useMemo(() => {
    const list = hourly.slice(0, 6).map((b) => ({
      label: formatLocalTime(b.dt, tzOffsetSeconds, {
        hour: 'numeric',
        hour12: false,
        minute: '2-digit',
      }),
      temp: roundTemp(b.temp),
      condition: mapMainToCondition(b.main),
      active: false,
      key: `h-${b.dt}`,
    }));
    if (typeof currentTemp === 'number') {
      list.unshift({
        label: 'Now',
        temp: roundTemp(currentTemp),
        condition: list[0]?.condition ?? 'sunny',
        active: true,
        key: 'now',
      });
    }
    return list.slice(0, 6);
  }, [hourly, tzOffsetSeconds, currentTemp]);

  return (
    <div className="-mx-1 overflow-x-auto no-scrollbar">
      <ul className="flex gap-2.5 px-1 pb-1">
        {items.map((it) => (
          <li key={it.key} className="shrink-0">
            <div
              className={cn(
                'flex flex-col items-center gap-2 rounded-2xl px-3.5 py-3 min-w-[64px]',
                'transition-colors',
                it.active
                  ? 'bg-white text-[#1a1a2e] shadow-[0_6px_20px_rgba(255,255,255,0.18)]'
                  : 'glass-card text-white'
              )}
            >
              <span
                className={cn(
                  'text-[11px] font-semibold tracking-wide',
                  it.active ? 'text-[#1a1a2e]/80' : 'text-white/60'
                )}
              >
                {it.label}
              </span>
              <WeatherConditionIcon condition={it.condition} size="sm" />
              <span
                className={cn(
                  'text-temp text-[14px]',
                  it.active ? 'text-[#1a1a2e]' : 'text-white'
                )}
              >
                {it.temp}
                {sym}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
