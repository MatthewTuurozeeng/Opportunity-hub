import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/features/auth/context/AuthProvider'
import { PwaUpdatePrompt } from '@/features/pwa/components/PwaUpdatePrompt'
import { queryClient } from '@/lib/queryClient'
import { AppRouter } from '@/routes/AppRouter'

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <AppRouter />
          <Toaster position="top-right" richColors closeButton />
          <PwaUpdatePrompt />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
