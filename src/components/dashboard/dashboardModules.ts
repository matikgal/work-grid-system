import {
  CalendarCheck2,
  Users,
  Settings,
  Palmtree,
  ShoppingBag,
  Coffee,
  Phone,
  MessageSquare,
  Building2,
  BookOpen,
  type LucideIcon,
} from 'lucide-react';

export type DashboardModuleId =
  | 'schedule'
  | 'vacations'
  | 'orders'
  | 'employees'
  | 'phones'
  | 'free-saturdays'
  | 'chat'
  | 'network'
  | 'instructions'
  | 'settings';

export const MODULE_ACCENTS: Record<DashboardModuleId, string> = {
  schedule: '#059669',
  vacations: '#0284c7',
  orders: '#d97706',
  employees: '#7c3aed',
  phones: '#db2777',
  'free-saturdays': '#ca8a04',
  chat: '#0d9488',
  network: '#4f46e5',
  instructions: '#64748b',
  settings: '#475569',
};

export const MODULE_ICONS: Record<DashboardModuleId, LucideIcon> = {
  schedule: CalendarCheck2,
  vacations: Palmtree,
  orders: ShoppingBag,
  employees: Users,
  phones: Phone,
  'free-saturdays': Coffee,
  chat: MessageSquare,
  network: Building2,
  instructions: BookOpen,
  settings: Settings,
};
