'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatLocalTime } from '@/lib/utils';
import type { ForecastBucket } from '@/types/weather';

interface Props {
  hourly: ForecastBucket[];
  tzOffsetSeconds: number;
}

interface ChartPoint {
  label: string;
  popPct: number;
}

export default function HourlyChart({ hourly, tzOffsetSeconds }: Props) {
  const data: ChartPoint[] = hourly.slice(0, 8).map((b) => ({
    label: formatLocalTime(b.dt, tzOffsetSeconds, {
      hour: 'numeric',
      hour12: false,
    }),
    popPct: Math.round((b.pop ?? 0) * 100),
  }));

  return (
    <section className="glass-card rounded-2xl p-4">
      <h3 className="text-xs font-semibold tracking-[0.18em] uppercase text-white/70 mb-3">
        Precipitation Chance
      </h3>
      <div className="h-40 -ml-2 -mr-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
              width={36}
              tickFormatter={(v) => `${v}%`}
              domain={[0, 100]}
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
              formatter={(value: number) => [`${value}%`, 'Chance']}
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            />
            <Bar dataKey="popPct" radius={[6, 6, 0, 0]}>
              {data.map((d, i) => {
                const intensity = d.popPct / 100;
                const color =
                  d.popPct === 0
                    ? '#475569'
                    : `rgba(96,165,250, ${0.35 + intensity * 0.6})`;
                return <Cell key={`cell-${i}`} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
