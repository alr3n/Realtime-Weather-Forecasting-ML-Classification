import WeatherDashboard from '@/components/WeatherDashboard';

export const metadata = {
  title: 'Dashboard · Weather Forecast ML',
  description: 'Real-time weather with ML-powered classification.',
};

export default function DashboardPage() {
  return (
    <main className="relative min-h-screen starfield">
      <WeatherDashboard />
    </main>
  );
}
