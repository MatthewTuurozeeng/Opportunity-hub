import { createBrowserRouter, RouterProvider } from 'react-router'

import { MainLayout } from '@/components/layout/MainLayout'
import { ApplicationDetailPage } from '@/features/applications/pages/ApplicationDetailPage'
import { ApplicationsPage } from '@/features/applications/pages/ApplicationsPage'
import { EditApplicationPage } from '@/features/applications/pages/EditApplicationPage'
import { NewApplicationPage } from '@/features/applications/pages/NewApplicationPage'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { SignUpPage } from '@/features/auth/pages/SignUpPage'
import { CalendarPage } from '@/features/calendar/pages/CalendarPage'
import { CommunicationsPage } from '@/features/communications/pages/CommunicationsPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { DocumentsPage } from '@/features/documents/pages/DocumentsPage'
import { LandingPage } from '@/features/landing/pages/LandingPage'
import { NotesPage } from '@/features/notes/pages/NotesPage'
import { SettingsPage } from '@/features/settings/pages/SettingsPage'

import { NotFoundPage } from './NotFoundPage'
import { ROUTE_PATHS } from './routePaths'

const router = createBrowserRouter([
  { path: ROUTE_PATHS.HOME, element: <LandingPage /> },
  { path: ROUTE_PATHS.LOGIN, element: <LoginPage /> },
  { path: ROUTE_PATHS.SIGN_UP, element: <SignUpPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: ROUTE_PATHS.DASHBOARD, element: <DashboardPage /> },
          { path: ROUTE_PATHS.APPLICATIONS, element: <ApplicationsPage /> },
          { path: ROUTE_PATHS.NEW_APPLICATION, element: <NewApplicationPage /> },
          { path: ROUTE_PATHS.APPLICATION_DETAIL, element: <ApplicationDetailPage /> },
          { path: ROUTE_PATHS.EDIT_APPLICATION, element: <EditApplicationPage /> },
          { path: ROUTE_PATHS.DOCUMENTS, element: <DocumentsPage /> },
          { path: ROUTE_PATHS.COMMUNICATIONS, element: <CommunicationsPage /> },
          { path: ROUTE_PATHS.CALENDAR, element: <CalendarPage /> },
          {
            path: ROUTE_PATHS.ANALYTICS,
            // Loaded on demand so the charting library stays out of the main bundle.
            lazy: async () => ({ Component: (await import('@/features/analytics/pages/AnalyticsPage')).AnalyticsPage }),
          },
          { path: ROUTE_PATHS.NOTES, element: <NotesPage /> },
          { path: ROUTE_PATHS.SETTINGS, element: <SettingsPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
