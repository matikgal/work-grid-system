export interface WeatherLocation {
  name: string;
  latitude: number;
  longitude: number;
  /** Id sklepu Paulinka — ustawienia pogody */
  storeId?: string;
}

/** Sklep sieci Paulinka — lokalizacja pogody na pulpicie (wg paulinka.pl + sieć 14) */
export type PaulinkaStore = WeatherLocation & {
  storeId: string;
  number: number;
  city: string;
  address: string;
};

export const PAULINKA_STORES: PaulinkaStore[] = [
  {
    storeId: 'kobiernice-zywiecka-10a',
    number: 1,
    city: 'Kobiernice',
    address: 'Żywiecka 10a',
    name: 'Kobiernice · Żywiecka 10a',
    latitude: 49.7897,
    longitude: 19.0765,
  },
  {
    storeId: 'dankowice-witosa-18',
    number: 2,
    city: 'Dankowice',
    address: 'Witosa 18',
    name: 'Dankowice · Witosa 18',
    latitude: 49.8165,
    longitude: 19.0338,
  },
  {
    storeId: 'pisarzowice-bielska-12a',
    number: 3,
    city: 'Pisarzowice',
    address: 'Bielska 12a',
    name: 'Pisarzowice · Bielska 12a',
    latitude: 49.8052,
    longitude: 19.1098,
  },
  {
    storeId: 'bujakow-bielska-28a',
    number: 4,
    city: 'Bujaków',
    address: 'Bielska 28a',
    name: 'Bujaków · Bielska 28a',
    latitude: 49.8261,
    longitude: 19.0654,
  },
  {
    storeId: 'bielsko-daszynskiego-103',
    number: 5,
    city: 'Bielsko-Biała',
    address: 'Daszyńskiego 103',
    name: 'Bielsko-Biała · Daszyńskiego 103',
    latitude: 49.8282,
    longitude: 19.0621,
  },
  {
    storeId: 'kozy-beskidzka-6',
    number: 6,
    city: 'Kozy',
    address: 'Beskidzka 6',
    name: 'Kozy · Beskidzka 6',
    latitude: 49.8512,
    longitude: 19.1394,
  },
  {
    storeId: 'kozy-bielska-57',
    number: 7,
    city: 'Kozy',
    address: 'Bielska 57',
    name: 'Kozy · Bielska 57',
    latitude: 49.8494,
    longitude: 19.1352,
  },
  {
    storeId: 'kety-sikorskiego-9',
    number: 8,
    city: 'Kęty',
    address: 'os. Sikorskiego 9',
    name: 'Kęty · os. Sikorskiego 9',
    latitude: 49.8823,
    longitude: 19.2131,
  },
  {
    storeId: 'bielsko-wyzwolenia-452',
    number: 9,
    city: 'Bielsko-Biała',
    address: 'Wyzwolenia 452',
    name: 'Bielsko-Biała · Wyzwolenia 452',
    latitude: 49.8354,
    longitude: 19.0482,
  },
  {
    storeId: 'kety-700-lecia',
    number: 10,
    city: 'Kęty',
    address: 'os. 700-lecia',
    name: 'Kęty · os. 700-lecia',
    latitude: 49.8812,
    longitude: 19.2184,
  },
  {
    storeId: 'bielsko-wyzwolenia-285',
    number: 11,
    city: 'Bielsko-Biała',
    address: 'Wyzwolenia 285',
    name: 'Bielsko-Biała · Wyzwolenia 285',
    latitude: 49.8316,
    longitude: 19.0524,
  },
  {
    storeId: 'kozy-dworcowa-11',
    number: 12,
    city: 'Kozy',
    address: 'Dworcowa 11',
    name: 'Kozy · Dworcowa 11',
    latitude: 49.8521,
    longitude: 19.1418,
  },
  {
    storeId: 'bielsko-halcnowska-154',
    number: 13,
    city: 'Bielsko-Biała',
    address: 'Hałcnowska 154',
    name: 'Bielsko-Biała · Hałcnowska 154',
    latitude: 49.8483,
    longitude: 19.0786,
  },
  {
    storeId: 'kozy-zywiecka-58h',
    number: 14,
    city: 'Kozy',
    address: 'Żywiecka 58H',
    name: 'Kozy · Polskie Delikatesy Żywiecka 58H',
    latitude: 49.8508,
    longitude: 19.1376,
  },
];

export const DEFAULT_PAULINKA_STORE = PAULINKA_STORES[0];

export function findStoreById(storeId?: string | null): PaulinkaStore | undefined {
  if (!storeId) return undefined;
  return PAULINKA_STORES.find((s) => s.storeId === storeId);
}

export function findStoreByWeatherLocation(location: WeatherLocation): PaulinkaStore | undefined {
  if (location.storeId) {
    const byId = findStoreById(location.storeId);
    if (byId) return byId;
  }
  return PAULINKA_STORES.find(
    (s) =>
      s.latitude === location.latitude &&
      s.longitude === location.longitude &&
      s.name === location.name,
  );
}

export function normalizeWeatherLocation(location: WeatherLocation): PaulinkaStore {
  const matched = findStoreByWeatherLocation(location);
  if (matched) return matched;
  return DEFAULT_PAULINKA_STORE;
}

export function storeToWeatherLocation(store: PaulinkaStore): WeatherLocation {
  return {
    storeId: store.storeId,
    name: store.name,
    latitude: store.latitude,
    longitude: store.longitude,
  };
}
