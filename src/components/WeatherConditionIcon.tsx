'use client';

import { cn } from '@/lib/utils';

export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'storm' | 'mist';
export type IconSize = 'sm' | 'md' | 'lg' | 'xl';

const SIZE_PX: Record<IconSize, number> = {
  sm: 28,
  md: 48,
  lg: 80,
  xl: 160,
};

interface Props {
  condition: WeatherCondition;
  size?: IconSize;
  className?: string;
  title?: string;
}

/**
 * Map an OWM "main" group or our ML label to the illustration we render.
 */
export function mapMainToCondition(main: string | null | undefined): WeatherCondition {
  if (!main) return 'sunny';
  const m = main.toLowerCase();
  if (m.includes('thunder')) return 'storm';
  if (m.includes('snow')) return 'snowy';
  if (m.includes('rain') || m.includes('drizzle')) return 'rainy';
  if (m.includes('cloud')) return 'cloudy';
  if (m.includes('mist') || m.includes('fog') || m.includes('haze')) return 'mist';
  return 'sunny';
}

export default function WeatherConditionIcon({
  condition,
  size = 'md',
  className,
  title,
}: Props) {
  const px = SIZE_PX[size];
  return (
    <div
      role="img"
      aria-label={title ?? `${condition} weather icon`}
      style={{ width: px, height: px }}
      className={cn('relative inline-block will-anim', className)}
    >
      {condition === 'sunny' && <SunnyIcon px={px} />}
      {condition === 'cloudy' && <CloudyIcon px={px} />}
      {condition === 'rainy' && <RainyIcon px={px} />}
      {condition === 'snowy' && <SnowyIcon px={px} />}
      {condition === 'storm' && <StormIcon px={px} />}
      {condition === 'mist' && <MistIcon px={px} />}
    </div>
  );
}

/* ---------------- Sunny ---------------- */
function SunnyIcon({ px }: { px: number }) {
  return (
    <svg
      viewBox="0 0 160 160"
      width={px}
      height={px}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="sun-glow" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#fde68a" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sun-body" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="60%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
        <filter id="sun-soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>
      {/* Halo */}
      <circle cx="80" cy="80" r="70" fill="url(#sun-glow)" />
      {/* Rotating rays */}
      <g
        style={{
          transformOrigin: '80px 80px',
          animation: 'sun-spin 20s linear infinite',
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 360) / 8;
          return (
            <rect
              key={i}
              x="76"
              y="14"
              width="8"
              height="18"
              rx="4"
              fill="#fcd34d"
              transform={`rotate(${angle} 80 80)`}
            />
          );
        })}
      </g>
      {/* Sun body */}
      <circle cx="80" cy="80" r="34" fill="url(#sun-body)" filter="url(#sun-soft)" />
      <circle cx="80" cy="80" r="32" fill="url(#sun-body)" />
      <circle cx="70" cy="72" r="6" fill="#fef9c3" opacity="0.6" />
    </svg>
  );
}

/* ---------------- Cloudy ---------------- */
function CloudyIcon({ px }: { px: number }) {
  return (
    <svg
      viewBox="0 0 160 160"
      width={px}
      height={px}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="cloud-back" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        <linearGradient id="cloud-front" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
        <filter id="cloud-shadow" x="-20%" y="-20%" width="140%" height="160%">
          <feGaussianBlur stdDeviation="3" />
          <feOffset dy="4" result="o" />
          <feComponentTransfer in="o">
            <feFuncA type="linear" slope="0.35" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g style={{ animation: 'float-cloud 3s ease-in-out infinite' }}>
        {/* Back cloud */}
        <g filter="url(#cloud-shadow)" transform="translate(20,30)">
          <ellipse cx="60" cy="48" rx="44" ry="26" fill="url(#cloud-back)" />
          <ellipse cx="92" cy="42" rx="28" ry="22" fill="url(#cloud-back)" />
          <ellipse cx="32" cy="52" rx="24" ry="18" fill="url(#cloud-back)" />
        </g>
        {/* Front cloud */}
        <g transform="translate(34,52)">
          <ellipse cx="46" cy="36" rx="40" ry="22" fill="url(#cloud-front)" />
          <ellipse cx="74" cy="30" rx="22" ry="18" fill="url(#cloud-front)" />
          <ellipse cx="22" cy="40" rx="20" ry="16" fill="url(#cloud-front)" />
        </g>
      </g>
    </svg>
  );
}

