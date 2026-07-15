import React from 'react';
import { MapPin, Sun, CloudSun, Cloud, CloudRain, CloudSnow, CloudLightning, Wind } from 'lucide-react';
import { WeatherLocation } from '../../config/app';

interface WeatherCurrent {
  temperature_2m: number;
  weather_code: number;
  wind_speed_10m: number;
}

interface DashboardWeatherWidgetProps {
  location: WeatherLocation;
  loading: boolean;
  error: boolean;
  weather: { current: WeatherCurrent } | null;
  className?: string;
  compact?: boolean;
  bare?: boolean;
}

const getConditionLabel = (code: number): string => {
  if (code === 0) return 'Bezchmurnie';
  if (code <= 3) return 'Częściowe zachmurzenie';
  if (code <= 48) return 'Zachmurzenie';
  if (code <= 55) return 'Mżawka';
  if (code <= 67) return 'Deszcz';
  if (code <= 77) return 'Śnieg';
  if (code <= 82) return 'Przelotne opady';
  return 'Burza';
};

const WeatherIcon = ({ code, className = 'h-8 w-8' }: { code: number; className?: string }) => {
  const stroke = 1.75;
  if (code === 0) return <Sun className={`${className} text-amber-500`} strokeWidth={stroke} aria-hidden />;
  if (code <= 3) return <CloudSun className={className} strokeWidth={stroke} aria-hidden />;
  if (code <= 48) return <Cloud className={className} strokeWidth={stroke} aria-hidden />;
  if (code <= 67) return <CloudRain className={className} strokeWidth={stroke} aria-hidden />;
  if (code <= 77) return <CloudSnow className={`${className} text-sky-400`} strokeWidth={stroke} aria-hidden />;
  return <CloudLightning className={`${className} text-violet-600`} strokeWidth={stroke} aria-hidden />;
};

export const DashboardWeatherWidget = ({
  location,
  loading,
  error,
  weather,
  className = '',
  compact = false,
  bare = false,
}: DashboardWeatherWidgetProps) => {
  const isBare = bare || compact;

  return (
    <div
      className={`dashboard-weather ${
        isBare
          ? 'dashboard-weather--bare dashboard-info-block'
          : 'app-panel flex min-h-0 flex-col justify-between border-2 border-black bg-white p-3 sm:p-4'
      } ${className}`}
    >
      <p className="dashboard-info-block__kicker">Pogoda</p>

      {loading ? (
        <div className="dashboard-weather__skeleton flex animate-pulse flex-col gap-2">
          <div className="h-3 w-20 rounded bg-black/8" />
          <div className="h-9 w-14 rounded bg-black/8" />
        </div>
      ) : error ? (
        <p className="dashboard-info-block__meta">Brak danych</p>
      ) : weather ? (
        <div className="dashboard-weather__body dashboard-weather__body--bare">
          <div className="min-w-0">
            <div className="dashboard-info-block__meta mb-1 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="truncate">{location.name}</span>
            </div>
            <p className="dashboard-weather__temp">{Math.round(weather.current.temperature_2m)}°</p>
            <p className="dashboard-info-block__meta mt-1 truncate">{getConditionLabel(weather.current.weather_code)}</p>
          </div>
          <div className="shrink-0 text-right">
            <WeatherIcon code={weather.current.weather_code} />
            <p className="dashboard-info-block__meta mt-1 flex items-center justify-end gap-1">
              <Wind className="h-3.5 w-3.5" aria-hidden />
              {weather.current.wind_speed_10m}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};
