import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ViewMode } from '../types';

interface AppSettings {
  viewMode: ViewMode;
  isCompactMode: boolean;
  showWeekends: boolean;
  userName: string;
  setViewMode: (mode: ViewMode) => void;
  setIsCompactMode: (isCompact: boolean) => void;
  setShowWeekends: (show: boolean) => void;
  setUserName: (name: string) => void;
}

const AppContext = createContext<AppSettings | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize from localStorage or defaults
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

  // Persistence wrappers
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

  return (
    <AppContext.Provider value={{ 
      viewMode, 
      isCompactMode, 
      showWeekends, 
      userName,
      setViewMode, 
      setIsCompactMode, 
      setShowWeekends,
      setUserName
    }}>
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