/* ---------------- Rainy ---------------- */
function RainyIcon({ px }: { px: number }) {
  return (
    <svg
      viewBox="0 0 160 160"
      width={px}
      height={px}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="rain-cloud-back" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6c63ff" />
          <stop offset="100%" stopColor="#4338ca" />
        </linearGradient>
        <linearGradient id="rain-cloud-front" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
        <linearGradient id="drop" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
        <filter id="rain-shadow" x="-20%" y="-20%" width="140%" height="160%">
          <feGaussianBlur stdDeviation="3" />
          <feOffset dy="4" result="o" />
          <feComponentTransfer in="o">
            <feFuncA type="linear" slope="0.45" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g style={{ animation: 'float-cloud 4s ease-in-out infinite' }}>
        <g filter="url(#rain-shadow)" transform="translate(20,18)">
          <ellipse cx="60" cy="48" rx="48" ry="28" fill="url(#rain-cloud-back)" />
          <ellipse cx="96" cy="40" rx="28" ry="22" fill="url(#rain-cloud-back)" />
          <ellipse cx="28" cy="52" rx="24" ry="18" fill="url(#rain-cloud-back)" />
        </g>
        <g transform="translate(30,44)">
          <ellipse cx="50" cy="32" rx="42" ry="22" fill="url(#rain-cloud-front)" />
          <ellipse cx="80" cy="26" rx="22" ry="18" fill="url(#rain-cloud-front)" />
          <ellipse cx="22" cy="36" rx="20" ry="16" fill="url(#rain-cloud-front)" />
        </g>
      </g>
      {/* Raindrops */}
      <g>
        {[
          { x: 50, delay: '0s' },
          { x: 70, delay: '0.15s' },
          { x: 90, delay: '0.3s' },
          { x: 110, delay: '0.45s' },
          { x: 60, delay: '0.6s' },
          { x: 100, delay: '0.75s' },
        ].map((d, i) => (
          <path
            key={i}
            d="M0 0 C 0 4, 4 6, 4 10 C 4 13, 0 13, 0 10 C 0 6, -4 4, -4 0 Z"
            transform={`translate(${d.x},110)`}
            fill="url(#drop)"
            style={{
              animation: 'rain-fall 1.2s ease-in infinite',
              animationDelay: d.delay,
              transformOrigin: `${d.x}px 110px`,
            }}
          />
        ))}
      </g>
    </svg>
  );
}

/* ---------------- Snowy ---------------- */
function SnowyIcon({ px }: { px: number }) {
  return (
    <svg
      viewBox="0 0 160 160"
      width={px}
      height={px}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="snow-cloud-back" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="snow-cloud-front" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e0e7ff" />
        </linearGradient>
        <filter id="snow-shadow" x="-20%" y="-20%" width="140%" height="160%">
          <feGaussianBlur stdDeviation="3" />
          <feOffset dy="4" result="o" />
          <feComponentTransfer in="o">
            <feFuncA type="linear" slope="0.4" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g style={{ animation: 'float-cloud 4s ease-in-out infinite' }}>
        <g filter="url(#snow-shadow)" transform="translate(20,20)">
          <ellipse cx="60" cy="48" rx="46" ry="28" fill="url(#snow-cloud-back)" />
          <ellipse cx="94" cy="42" rx="28" ry="22" fill="url(#snow-cloud-back)" />
          <ellipse cx="30" cy="52" rx="24" ry="18" fill="url(#snow-cloud-back)" />
        </g>
        <g transform="translate(30,44)">
          <ellipse cx="50" cy="32" rx="42" ry="22" fill="url(#snow-cloud-front)" />
          <ellipse cx="80" cy="26" rx="22" ry="18" fill="url(#snow-cloud-front)" />
          <ellipse cx="22" cy="36" rx="20" ry="16" fill="url(#snow-cloud-front)" />
        </g>
      </g>
      {/* Snowflakes */}
      <g stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" fill="none">
        {[
          { x: 50, delay: '0s' },
          { x: 70, delay: '0.4s' },
          { x: 90, delay: '0.8s' },
          { x: 60, delay: '1.2s' },
          { x: 100, delay: '1.6s' },
          { x: 80, delay: '2s' },
        ].map((s, i) => (
          <g
            key={i}
            transform={`translate(${s.x},110)`}
            style={{
              animation: 'snow-fall 3s ease-in infinite',
              animationDelay: s.delay,
              transformOrigin: `${s.x}px 110px`,
            }}
          >
            <line x1="-5" y1="0" x2="5" y2="0" />
            <line x1="0" y1="-5" x2="0" y2="5" />
            <line x1="-3.5" y1="-3.5" x2="3.5" y2="3.5" />
            <line x1="-3.5" y1="3.5" x2="3.5" y2="-3.5" />
          </g>
        ))}
      </g>
    </svg>
  );
}

/* ---------------- Storm (bonus, fallback shows lightning + rain) ---------------- */
function StormIcon({ px }: { px: number }) {
  return (
    <svg
      viewBox="0 0 160 160"
      width={px}
      height={px}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="storm-cloud" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id="storm-bolt" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <g style={{ animation: 'float-cloud 3.5s ease-in-out infinite' }}>
        <ellipse cx="80" cy="60" rx="50" ry="28" fill="url(#storm-cloud)" />
        <ellipse cx="106" cy="56" rx="26" ry="20" fill="url(#storm-cloud)" />
        <ellipse cx="48" cy="62" rx="22" ry="18" fill="url(#storm-cloud)" />
      </g>
      <path
        d="M82 86 L60 116 L78 116 L72 142 L100 108 L82 108 L92 86 Z"
        fill="url(#storm-bolt)"
        style={{
          filter: 'drop-shadow(0 0 6px #fbbf24)',
          animation: 'pulse-soft 1.6s ease-in-out infinite',
        }}
      />
    </svg>
  );
}

/* ---------------- Mist / Fog ---------------- */
function MistIcon({ px }: { px: number }) {
  return (
    <svg
      viewBox="0 0 160 160"
      width={px}
      height={px}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" opacity="0.9">
        <line x1="22" y1="50" x2="116" y2="50" />
        <line x1="40" y1="74" x2="138" y2="74" />
        <line x1="14" y1="98" x2="110" y2="98" />
        <line x1="36" y1="122" x2="132" y2="122" />
      </g>
    </svg>
  );
}
