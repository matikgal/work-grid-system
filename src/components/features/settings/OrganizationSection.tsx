import React from 'react';
import { MapPin } from 'lucide-react';
import { PAULINKA_STORES, findStoreByWeatherLocation, storeToWeatherLocation } from '../../../config/stores';
import type { WeatherLocation } from '../../../config/app';
import { SettingsSection } from './SettingsSection';
import { cn } from '../../../utils';

interface OrganizationSectionProps {
  weatherLocation: WeatherLocation;
  onWeatherLocationChange: (location: WeatherLocation) => void;
}

export const OrganizationSection: React.FC<OrganizationSectionProps> = ({
  weatherLocation,
  onWeatherLocationChange,
}) => {
  const activeStore = findStoreByWeatherLocation(weatherLocation);

  return (
    <SettingsSection
      title="Twój sklep"
      subtitle="Pogoda na pulpicie — wybierz lokalizację z sieci Paulinka"
      icon={MapPin}
      accent="#0ea5e9"
    >
      <p className="settings-hint mb-3">
        Wybierz sklep, przy którym pracujesz. Na pulpicie zobaczysz pogodę dla tej miejscowości.
      </p>

      <div className="settings-store-grid" role="listbox" aria-label="Wybierz sklep">
        {PAULINKA_STORES.map((store) => {
          const isActive = activeStore?.storeId === store.storeId;

          return (
            <button
              key={store.storeId}
              type="button"
              role="option"
              aria-selected={isActive}
              onClick={() => onWeatherLocationChange(storeToWeatherLocation(store))}
              className={cn('settings-store-card cursor-pointer text-left', isActive && 'settings-store-card--active')}
            >
              <span className="settings-store-card__num">S.{store.number}</span>
              <span className="settings-store-card__city">{store.city}</span>
              <span className="settings-store-card__addr">{store.address}</span>
            </button>
          );
        })}
      </div>
    </SettingsSection>
  );
};
