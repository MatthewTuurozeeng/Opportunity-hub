import { QueryClientProvider } from '@tanstack/react-query'

import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/features/auth/context/AuthProvider'
import { queryClient } from '@/lib/queryClient'
import { AppRouter } from '@/routes/AppRouter'

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <AppRouter />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
