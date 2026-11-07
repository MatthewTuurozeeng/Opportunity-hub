import { QueryClientProvider } from '@tanstack/react-query'

import { TooltipProvider } from '@/components/ui/tooltip'
import { queryClient } from '@/lib/queryClient'
import { AppRouter } from '@/routes/AppRouter'

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppRouter />
      </TooltipProvider>
    </QueryClientProvider>
  )
}
