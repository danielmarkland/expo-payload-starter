import { Redirect } from 'expo-router'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'

import { fonts, spacing } from '@starter/design-tokens'
import { useAuth } from '@/src/context/AuthContext'
import { useTheme } from '@/src/context/ThemeContext'

export default function AuthCallbackScreen() {
  const { initialized, user } = useAuth()
  const { colors } = useTheme()
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

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
  },
  text: { fontFamily: fonts.regular },
})
