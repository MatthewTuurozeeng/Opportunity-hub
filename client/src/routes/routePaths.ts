import { generatePath } from 'react-router'

export const ROUTE_PATHS = {
  LOGIN: '/login',
  SIGN_UP: '/sign-up',
  DASHBOARD: '/dashboard',
  APPLICATIONS: '/applications',
  NEW_APPLICATION: '/applications/new',
  APPLICATION_DETAIL: '/applications/:applicationId',
  EDIT_APPLICATION: '/applications/:applicationId/edit',
  DOCUMENTS: '/documents',
  COMMUNICATIONS: '/communications',
  CALENDAR: '/calendar',
  ANALYTICS: '/analytics',
  NOTES: '/notes',
  SETTINGS: '/settings',
} as const

export type RoutePath = (typeof ROUTE_PATHS)[keyof typeof ROUTE_PATHS]

export function buildApplicationDetailPath(applicationId: string): string {
  return generatePath(ROUTE_PATHS.APPLICATION_DETAIL, { applicationId })
}

export function buildEditApplicationPath(applicationId: string): string {
  return generatePath(ROUTE_PATHS.EDIT_APPLICATION, { applicationId })
}
