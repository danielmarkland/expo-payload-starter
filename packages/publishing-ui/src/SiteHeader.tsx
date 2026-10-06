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
  variant?: 'standard' | 'minimal' | null
  helpLink?: ReactNode
  socialLinks?: ReactNode
  navigation: ReactNode
  search?: ReactNode
  sticky?: boolean | null
  themeStorageKey: string
}

export function SiteHeader({
  siteConfig,
  variant,
  helpLink,
  socialLinks,
  navigation,
  search,
  sticky,
  themeStorageKey,
}: SiteHeaderProps) {
  return (
    <header
      data-header-default={variant || 'standard'}
      className={`site-header${sticky ? ' site-header-sticky' : ''}`}
    >
      <SiteBrand siteConfig={siteConfig} />
      <nav aria-label="Main navigation" className="header-navigation">
        {socialLinks}
        {navigation}
        {search}
      </nav>
      <nav aria-label="Help" className="header-minimal-navigation">
        {helpLink}
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
