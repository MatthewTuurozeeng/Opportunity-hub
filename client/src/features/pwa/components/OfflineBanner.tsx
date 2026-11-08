import { WifiOff } from 'lucide-react'

import { useOnlineStatus } from '../hooks/useOnlineStatus'

/** Explains why saving and loading will fail while there is no connection. */
export function OfflineBanner() {
  const isOnline = useOnlineStatus()
  if (isOnline) return null

  return (
    <div
      role="status"
      className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-body text-amber-900"
    >
      <WifiOff className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <p>
        <span className="font-medium">You are offline.</span> Your records are not stored on this device, so new changes
        cannot be saved until you reconnect.
      </p>
    </div>
  )
}
