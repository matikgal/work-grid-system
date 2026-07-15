import { createContext, useContext } from 'react';

type LayoutMenuContextValue = {
  toggleMenu: () => void;
};

export const LayoutMenuContext = createContext<LayoutMenuContextValue | null>(null);

export function useLayoutMenu() {
  const ctx = useContext(LayoutMenuContext);
  if (!ctx) {
    return { toggleMenu: () => {} };
  }
  return ctx;
}
