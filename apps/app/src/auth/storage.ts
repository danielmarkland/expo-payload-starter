import type { SupportedStorage } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

export const authStorage: SupportedStorage = {
  getItem: async (key) => {
    if (Platform.OS === 'web') {
      return globalThis.localStorage?.getItem(key) ?? null
    }
    return SecureStore.getItemAsync(key)
  },
  removeItem: async (key) => {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.removeItem(key)
      return
    }
    await SecureStore.deleteItemAsync(key)
  },
  setItem: async (key, value) => {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.setItem(key, value)
      return
    }
    await SecureStore.setItemAsync(key, value)
  },
}
