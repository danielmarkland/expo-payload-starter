import { useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { colors, fonts, spacing } from '@starter/design-tokens'
import { useAuth } from '@/src/context/AuthContext'

export default function SignInScreen() {
  const { signInWithGoogle } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSignIn() {
    setPending(true)
    setError(null)
    try {
      await signInWithGoogle()
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : 'Unable to sign in')
    } finally {
      setPending(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.title}>
          Expo Payload Starter
        </Text>
        <Text style={styles.description}>
          One authenticated application for web, iOS, and Android.
        </Text>
        <Pressable
          accessibilityRole="button"
          disabled={pending}
          onPress={() => void handleSignIn()}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
        >
          {pending ? (
            <ActivityIndicator color={colors.inkInverse} />
          ) : (
            <Text style={styles.buttonText}>Continue with Google</Text>
          )}
        </Pressable>
        {error ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 10,
    justifyContent: 'center',
    marginTop: spacing.lg,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
  },
  buttonPressed: { opacity: 0.82 },
  buttonText: {
    color: colors.inkInverse,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  card: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    maxWidth: 460,
    padding: spacing.xl,
    width: '100%',
  },
  container: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  description: {
    color: colors.inkMuted,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  error: {
    color: colors.danger,
    fontFamily: fonts.regular,
    marginTop: spacing.md,
  },
  title: {
    color: colors.ink,
    fontFamily: fonts.bold,
    fontSize: 30,
    marginBottom: spacing.sm,
  },
})
