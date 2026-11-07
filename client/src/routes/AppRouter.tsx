import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'

import { MainLayout } from '@/components/layout/MainLayout'
import { AnalyticsPage } from '@/features/analytics/pages/AnalyticsPage'
import { ApplicationsPage } from '@/features/applications/pages/ApplicationsPage'
import { NewApplicationPage } from '@/features/applications/pages/NewApplicationPage'
import { CalendarPage } from '@/features/calendar/pages/CalendarPage'
import { CommunicationsPage } from '@/features/communications/pages/CommunicationsPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { DocumentsPage } from '@/features/documents/pages/DocumentsPage'
import { NotesPage } from '@/features/notes/pages/NotesPage'
import { SettingsPage } from '@/features/settings/pages/SettingsPage'

import { NotFoundPage } from './NotFoundPage'
import { ROUTE_PATHS } from './routePaths'

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { index: true, element: <Navigate to={ROUTE_PATHS.DASHBOARD} replace /> },
      { path: ROUTE_PATHS.DASHBOARD, element: <DashboardPage /> },
      { path: ROUTE_PATHS.APPLICATIONS, element: <ApplicationsPage /> },
      { path: ROUTE_PATHS.NEW_APPLICATION, element: <NewApplicationPage /> },
      { path: ROUTE_PATHS.DOCUMENTS, element: <DocumentsPage /> },
      { path: ROUTE_PATHS.COMMUNICATIONS, element: <CommunicationsPage /> },
      { path: ROUTE_PATHS.CALENDAR, element: <CalendarPage /> },
      { path: ROUTE_PATHS.ANALYTICS, element: <AnalyticsPage /> },
      { path: ROUTE_PATHS.NOTES, element: <NotesPage /> },
      { path: ROUTE_PATHS.SETTINGS, element: <SettingsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
