import { Redirect } from 'expo-router'
import { useMemo } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'

import { useAuth } from '@/src/context/AuthContext'
import { useTheme } from '@/src/context/ThemeContext'

export default function AuthCallbackScreen() {
  const { initialized, user } = useAuth()
  const { colors, fonts, spacing } = useTheme()
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          alignItems: 'center',
          flex: 1,
          gap: spacing.md,
          justifyContent: 'center',
        },
        text: { fontFamily: fonts.regular },
      }),
    [fonts, spacing],
  )
  if (initialized && user) return <Redirect href="/" />
  if (initialized && !user) return <Redirect href="/sign-in" />

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <ActivityIndicator
        accessibilityLabel="Completing sign in"
        color={colors.primary}
      />
      <Text style={[styles.text, { color: colors.inkMuted }]}>
        Completing sign in…
      </Text>
    </View>
  )
}
