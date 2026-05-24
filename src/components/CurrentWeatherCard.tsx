'use client';

import { useMemo } from 'react';
import WeatherConditionIcon, {
  mapMainToCondition,
  type WeatherCondition,
} from './WeatherConditionIcon';
import { cn, degSymbol, roundTemp, titleCase } from '@/lib/utils';
import type { CurrentWeather, Units } from '@/types/weather';

interface Props {
  current: CurrentWeather;
  units: Units;
}

export default function CurrentWeatherCard({
  current,
  units,
}: Props) {
  const condition = mapMainToCondition(current.main);
  const sym = degSymbol(units);

  return (
    <section className="flex flex-col items-center">
      {/* Header */}
      <div className="w-full flex items-center justify-center mb-6">
        <h2 className="text-[20px] font-semibold tracking-wide">
          {current.city}, {current.country}
        </h2>
      </div>

      {/* Hero icon w/ particles */}
      <div className="relative flex items-center justify-center w-[200px] h-[200px] mb-4">
        <Particles condition={condition} />
        <div className="relative z-10">
          <WeatherConditionIcon condition={condition} size="xl" />
        </div>
      </div>

      {/* Temperature */}
      <div className="text-temp text-[80px] sm:text-[80px] leading-none">
        {roundTemp(current.temp)}
        <span className="text-[48px] align-top">{sym}</span>
      </div>

      <p className="text-sm text-white/70 mt-2 text-center">
        {titleCase(current.description)} · Feels like {roundTemp(current.feelsLike)}
        {sym}
      </p>
    </section>
  );
}

/**
 * Scattered ambient particles around the hero icon.
 * Different palette per condition so storms/snowy days feel distinct.
 */
function Particles({ condition }: { condition: WeatherCondition }) {
  const particles = useMemo(() => {
    // Stable positions — deterministic so they don't reshuffle on every render.
    const layout = [
      { top: '8%', left: '14%' },
      { top: '18%', left: '78%' },
      { top: '32%', left: '4%' },
      { top: '50%', left: '88%' },
      { top: '68%', left: '12%' },
      { top: '82%', left: '70%' },
      { top: '24%', left: '52%' },
      { top: '60%', left: '46%' },
      { top: '88%', left: '34%' },
      { top: '12%', left: '38%' },
    ];

    let color = 'rgba(125, 211, 252, 0.7)';
    let size = 6;
    let shape = 'rounded-full';
    if (condition === 'snowy') {
      color = 'rgba(224, 231, 255, 0.85)';
      size = 6;
    } else if (condition === 'rainy') {
      color = 'rgba(125, 211, 252, 0.75)';
      size = 5;
    } else if (condition === 'sunny') {
      color = 'rgba(251, 191, 36, 0.55)';
      size = 5;
    } else if (condition === 'storm') {
      color = 'rgba(253, 224, 71, 0.7)';
      size = 5;
    } else {
      color = 'rgba(203, 213, 225, 0.45)';
      size = 5;
    }

    return layout.map((pos, i) => ({
      ...pos,
      key: `p-${i}`,
      size: size + ((i % 3) - 1),
      delay: `${(i * 0.4).toFixed(2)}s`,
      shape,
      color,
    }));
  }, [condition]);

  return (
    <div aria-hidden className="absolute inset-0 pointer-events-none">
      {particles.map((p) => (
        <span
          key={p.key}
          className={cn('absolute will-anim', p.shape)}
          style={{
            top: p.top,
            left: p.left,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            animation: `particle-float 4s ease-in-out infinite`,
            animationDelay: p.delay,
            filter: 'blur(0.5px)',
            boxShadow: `0 0 8px ${p.color}`,
          }}
        />
      ))}
    </div>
  );
}
