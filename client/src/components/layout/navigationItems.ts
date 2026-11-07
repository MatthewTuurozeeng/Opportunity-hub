import {
  BarChart3,
  Briefcase,
  CalendarDays,
  FileText,
  LayoutDashboard,
  type LucideIcon,
  Mail,
  NotebookPen,
  Settings,
} from 'lucide-react'

import { ROUTE_PATHS, type RoutePath } from '@/routes/routePaths'

export interface NavigationItem {
  label: string
  path: RoutePath
  icon: LucideIcon
  /** Tinted chip behind the icon: background and icon color. */
  iconClassName: string
}

export const NAVIGATION_ITEMS: readonly NavigationItem[] = [
  { label: 'Dashboard', path: ROUTE_PATHS.DASHBOARD, icon: LayoutDashboard, iconClassName: 'bg-blue-100 text-blue-600' },
  { label: 'Applications', path: ROUTE_PATHS.APPLICATIONS, icon: Briefcase, iconClassName: 'bg-violet-100 text-violet-600' },
  { label: 'Document Library', path: ROUTE_PATHS.DOCUMENTS, icon: FileText, iconClassName: 'bg-amber-100 text-amber-700' },
  { label: 'Communications', path: ROUTE_PATHS.COMMUNICATIONS, icon: Mail, iconClassName: 'bg-cyan-100 text-cyan-700' },
  { label: 'Calendar & Timeline', path: ROUTE_PATHS.CALENDAR, icon: CalendarDays, iconClassName: 'bg-rose-100 text-rose-600' },
  { label: 'Analytics', path: ROUTE_PATHS.ANALYTICS, icon: BarChart3, iconClassName: 'bg-emerald-100 text-emerald-700' },
  { label: 'Notes & Reflections', path: ROUTE_PATHS.NOTES, icon: NotebookPen, iconClassName: 'bg-orange-100 text-orange-700' },
  { label: 'Settings', path: ROUTE_PATHS.SETTINGS, icon: Settings, iconClassName: 'bg-slate-100 text-slate-600' },
]
