import { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'

import { layout, typography } from '@danielmarkland/design-tokens'
import { betterAuthEnabled } from '@/src/lib/identity'
import { publicEnv } from '@/src/config/env'
import { useAuth } from '@/src/context/AuthContext'
import { useSiteConfig } from '@/src/context/SiteConfigContext'
import { useTheme } from '@/src/context/ThemeContext'

export default function SignInScreen() {
  const auth = useAuth()
  const [providers, setProviders] = useState({
    google: !betterAuthEnabled,
    facebook: false,
    sms: false,
    email: false,
  })
  const [email, setEmail] = useState(''),
    [password, setPassword] = useState(''),
    [phone, setPhone] = useState(''),
    [code, setCode] = useState(''),
    [sent, setSent] = useState(false),
    [message, setMessage] = useState('')
  const { config } = useSiteConfig()
  const { colors, fonts, radii, spacing } = useTheme()
  const styles = useMemo(
    () => createStyles(fonts, radii, spacing),
    [fonts, radii, spacing],
  )
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (betterAuthEnabled)
      void fetch(
        new URL('/api/identity/providers', publicEnv.EXPO_PUBLIC_SITE_URL),
      )
        .then(async (response) => {
          if (!response.ok) throw Error('Login configuration unavailable')
          setProviders(await response.json())
        })
        .catch(() => setError('Login configuration unavailable'))
  }, [])

  async function perform(action: () => Promise<void>) {
    setPending(true)
    setError(null)
    try {
      await action()
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
          {config.identity.appTitle}
        </Text>
        <Text style={[styles.description, { color: colors.inkMuted }]}>
          One authenticated application for web, iOS, and Android.
        </Text>
        {providers.google ? (
          <Pressable
            accessibilityRole="button"
            disabled={pending}
            onPress={() => void perform(() => auth.signInWithGoogle())}
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
        ) : null}
        {providers.facebook ? (
          <Pressable
            accessibilityRole="button"
            disabled={pending}
            onPress={() => void perform(() => auth.signInWithFacebook())}
            style={[styles.button, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.buttonText, { color: colors.primaryInk }]}>
              Continue with Facebook
            </Text>
          </Pressable>
        ) : null}
        {providers.email ? (
          <>
            <TextInput
              accessibilityLabel="Email"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={[
                styles.input,
                { color: colors.ink, borderColor: colors.border },
              ]}
            />
            <TextInput
              accessibilityLabel="Password"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={[
                styles.input,
                { color: colors.ink, borderColor: colors.border },
              ]}
            />
            <Pressable
              disabled={pending}
              onPress={() =>
                void perform(() => auth.signInWithEmail(email, password))
              }
            >
              <Text style={{ color: colors.primary }}>Sign in with email</Text>
            </Pressable>
            <Pressable
              disabled={pending}
              onPress={() =>
                void perform(async () => {
                  await auth.signUpWithEmail(email, password, email)
                  setMessage('Check your email to verify your account.')
                })
              }
            >
              <Text style={{ color: colors.primary }}>Create account</Text>
            </Pressable>
            <Pressable
              disabled={pending}
              onPress={() =>
                void perform(async () => {
                  await auth.requestPasswordReset(email)
                  setMessage(
                    'If this account exists, check your email for a recovery link.',
                  )
                })
              }
            >
              <Text style={{ color: colors.primary }}>Forgot password?</Text>
            </Pressable>
          </>
        ) : null}
        {providers.sms ? (
          <>
            <TextInput
              accessibilityLabel="Phone number with country code"
              placeholder="Phone number with country code"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              style={[
                styles.input,
                { color: colors.ink, borderColor: colors.border },
              ]}
            />
            {sent ? (
              <TextInput
                accessibilityLabel="Verification code"
                placeholder="Verification code"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                style={[
                  styles.input,
                  { color: colors.ink, borderColor: colors.border },
                ]}
              />
            ) : null}
            <Pressable
              disabled={pending}
              onPress={() =>
                void perform(async () => {
                  if (sent) await auth.verifyPhoneCode(phone, code)
                  else {
                    await auth.sendPhoneCode(phone)
                    setSent(true)
                  }
                })
              }
            >
              <Text style={{ color: colors.primary }}>
                {sent ? 'Verify code' : 'Send sign-in code'}
              </Text>
            </Pressable>
          </>
        ) : null}
        {message ? (
          <Text accessibilityRole="alert" style={{ color: colors.ink }}>
            {message}
          </Text>
        ) : null}
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

function createStyles(
  fonts: ReturnType<typeof useTheme>['fonts'],
  radii: ReturnType<typeof useTheme>['radii'],
  spacing: ReturnType<typeof useTheme>['spacing'],
) {
  return StyleSheet.create({
    input: {
      borderWidth: 1,
      padding: spacing.md,
      borderRadius: radii.sm,
      marginVertical: spacing.sm,
    },
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
}
