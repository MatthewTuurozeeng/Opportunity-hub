import { Menu } from 'lucide-react'
import { useState } from 'react'

import { AddApplicationButton } from '@/components/shared/AddApplicationButton'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { SignOutButton } from '@/features/auth/components/SignOutButton'
import { ThemeToggle } from '@/features/theme/components/ThemeToggle'

import { SidebarNavigation } from './SidebarNavigation'

/** Navigation drawer for small screens. Closes automatically after navigating. */
export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const closeNavigation = () => setIsOpen(false)

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Open navigation menu" />}>
        <Menu aria-hidden="true" />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 gap-4 bg-sidebar px-4">
        <SheetHeader className="px-2">
          <SheetTitle>OpportunityHub</SheetTitle>
        </SheetHeader>
        <AddApplicationButton className="w-full" onClick={closeNavigation} />
        <SidebarNavigation onNavigate={closeNavigation} />
        <div className="mt-auto pb-4">
          <ThemeToggle showLabel className="mb-2 w-full" />
          <SignOutButton />
        </div>
      </SheetContent>
    </Sheet>
  )
}
