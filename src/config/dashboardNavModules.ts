import {
  Palmtree,
  ShoppingBag,
  Users,
  Phone,
  Coffee,
  MessageSquare,
  Store,
  BookOpen,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export type DashboardNavModuleId =
  | 'vacations'
  | 'orders'
  | 'employees'
  | 'phones'
  | 'free-saturdays'
  | 'chat'
  | 'network'
  | 'instructions'
  | 'settings';

export type DashboardNavModule = {
  id: DashboardNavModuleId;
  title: string;
  subtitle: string;
  path: string;
  icon: LucideIcon;
};

export const DASHBOARD_NAV_MODULES: DashboardNavModule[] = [
  {
    id: 'vacations',
    title: 'Urlopy',
    subtitle: 'Salda i nieobecności',
    path: '/vacations',
    icon: Palmtree,
  },
  {
    id: 'orders',
    title: 'Zamówienia',
    subtitle: 'Zestawienia dla sklepów',
    path: '/orders',
    icon: ShoppingBag,
  },
  {
    id: 'employees',
    title: 'Pracownicy',
    subtitle: 'Lista kadry',
    path: '/employees',
    icon: Users,
  },
  {
    id: 'phones',
    title: 'Telefony',
    subtitle: 'Książka telefoniczna',
    path: '/phones',
    icon: Phone,
  },
  {
    id: 'free-saturdays',
    title: 'Wolne soboty',
    subtitle: 'Roczne wolne soboty',
    path: '/free-saturdays',
    icon: Coffee,
  },
  {
    id: 'chat',
    title: 'Czat',
    subtitle: 'Wiadomości między sklepami',
    path: '/chat',
    icon: MessageSquare,
  },
  {
    id: 'network',
    title: 'Sieć sklepów',
    subtitle: 'Panel całej sieci',
    path: '/network',
    icon: Store,
  },
  {
    id: 'instructions',
    title: 'Instrukcja',
    subtitle: 'Opis modułów',
    path: '/instructions',
    icon: BookOpen,
  },
  {
    id: 'settings',
    title: 'Ustawienia',
    subtitle: 'Pogoda i konfiguracja',
    path: '/settings',
    icon: Settings,
  },
];
