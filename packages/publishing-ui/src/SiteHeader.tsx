import type { ReactNode } from 'react'
import type { SiteConfig } from '@danielmarkland/publishing-contracts'
import { SiteBrand } from './SiteBrand.js'
import { ThemeToggle } from './ThemeToggle.js'

export interface SiteHeaderProps {
  siteConfig: {
    identity: Pick<
      SiteConfig['identity'],
      'siteTitle' | 'darkLogoUrl' | 'lightLogoUrl'
    >
    theme: Pick<SiteConfig['theme'], 'allowToggle' | 'defaultMode'>
  }
  navigation: ReactNode
  search?: ReactNode
  sticky?: boolean | null
  themeStorageKey: string
}

export function SiteHeader({
  siteConfig,
  navigation,
  search,
  sticky,
  themeStorageKey,
}: SiteHeaderProps) {
  return (
    <header className={`site-header${sticky ? ' site-header-sticky' : ''}`}>
      <SiteBrand siteConfig={siteConfig} />
      <nav aria-label="Main navigation" className="header-navigation">
        {navigation}
        {search}
      </nav>
      {siteConfig.theme.allowToggle ? (
        <ThemeToggle
          defaultMode={siteConfig.theme.defaultMode}
          storageKey={themeStorageKey}
        />
      ) : null}
    </header>
  )
}
