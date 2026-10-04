import { useEffect } from 'react'
import { Platform } from 'react-native'

import { useSiteConfig } from '@/src/context/SiteConfigContext'
import { appendGoogleTagManager } from '@/src/lib/google-tag-manager'

export function GoogleTagManager() {
  const containerId =
    useSiteConfig().config.integrations.googleTagManagerId || undefined

  useEffect(() => {
    if (
      Platform.OS !== 'web' ||
      !containerId ||
      typeof document === 'undefined'
    )
      return

    appendGoogleTagManager(containerId, window, document)
  }, [containerId])

  return null
}
