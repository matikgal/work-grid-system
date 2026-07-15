import { useCallback } from 'react';

/**
 * Hover „spotlight" — śledzi kursor i ustawia zmienne --mx/--my na elemencie.
 * CSS (.dash-spotlight::before) rysuje w tym miejscu miękki rozbłysk.
 * Dyskretny, „fizyczny" efekt zamiast typowego AI-owego unoszenia.
 */
export function useSpotlight() {
  return useCallback((e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    target.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    target.style.setProperty('--my', `${e.clientY - rect.top}px`);
  }, []);
}
