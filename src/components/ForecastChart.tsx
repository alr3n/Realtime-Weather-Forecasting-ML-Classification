'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { degSymbol, formatLocalTime, roundTemp } from '@/lib/utils';
import type { ForecastBucket, Units } from '@/types/weather';

interface Props {
  hourly: ForecastBucket[];
  tzOffsetSeconds: number;
  units: Units;
}

interface ChartPoint {
  label: string;
  temp: number;
  feels: number;
  full: string;
}

export default function ForecastChart({
  hourly,
  tzOffsetSeconds,
  units,
}: Props) {
  const sym = degSymbol(units);
  const data: ChartPoint[] = hourly.slice(0, 8).map((b) => ({
    label: formatLocalTime(b.dt, tzOffsetSeconds, {
      hour: 'numeric',
      hour12: false,
    }),
    temp: Math.round(b.temp * 10) / 10,
    feels: Math.round(b.tempMin * 10) / 10,
    full: formatLocalTime(b.dt, tzOffsetSeconds, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false,
    }),
  }));

  return (
    <section className="glass-card rounded-2xl p-4">
      <h3 className="text-xs font-semibold tracking-[0.18em] uppercase text-white/70 mb-3">
        Temperature Trend
      </h3>
      <div className="h-44 -ml-2 -mr-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="temp-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.55} />
                <stop offset="100%" stopColor="#6c63ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="rgba(255,255,255,0.08)"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={32}
              tickFormatter={(v) => `${roundTemp(Number(v))}${sym}`}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(15,12,41,0.92)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 12,
                fontSize: 12,
              }}
              labelStyle={{ color: 'rgba(255,255,255,0.8)' }}
              itemStyle={{ color: '#fff' }}
              formatter={(value: number) => [`${value}${sym}`, 'Temp']}
              labelFormatter={(label, payload) =>
                payload?.[0]?.payload?.full ?? label
              }
            />
            <Area
              type="monotone"
              dataKey="temp"
              stroke="#a78bfa"
              strokeWidth={2.5}
              fill="url(#temp-fill)"
              dot={{ r: 3, fill: '#fff', stroke: '#a78bfa', strokeWidth: 2 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
