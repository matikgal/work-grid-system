import {
  DEFAULT_PAULINKA_STORE,
  PAULINKA_STORES,
  storeToWeatherLocation,
  type WeatherLocation,
} from './stores';

export type { WeatherLocation } from './stores';
export {
  PAULINKA_STORES,
  DEFAULT_PAULINKA_STORE,
  storeToWeatherLocation,
  normalizeWeatherLocation,
  findStoreByWeatherLocation,
} from './stores';

export const APP_CONFIG = {
  APP_NAME: 'Grafik Pracy',
  APP_SHORT_NAME: 'Grafik Pracy',
  /** Tytuł w nagłówku aplikacji i karcie przeglądarki */
  APP_HEADER_TITLE: 'Grafik Pracy',
  APP_TAGLINE: 'Grafiki, urlopy i zamówienia — panel kierownika sklepu',
  APP_VERSION: '2.6.0',
  APP_BUILD: '2026',
  APP_AUTHOR: 'Mateusz Gałuszka',
  APP_AUTHOR_URL: 'https://github.com/matikgal',
  APP_YEAR: new Date().getFullYear(),
  APP_DESCRIPTION:
    'Narzędzie dla kierowników sklepów: grafik zmian, urlopy, zamówienia towaru.',
  LOGO_PATH: '/icons/favicon.svg',
  THEME_COLOR: '#1e293b',
  /** Liczba sklepów w module zamówień (kolumny S.1 … S.N) */
  ORDER_SHOP_COUNT: 14,
  WEATHER_DEFAULT: storeToWeatherLocation(DEFAULT_PAULINKA_STORE) satisfies WeatherLocation,
  /** @deprecated Użyj PAULINKA_STORES */
  WEATHER_PRESETS: PAULINKA_STORES.map(storeToWeatherLocation),
};

/** Pliki z folderu `public/` — uwzględnia `base` Vite (np. GitHub Pages). */
export function publicAssetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}

export const getOrderShopNumbers = (): number[] =>
  Array.from({ length: APP_CONFIG.ORDER_SHOP_COUNT }, (_, i) => i + 1);

export function buildWeatherForecastUrl(location: WeatherLocation): string {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current: 'temperature_2m,weather_code,wind_speed_10m',
    timezone: 'auto',
  });
  return `https://api.open-meteo.com/v1/forecast?${params}`;
}
