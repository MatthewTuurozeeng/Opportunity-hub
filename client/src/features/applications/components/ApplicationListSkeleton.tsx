import { Skeleton } from '@/components/ui/skeleton'

const PLACEHOLDER_ROW_COUNT = 4

export function ApplicationListSkeleton() {
  return (
    <div role="status" aria-label="Loading applications" className="flex flex-col gap-3">
      {Array.from({ length: PLACEHOLDER_ROW_COUNT }, (_, index) => (
        <Skeleton key={index} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  )
}
