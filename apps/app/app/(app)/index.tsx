import { useQuery } from '@tanstack/react-query'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { profileLabel } from '@starter/core'
import { colors, fonts, spacing } from '@starter/design-tokens'
import { useAuth } from '@/src/context/AuthContext'
import { profiles } from '@/src/lib/supabase'

export default function HomeScreen() {
  const { signOut, user } = useAuth()
  const profile = useQuery({
    enabled: Boolean(user),
    queryFn: () => profiles.findById(user!.id),
    queryKey: ['profile', user?.id],
  })
  const label = user ? profileLabel(profile.data ?? null, user) : 'Member'
  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>
        You are signed in
      </Text>
      <Text style={styles.email}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => void signOut()}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Sign out</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  buttonText: { color: colors.ink, fontFamily: fonts.semibold },
  container: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  email: {
    color: colors.inkMuted,
    fontFamily: fonts.regular,
    fontSize: 16,
    marginTop: spacing.sm,
  },
  title: { color: colors.ink, fontFamily: fonts.bold, fontSize: 30 },
})
