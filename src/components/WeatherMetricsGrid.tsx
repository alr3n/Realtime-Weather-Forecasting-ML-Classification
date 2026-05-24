'use client';

import {
  Droplets,
  Wind,
  Gauge,
  Eye,
  Sun,
  CloudRain,
  Sunrise,
  Sunset,
} from 'lucide-react';
import { degSymbol, formatLocalTime, roundTemp } from '@/lib/utils';
import type { CurrentWeather, Units } from '@/types/weather';

interface Props {
  current: CurrentWeather;
  units: Units;
  uvIndex?: number;
  popToday?: number; // 0..1
}

interface Tile {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
}

export default function WeatherMetricsGrid({
  current,
  units,
  uvIndex,
  popToday,
}: Props) {
  const sym = degSymbol(units);
  const windUnit = units === 'metric' ? 'km/h' : 'km/h'; // we already normalized to km/h
  const tiles: Tile[] = [
    {
      label: 'Humidity',
      value: `${roundTemp(current.humidity)}%`,
      icon: <Droplets size={18} />,
      accent: 'text-accent-cyan',
    },
    {
      label: 'Wind',
      value: `${roundTemp(current.windSpeedKmh)} ${windUnit}`,
      icon: <Wind size={18} />,
      accent: 'text-accent-blue',
    },
    {
      label: 'Pressure',
      value: `${roundTemp(current.pressure)} hPa`,
      icon: <Gauge size={18} />,
      accent: 'text-accent-purple',
    },
    {
      label: 'Visibility',
      value: `${current.visibilityKm.toFixed(1)} km`,
      icon: <Eye size={18} />,
      accent: 'text-white/80',
    },
    {
      label: 'UV Index',
      value: `${uvIndex ?? 3}`,
      icon: <Sun size={18} />,
      accent: 'text-sunny',
    },
    {
      label: 'Rain Chance',
      value: `${Math.round((popToday ?? 0) * 100)}%`,
      icon: <CloudRain size={18} />,
      accent: 'text-rainy',
    },
    {
      label: 'Sunrise',
      value: formatLocalTime(current.sunrise, current.timezone),
      icon: <Sunrise size={18} />,
      accent: 'text-sunny',
    },
    {
      label: 'Sunset',
      value: formatLocalTime(current.sunset, current.timezone),
      icon: <Sunset size={18} />,
      accent: 'text-accent-purple',
    },
  ];
  void sym; // sym retained for future formatting if needed

  return (
    <section>
      <h3 className="text-xs font-semibold tracking-[0.18em] uppercase text-white/70 mb-3">
        Conditions
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {tiles.map((t, i) => (
          <div
            key={t.label}
            className="glass-card rounded-2xl p-3.5"
            style={{ animation: `fade-in 0.4s ease-out ${i * 30}ms both` }}
          >
            <div className={`flex items-center gap-1.5 text-xs text-white/55 mb-2`}>
              <span className={t.accent}>{t.icon}</span>
              <span className="uppercase tracking-wide">{t.label}</span>
            </div>
            <div className="text-temp text-[18px] leading-none">{t.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
