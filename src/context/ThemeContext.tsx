import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'grafik-theme';

// Tryb ciemny jest tymczasowo wyłączony — wymuszamy jasny motyw w całej aplikacji.
// Aby ponownie go włączyć, przywróć logikę odczytu/zapisu motywu i usuń to wymuszenie.
const DARK_MODE_ENABLED = false;

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');
    if (window.localStorage) {
      localStorage.setItem(STORAGE_KEY, 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    if (!DARK_MODE_ENABLED) return;
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (t: Theme) => {
    if (!DARK_MODE_ENABLED) return;
    setThemeState(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
