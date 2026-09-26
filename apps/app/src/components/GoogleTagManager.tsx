import { useEffect } from 'react'
import { Platform } from 'react-native'

import { publicEnv } from '@/src/config/env'
import { appendGoogleTagManager } from '@/src/lib/google-tag-manager'

export function GoogleTagManager() {
  const containerId = publicEnv.EXPO_PUBLIC_GTM_CONTAINER_ID

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
