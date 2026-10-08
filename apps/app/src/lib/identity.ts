import {
  createAuthClient,
  phoneNumberClient,
} from '@danielmarkland/auth-runtime/react'
import { expoClient } from '@danielmarkland/auth-runtime/expo'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'
import Constants from 'expo-constants'
import { publicEnv } from '@/src/config/env'
export const betterAuthEnabled =
  process.env.EXPO_PUBLIC_AUTH_PROVIDER === 'better-auth'
export const identity = createAuthClient({
  baseURL: publicEnv.EXPO_PUBLIC_SITE_URL,
  plugins: [
    phoneNumberClient(),
    ...(Platform.OS !== 'web'
      ? [
          expoClient({
            scheme: Constants.expoConfig?.scheme as string,
            storagePrefix: 'starter-auth',
            storage: SecureStore,
          }),
        ]
      : []),
  ],
})
