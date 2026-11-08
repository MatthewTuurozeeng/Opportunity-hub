import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { createMemoryRouter, RouterProvider } from 'react-router'

import { TooltipProvider } from '@/components/ui/tooltip'

interface RenderOptions {
  /** Starting URL for the in-memory router. */
  route?: string
}

/**
 * Renders a component with the app's providers: a fresh query client (no retries)
 * and a data router (needed by hooks such as useBlocker).
 */
export function renderWithProviders(ui: ReactElement, { route = '/' }: RenderOptions = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter([{ path: '*', element: ui }], { initialEntries: [route] })

  return {
    queryClient,
    router,
    ...render(
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <RouterProvider router={router} />
        </TooltipProvider>
      </QueryClientProvider>,
    ),
  }
}
