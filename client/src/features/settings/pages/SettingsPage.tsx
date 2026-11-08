import { Database, MonitorSmartphone, ShieldCheck, Tags, UserPlus, UserRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useSearchParams } from 'react-router'

import { PageHeader } from '@/components/shared/PageHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { AccountSettings } from '../components/AccountSettings'
import { AppSettings } from '../components/AppSettings'
import { CategorySettings } from '../components/CategorySettings'
import { DataSettings } from '../components/DataSettings'
import { InvitationSettings } from '../components/InvitationSettings'
import { ProfileSettings } from '../components/ProfileSettings'
import { useProfile } from '../hooks/useProfile'

const SETTINGS_TABS = ['profile', 'account', 'categories', 'invitations', 'data', 'app'] as const
type SettingsTab = (typeof SETTINGS_TABS)[number]

const TAB_DETAILS: Record<SettingsTab, { label: string; icon: LucideIcon; content: () => React.JSX.Element }> = {
  profile: { label: 'Profile', icon: UserRound, content: ProfileSettings },
  account: { label: 'Account & security', icon: ShieldCheck, content: AccountSettings },
  categories: { label: 'Categories', icon: Tags, content: CategorySettings },
  invitations: { label: 'Invitations', icon: UserPlus, content: InvitationSettings },
  data: { label: 'Data & backup', icon: Database, content: DataSettings },
  app: { label: 'App', icon: MonitorSmartphone, content: AppSettings },
}

const TAB_SEARCH_PARAM = 'tab'

function isSettingsTab(value: unknown): value is SettingsTab {
  return typeof value === 'string' && (SETTINGS_TABS as readonly string[]).includes(value)
}

/** Tabs only the owner can use. */
const OWNER_ONLY_TABS: readonly SettingsTab[] = ['invitations']

export function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: profile } = useProfile()
  const isOwner = profile?.role === 'owner'
  const visibleTabs = SETTINGS_TABS.filter((tab) => isOwner || !OWNER_ONLY_TABS.includes(tab))

  const requestedTab = searchParams.get(TAB_SEARCH_PARAM)
  const activeTab: SettingsTab = isSettingsTab(requestedTab) && visibleTabs.includes(requestedTab) ? requestedTab : 'profile'

  function handleTabChange(tab: unknown) {
    if (!isSettingsTab(tab)) return
    // Keep the tab in the URL so it survives a refresh and can be linked to.
    setSearchParams(tab === 'profile' ? {} : { [TAB_SEARCH_PARAM]: tab }, { replace: true })
  }

  return (
    <>
      <PageHeader title="Settings" description="Manage your profile, account, categories and data." />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="max-w-full overflow-x-auto">
          {visibleTabs.map((tab) => {
            const { label, icon: Icon } = TAB_DETAILS[tab]
            return (
              <TabsTrigger key={tab} value={tab}>
                <Icon aria-hidden="true" />
                {label}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {visibleTabs.map((tab) => {
          const Content = TAB_DETAILS[tab].content
          return (
            <TabsContent key={tab} value={tab} className="max-w-3xl pt-4">
              <Content />
            </TabsContent>
          )
        })}
      </Tabs>
    </>
  )
}
