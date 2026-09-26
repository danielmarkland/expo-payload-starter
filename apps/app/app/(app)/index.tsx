import { useQuery } from '@tanstack/react-query'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { profileLabel } from '@starter/core'
import { fonts, radii, spacing, typography } from '@starter/design-tokens'
import { useAuth } from '@/src/context/AuthContext'
import { useTheme } from '@/src/context/ThemeContext'
import { profiles } from '@/src/lib/supabase'

export default function HomeScreen() {
  const { signOut, user } = useAuth()
  const { colors } = useTheme()
  const profile = useQuery({
    enabled: Boolean(user),
    queryFn: () => profiles.findById(user!.id),
    queryKey: ['profile', user?.id],
  })
  const label = user ? profileLabel(profile.data ?? null, user) : 'Member'
  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text
        accessibilityRole="header"
        style={[styles.title, { color: colors.ink }]}
      >
        You are signed in
      </Text>
      <Text style={[styles.email, { color: colors.inkMuted }]}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => void signOut()}
        style={[styles.button, { borderColor: colors.border }]}
      >
        <Text style={[styles.buttonText, { color: colors.ink }]}>Sign out</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radii.sm,
    borderWidth: 1,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  buttonText: { fontFamily: fonts.semibold },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  email: {
    fontFamily: fonts.regular,
    fontSize: typography.fontSizes.body,
    marginTop: spacing.sm,
  },
  title: { fontFamily: fonts.bold, fontSize: typography.fontSizes.title },
})
