export const ROUTE_PATHS = {
  LOGIN: '/login',
  SIGN_UP: '/sign-up',
  DASHBOARD: '/dashboard',
  APPLICATIONS: '/applications',
  NEW_APPLICATION: '/applications/new',
  DOCUMENTS: '/documents',
  COMMUNICATIONS: '/communications',
  CALENDAR: '/calendar',
  ANALYTICS: '/analytics',
  NOTES: '/notes',
  SETTINGS: '/settings',
} as const

export type RoutePath = (typeof ROUTE_PATHS)[keyof typeof ROUTE_PATHS]
