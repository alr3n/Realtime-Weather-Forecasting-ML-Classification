'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWeather } from '@/hooks/useWeather';
import { usePrediction } from '@/hooks/usePrediction';
import type { LocationKind, Units } from '@/types/weather';
import CurrentWeatherCard from './CurrentWeatherCard';
import HourlyForecastStrip from './HourlyForecastStrip';
import WeeklyForecastList from './WeeklyForecastList';
import MLPredictionPanel from './MLPredictionPanel';
import WeatherMetricsGrid from './WeatherMetricsGrid';
import ForecastChart from './ForecastChart';
import HourlyChart from './HourlyChart';
import LocationSearch from './LocationSearch';
import { DashboardSkeleton } from './LoadingSkeleton';

const DEFAULT_CITY = process.env.NEXT_PUBLIC_DEFAULT_CITY ?? 'Manila';

type Tab = 'hourly' | 'weekly';

export default function WeatherDashboard() {
  const [city, setCity] = useState<string>(DEFAULT_CITY);
  const [units, setUnits] = useState<Units>('metric');
  const [locationKind, setLocationKind] = useState<LocationKind>('inland');
  const [searchOpen, setSearchOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('hourly');

  // Persist user choices in localStorage (best-effort; SSR-safe).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const c = window.localStorage.getItem('wfx.city');
      const u = window.localStorage.getItem('wfx.units');
      const l = window.localStorage.getItem('wfx.location');
      if (c) setCity(c);
      if (u === 'metric' || u === 'imperial') setUnits(u);
      if (l === 'inland' || l === 'coastal' || l === 'mountain') setLocationKind(l);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem('wfx.city', city);
      window.localStorage.setItem('wfx.units', units);
      window.localStorage.setItem('wfx.location', locationKind);
    } catch {
      // ignore
    }
  }, [city, units, locationKind]);

  const { data, error, isLoading } = useWeather({ city, units, locationKind });
  const { data: prediction, isLoading: predLoading } = usePrediction(
    data?.mlFeatures
  );

  if (error) {
    return (
      <div className="mx-auto max-w-md px-6 pt-24 text-center">
        <AlertTriangle size={32} className="mx-auto mb-3 text-amber-400" />
        <h2 className="text-lg font-semibold mb-2">Couldn&apos;t load weather</h2>
        <p className="text-sm text-white/60 mb-6">{error.message}</p>
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="px-5 py-2.5 rounded-full bg-fab-gradient text-white text-sm font-semibold"
        >
          Try another city
        </button>
        <LocationSearch
          open={searchOpen}
          units={units}
          locationKind={locationKind}
          onSelect={(c) => {
            setCity(c);
            setSearchOpen(false);
          }}
          onClose={() => setSearchOpen(false)}
          onLocationKindChange={setLocationKind}
        />
      </div>
    );
  }

  if (isLoading || !data) {
    return <DashboardSkeleton />;
  }

  const popToday = data.hourly.length
    ? Math.max(...data.hourly.slice(0, 4).map((b) => b.pop ?? 0))
    : 0;

  return (
    <>
      <div className="relative mx-auto max-w-md px-5 pt-8 pb-16">
        {/* Top units toggle */}
        <div className="absolute right-5 top-3 z-10">
          <button
            type="button"
            onClick={() => setUnits(units === 'metric' ? 'imperial' : 'metric')}
            className="text-[11px] font-semibold tracking-wider uppercase px-3 py-1.5 rounded-full glass text-white/70 hover:text-white"
            aria-label="Toggle units"
          >
            {units === 'metric' ? '°C / km/h' : '°F / km/h'}
          </button>
        </div>

        <CurrentWeatherCard
          current={data.current}
          units={units}
        />

        {/* Tab bar */}
        <div className="mt-8 mb-4">
          <div className="glass rounded-full p-1 grid grid-cols-2 text-sm font-semibold">
            <button
              type="button"
              onClick={() => setTab('hourly')}
              className={cn(
                'rounded-full py-2.5 transition-colors',
                tab === 'hourly'
                  ? 'bg-white text-[#1a1a2e]'
                  : 'text-white/65 hover:text-white'
              )}
            >
              Hourly Forecast
            </button>
            <button
              type="button"
              onClick={() => setTab('weekly')}
              className={cn(
                'rounded-full py-2.5 transition-colors',
                tab === 'weekly'
                  ? 'bg-white text-[#1a1a2e]'
                  : 'text-white/65 hover:text-white'
              )}
            >
              Weekly Forecast
            </button>
          </div>
        </div>

        {/* Tab content */}
        <div key={tab} className="animate-fade-in space-y-5">
          {tab === 'hourly' ? (
            <>
              <HourlyForecastStrip
                hourly={data.hourly}
                tzOffsetSeconds={data.current.timezone}
                units={units}
                currentTemp={data.current.temp}
              />
              <ForecastChart
                hourly={data.hourly}
                tzOffsetSeconds={data.current.timezone}
                units={units}
              />
              <HourlyChart
                hourly={data.hourly}
                tzOffsetSeconds={data.current.timezone}
              />
            </>
          ) : (
            <WeeklyForecastList
              daily={data.daily}
              tzOffsetSeconds={data.current.timezone}
              units={units}
            />
          )}
        </div>

        <div className="mt-5">
          <MLPredictionPanel prediction={prediction} isLoading={predLoading} />
        </div>

        <div className="mt-5">
          <WeatherMetricsGrid
            current={data.current}
            units={units}
            uvIndex={data.mlFeatures['UV Index']}
            popToday={popToday}
          />
        </div>

        <p className="mt-8 text-center text-[11px] text-white/30">
          Powered by OpenWeatherMap · ML by XGBoost · Alren Grampon
        </p>
      </div>

      {/* Minimal bottom settings button */}
      <div className="fixed inset-x-0 bottom-0 z-40 pointer-events-none">
        <div className="mx-auto max-w-md px-5 pb-[max(env(safe-area-inset-bottom),0.75rem)] flex justify-end">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Settings"
            className="pointer-events-auto p-2.5 rounded-full glass text-white/55 hover:text-white hover:bg-white/10 transition-colors shadow-[0_4px_20px_rgba(15,12,41,0.5)]"
          >
            <Settings2 size={19} />
          </button>
        </div>
      </div>

      <LocationSearch
        open={searchOpen}
        units={units}
        locationKind={locationKind}
        onSelect={(c) => {
          setCity(c);
          setSearchOpen(false);
        }}
        onClose={() => setSearchOpen(false)}
        onLocationKindChange={setLocationKind}
      />
    </>
  );
}
