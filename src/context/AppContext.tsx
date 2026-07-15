import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ViewMode } from '../types';
import {
  APP_CONFIG,
  normalizeWeatherLocation,
  storeToWeatherLocation,
  type WeatherLocation,
} from '../config/app';
import { DEFAULT_PROFILE_AVATAR_ID, isProfileAvatarId, type ProfileAvatarId } from '../config/profileAvatars';

interface AppSettings {
  viewMode: ViewMode;
  isCompactMode: boolean;
  showWeekends: boolean;
  userName: string;
  userAvatarId: ProfileAvatarId;
  weatherLocation: WeatherLocation;
  setViewMode: (mode: ViewMode) => void;
  setIsCompactMode: (isCompact: boolean) => void;
  setShowWeekends: (show: boolean) => void;
  setUserName: (name: string) => void;
  setUserAvatarId: (id: ProfileAvatarId) => void;
  setWeatherLocation: (location: WeatherLocation) => void;
}

const WEATHER_STORAGE_KEY = 'grafik_weatherLocation';
const USER_AVATAR_STORAGE_KEY = 'grafik_userAvatarId';

function loadWeatherLocation(): WeatherLocation {
  try {
    const stored = localStorage.getItem(WEATHER_STORAGE_KEY);
    if (stored) {
      return storeToWeatherLocation(normalizeWeatherLocation(JSON.parse(stored) as WeatherLocation));
    }
  } catch {
    /* ignore */
  }
  return APP_CONFIG.WEATHER_DEFAULT;
}

const AppContext = createContext<AppSettings | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    return (localStorage.getItem('grafik_viewMode') as ViewMode) || 'week';
  });

  const [isCompactMode, setIsCompactModeState] = useState(() => {
    return localStorage.getItem('grafik_isCompactMode') === 'true';
  });

  const [showWeekends, setShowWeekendsState] = useState(() => {
    const stored = localStorage.getItem('grafik_showWeekends');
    return stored === null ? true : stored === 'true';
  });

  const [userName, setUserNameState] = useState(() => {
    return localStorage.getItem('grafik_userName') || '';
  });

  const [userAvatarId, setUserAvatarIdState] = useState<ProfileAvatarId>(() => {
    const stored = localStorage.getItem(USER_AVATAR_STORAGE_KEY);
    return stored && isProfileAvatarId(stored) ? stored : DEFAULT_PROFILE_AVATAR_ID;
  });

  const [weatherLocation, setWeatherLocationState] = useState<WeatherLocation>(loadWeatherLocation);

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    localStorage.setItem('grafik_viewMode', mode);
  };

  const setIsCompactMode = (isCompact: boolean) => {
    setIsCompactModeState(isCompact);
    localStorage.setItem('grafik_isCompactMode', String(isCompact));
  };

  const setShowWeekends = (show: boolean) => {
    setShowWeekendsState(show);
    localStorage.setItem('grafik_showWeekends', String(show));
  };

  const setUserName = (name: string) => {
    setUserNameState(name);
    localStorage.setItem('grafik_userName', name);
  };

  const setUserAvatarId = (id: ProfileAvatarId) => {
    setUserAvatarIdState(id);
    localStorage.setItem(USER_AVATAR_STORAGE_KEY, id);
  };

  const setWeatherLocation = (location: WeatherLocation) => {
    const normalized = storeToWeatherLocation(normalizeWeatherLocation(location));
    setWeatherLocationState(normalized);
    localStorage.setItem(WEATHER_STORAGE_KEY, JSON.stringify(normalized));
  };

  return (
    <AppContext.Provider
      value={{
        viewMode,
        isCompactMode,
        showWeekends,
        userName,
        userAvatarId,
        weatherLocation,
        setViewMode,
        setIsCompactMode,
        setShowWeekends,
        setUserName,
        setUserAvatarId,
        setWeatherLocation,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
