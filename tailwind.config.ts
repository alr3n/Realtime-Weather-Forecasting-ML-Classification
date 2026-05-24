import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
        mono: ['"Space Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        'bg-deep': 'var(--bg-deep)',
        'bg-mid': 'var(--bg-mid)',
        'bg-surface': 'var(--bg-surface)',
        'bg-glass': 'var(--bg-glass)',
        'bg-glass-active': 'var(--bg-glass-active)',
        'bg-card': 'var(--bg-card)',
        'bg-pill-active': 'var(--bg-pill-active)',
        'border-glass': 'var(--border-glass)',
        'border-card': 'var(--border-card)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'text-pill-active': 'var(--text-pill-active)',
        'accent-indigo': 'var(--accent-indigo)',
        'accent-purple': 'var(--accent-purple)',
        'accent-blue': 'var(--accent-blue)',
        'accent-cyan': 'var(--accent-cyan)',
        'sunny': 'var(--color-sunny)',
        'cloudy': 'var(--color-cloudy)',
        'rainy': 'var(--color-rainy)',
        'snowy': 'var(--color-snowy)',
      },
      backgroundImage: {
        'app-gradient': 'linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        'fab-gradient': 'linear-gradient(135deg, #6c63ff, #a78bfa)',
      },
      borderRadius: {
        '2.5xl': '1.25rem',
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'rain-fall': 'rain-fall 1.2s ease-in infinite',
        'snow-fall': 'snow-fall 3s ease-in infinite',
        'float-cloud': 'float-cloud 3s ease-in-out infinite',
        'sun-spin': 'sun-spin 20s linear infinite',
        'particle-float': 'particle-float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
