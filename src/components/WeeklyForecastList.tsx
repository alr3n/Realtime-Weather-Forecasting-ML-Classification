'use client';

import WeatherConditionIcon, {
  mapMainToCondition,
} from './WeatherConditionIcon';
import { cn, degSymbol, formatShortDate, roundTemp } from '@/lib/utils';
import type { DailyForecast, Units } from '@/types/weather';

interface Props {
  daily: DailyForecast[];
  tzOffsetSeconds: number;
  units: Units;
}

export default function WeeklyForecastList({
  daily,
  tzOffsetSeconds,
  units,
}: Props) {
  const sym = degSymbol(units);

  return (
    <ul className="flex flex-col gap-3">
      {daily.map((d, i) => {
        const condition = mapMainToCondition(d.main);
        const indicatorColor =
          condition === 'rainy'
            ? 'var(--color-rainy)'
            : condition === 'snowy'
              ? 'var(--color-snowy)'
              : condition === 'cloudy'
                ? 'var(--color-cloudy)'
                : 'var(--color-sunny)';
        return (
          <li
            key={d.dt}
            className={cn(
              'glass-card rounded-2xl p-4',
              'flex items-center justify-between gap-3'
            )}
            style={{ animation: `fade-in 0.4s ease-out ${i * 40}ms both` }}
          >
            <div className="flex flex-col">
              <span className="text-[15px] font-bold">{d.dayName}</span>
              <span className="text-xs text-white/45">
                {formatShortDate(d.dt, tzOffsetSeconds)}
              </span>
            </div>
            <div className="text-temp text-[28px] leading-none">
              {roundTemp(d.tempMax)}
              {sym}
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <WeatherConditionIcon condition={condition} size="md" />
              <div className="flex gap-1">
                {[0, 1, 2].map((dot) => (
                  <span
                    key={dot}
                    className="block w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: indicatorColor,
                      opacity: 0.4 + dot * 0.3,
                    }}
                  />
                ))}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
