'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Search, Mountain, Waves, TreePine } from 'lucide-react';
import WeatherConditionIcon, {
  mapMainToCondition,
} from './WeatherConditionIcon';
import { useWeather } from '@/hooks/useWeather';
import { cn, roundTemp, degSymbol } from '@/lib/utils';
import type { LocationKind, Units } from '@/types/weather';

interface Props {
  open: boolean;
  units: Units;
  locationKind: LocationKind;
  onSelect: (city: string) => void;
  onClose: () => void;
  onLocationKindChange: (kind: LocationKind) => void;
}

interface QuickCity {
  city: string;
  country: string;
}

const QUICK_CITIES: QuickCity[] = [
  { city: 'Montreal', country: 'Canada' },
  { city: 'Tokyo', country: 'Japan' },
  { city: 'Taipei', country: 'Taiwan' },
  { city: 'Toronto', country: 'Canada' },
  { city: 'London', country: 'UK' },
  { city: 'Sydney', country: 'Australia' },
];

export default function LocationSearch({
  open,
  units,
  locationKind,
  onSelect,
  onClose,
  onLocationKindChange,
}: Props) {
  const [query, setQuery] = useState('');

  // Lock body scroll while overlay is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const trimmedQuery = query.trim();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pick location"
      className={cn(
        'fixed inset-0 z-50 overflow-y-auto',
        'bg-app-gradient starfield',
        'animate-fade-in'
      )}
    >
      <div className="mx-auto max-w-md px-5 pt-8 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 -ml-2 rounded-full text-white/80 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-[18px] font-semibold tracking-wide">Pick Location</h1>
          <span className="w-9" />
        </div>

        <p className="text-center text-sm text-white/60 leading-relaxed mb-6 px-4">
          Find the area or city you want to know the detailed weather info at this time.
        </p>

        {/* Search bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (trimmedQuery) {
              onSelect(trimmedQuery);
            }
          }}
          className="mb-6"
        >
          <label className="relative block">
            <span className="sr-only">Search city</span>
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className={cn(
                'w-full glass rounded-full',
                'pl-11 pr-12 py-3.5 text-sm',
                'placeholder:text-white/40',
                'focus:outline-none focus:ring-2 focus:ring-accent-indigo/60 focus:border-accent-indigo'
              )}
              autoFocus
            />
            <button
              type="submit"
              aria-label="Go"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-fab-gradient flex items-center justify-center text-white shadow-[0_4px_14px_rgba(108,99,255,0.5)]"
            >
              <Search size={16} />
            </button>
          </label>
        </form>

        {/* Location kind picker — sets the ML Location feature */}
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.18em] text-white/40 mb-2 px-1">
            Location type (for ML model)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <KindButton
              active={locationKind === 'inland'}
              onClick={() => onLocationKindChange('inland')}
              icon={<TreePine size={16} />}
              label="Inland"
            />
            <KindButton
              active={locationKind === 'coastal'}
              onClick={() => onLocationKindChange('coastal')}
              icon={<Waves size={16} />}
              label="Coastal"
            />
            <KindButton
              active={locationKind === 'mountain'}
              onClick={() => onLocationKindChange('mountain')}
              icon={<Mountain size={16} />}
              label="Mountain"
            />
          </div>
        </div>

        {/* Quick city grid */}
        <p className="text-xs uppercase tracking-[0.18em] text-white/40 mb-3 px-1">
          Popular cities
        </p>
        <div className="grid grid-cols-2 gap-3">
          {QUICK_CITIES.map((c) => (
            <CityCard
              key={c.city}
              city={c.city}
              country={c.country}
              units={units}
              locationKind={locationKind}
              onSelect={() => onSelect(c.city)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function KindButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center justify-center gap-1.5 rounded-2xl py-2.5 text-sm font-semibold transition-colors',
        active
          ? 'bg-white text-[#1a1a2e]'
          : 'glass-card text-white/80 hover:bg-white/10'
      )}
    >
      {icon}
      {label}
    </button>
  );
}

/**
 * Live mini-weather preview card. Calls the same SWR hook so the user sees
 * actual temperatures rather than placeholder data.
 */
function CityCard({
  city,
  country,
  units,
  locationKind,
  onSelect,
}: {
  city: string;
  country: string;
  units: Units;
  locationKind: LocationKind;
  onSelect: () => void;
}) {
  const { data, error } = useWeather({ city, units, locationKind });

  const condition = useMemo(
    () => mapMainToCondition(data?.current.main),
    [data?.current.main]
  );

  const temp = data ? roundTemp(data.current.temp) : null;
  const lo = data ? roundTemp(data.current.tempMin) : null;
  const hi = data ? roundTemp(data.current.tempMax) : null;
  const sym = degSymbol(units);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'glass-card rounded-2xl p-4 text-left',
        'hover:bg-white/[0.09] transition-colors',
        'flex flex-col gap-2'
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-temp text-2xl">
          {temp !== null ? `${temp}${sym}` : error ? '—' : '··'}
        </span>
        <WeatherConditionIcon condition={condition} size="md" />
      </div>
      <div className="text-xs text-white/50">
        {hi !== null && lo !== null ? (
          <>
            H:{hi}
            {sym} L:{lo}
            {sym}
          </>
        ) : (
          'Loading...'
        )}
      </div>
      <div className="text-sm">
        <div className="font-semibold leading-tight">{city}</div>
        <div className="text-white/40 text-xs">{country}</div>
      </div>
    </button>
  );
}
