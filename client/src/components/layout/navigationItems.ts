import {
  BarChart3,
  CalendarDays,
  FileText,
  LayoutDashboard,
  type LucideIcon,
  Mail,
  NotebookPen,
  Settings,
  Briefcase,
} from 'lucide-react'

import { ROUTE_PATHS, type RoutePath } from '@/routes/routePaths'

export interface NavigationItem {
  label: string
  path: RoutePath
  icon: LucideIcon
}

export const NAVIGATION_ITEMS: readonly NavigationItem[] = [
  { label: 'Dashboard', path: ROUTE_PATHS.DASHBOARD, icon: LayoutDashboard },
  { label: 'Applications', path: ROUTE_PATHS.APPLICATIONS, icon: Briefcase },
  { label: 'Document Library', path: ROUTE_PATHS.DOCUMENTS, icon: FileText },
  { label: 'Communications', path: ROUTE_PATHS.COMMUNICATIONS, icon: Mail },
  { label: 'Calendar & Timeline', path: ROUTE_PATHS.CALENDAR, icon: CalendarDays },
  { label: 'Analytics', path: ROUTE_PATHS.ANALYTICS, icon: BarChart3 },
  { label: 'Notes & Reflections', path: ROUTE_PATHS.NOTES, icon: NotebookPen },
  { label: 'Settings', path: ROUTE_PATHS.SETTINGS, icon: Settings },
]
