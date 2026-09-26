import { useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import {
  brand,
  fonts,
  layout,
  radii,
  spacing,
  typography,
} from '@starter/design-tokens'
import { useAuth } from '@/src/context/AuthContext'
import { useTheme } from '@/src/context/ThemeContext'

export default function SignInScreen() {
  const { signInWithGoogle } = useAuth()
  const { colors } = useTheme()
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
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surfaceRaised, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.eyebrow, { color: colors.secondary }]}>
          SIGN IN
        </Text>
        <Text
          accessibilityRole="header"
          style={[styles.title, { color: colors.ink }]}
        >
          {brand.appTitle}
        </Text>
        <Text style={[styles.description, { color: colors.inkMuted }]}>
          One authenticated application for web, iOS, and Android.
        </Text>
        <Pressable
          accessibilityRole="button"
          disabled={pending}
          onPress={() => void handleSignIn()}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: colors.primary },
            pressed && styles.buttonPressed,
          ]}
        >
          {pending ? (
            <ActivityIndicator color={colors.primaryInk} />
          ) : (
            <Text style={[styles.buttonText, { color: colors.primaryInk }]}>
              Continue with Google
            </Text>
          )}
        </Pressable>
        {error ? (
          <Text
            accessibilityRole="alert"
            style={[styles.error, { color: colors.danger }]}
          >
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
    borderRadius: radii.sm,
    justifyContent: 'center',
    marginTop: spacing.lg,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
  },
  buttonPressed: { opacity: 0.82 },
  buttonText: {
    fontFamily: fonts.bold,
    fontSize: typography.fontSizes.body,
  },
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    maxWidth: layout.card,
    padding: spacing.xl,
    width: '100%',
  },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: typography.fontSizes.body,
    lineHeight: typography.fontSizes.body * typography.lineHeights.body,
  },
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: typography.fontSizes.eyebrow,
    marginBottom: spacing.sm,
  },
  error: {
    fontFamily: fonts.regular,
    marginTop: spacing.md,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: typography.fontSizes.title,
    marginBottom: spacing.sm,
  },
})
