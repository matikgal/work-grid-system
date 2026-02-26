import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, MapPin, Wind } from '@phosphor-icons/react';

export const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<any>(null);

  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=49.8225&longitude=19.0444&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto')
      .then(res => res.json())
      .then(data => {
        setWeather(data);
      })
      .catch(err => console.error(err));
  }, []);

  const getWeatherIcon = (code: number) => {
    const className = "w-10 h-10 text-slate-700 dark:text-slate-200";
    if (code === 0) return <Sun className={className} weight="fill" />;
    if (code >= 51 && code <= 67) return <CloudRain className={className} weight="fill" />;
    if (code >= 71) return <CloudSnow className={className} weight="fill" />;
    return <Cloud className={className} weight="fill" />;
  };

  return (
    <div className="md:col-span-2 min-h-[220px] md:min-h-0 h-full bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-950 rounded-[2rem] p-6 border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between w-full">
            <div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    <MapPin className="w-3.5 h-3.5" weight="fill" />
                    Bielsko-Biała
                </div>
                <div className="flex items-baseline gap-4">
                    <span className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter">
                        {weather?.current?.temperature_2m ? Math.round(weather.current.temperature_2m) : '--'}°
                    </span>
                    {weather?.current?.wind_speed_10m && (
                        <span className="flex items-center gap-1.5 text-xs md:text-sm font-bold text-gray-500 bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                            <Wind className="w-3.5 h-3.5" weight="bold" />
                            {weather.current.wind_speed_10m} km/h
                        </span>
                    )}
                </div>
            </div>
            <div className="relative z-10 scale-110 transform p-2">
                {getWeatherIcon(weather?.current?.weather_code || 0)}
            </div>
        </div>

        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100 dark:border-slate-800/50 w-full">
            <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-gray-400">Wilgotność</span>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                   92%
                </span>
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-gray-400">Ciśnienie</span>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                   1015 hPa
                </span>
            </div>
             <div className="flex flex-col ml-auto text-right md:text-left">
                <span className="text-[10px] uppercase font-bold text-indigo-500">Jakość</span>
                <span className="text-sm font-bold text-emerald-500">
                   Dobra
                </span>
            </div>
        </div>
    </div>
  );
};
