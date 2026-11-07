import type { Session, User } from '@supabase/supabase-js'
import { createContext } from 'react'

export interface AuthContextValue {
  session: Session | null
  user: User | null
  /** True until the stored session has been restored on first load. */
  isLoading: boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)
