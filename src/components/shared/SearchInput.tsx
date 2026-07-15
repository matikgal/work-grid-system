import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '../../utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  'aria-label'?: string;
}

/** Ujednolicone pole wyszukiwania z ikoną lupy. */
export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Szukaj...',
  className,
  'aria-label': ariaLabel,
}) => (
  <div className={cn('dash-search', className)}>
    <Search className="dash-search__icon" strokeWidth={2.5} aria-hidden />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={ariaLabel ?? placeholder}
      className="dash-search__input"
    />
  </div>
);
