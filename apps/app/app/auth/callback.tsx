import { Redirect } from 'expo-router'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'

import { colors, spacing } from '@starter/design-tokens'
import { useAuth } from '@/src/context/AuthContext'

export default function AuthCallbackScreen() {
  const { initialized, user } = useAuth()
  if (initialized && user) return <Redirect href="/" />
  if (initialized && !user) return <Redirect href="/sign-in" />

  return (
    <View style={styles.container}>
      <ActivityIndicator accessibilityLabel="Completing sign in" />
      <Text style={styles.text}>Completing sign in…</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
  },
  text: { color: colors.inkMuted },
})
