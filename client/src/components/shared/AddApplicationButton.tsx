import { Plus } from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { ROUTE_PATHS } from '@/routes/routePaths'

interface AddApplicationButtonProps {
  className?: string
  onClick?: () => void
}

/** The primary "Add Application" action, kept identical everywhere it appears. */
export function AddApplicationButton({ className, onClick }: AddApplicationButtonProps) {
  return (
    <Button
      size="lg"
      className={className}
      nativeButton={false}
      render={<Link to={ROUTE_PATHS.NEW_APPLICATION} onClick={onClick} />}
    >
      <Plus aria-hidden="true" />
      Add Application
    </Button>
  )
}
