import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Realtime Weather Forecasting & ML Classification',
  description:
    'Live weather + 5-day forecast for any city, with an XGBoost ML model classifying the conditions into Sunny / Cloudy / Rainy / Snowy.',
  applicationName: 'Weather Forecast & ML',
  authors: [{ name: 'Alren Grampon' }],   
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Weather',
  },
  icons: {
    icon: '/favicon.ico',          
  },
};

export const viewport: Viewport = {
  themeColor: '#0f0c29',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}