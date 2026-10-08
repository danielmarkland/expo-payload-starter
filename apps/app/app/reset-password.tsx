import { useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { View, Text, TextInput, Pressable } from 'react-native'
import { identity } from '@/src/lib/identity'
import { useTheme } from '@/src/context/ThemeContext'
export default function ResetPassword() {
  const { token } = useLocalSearchParams<{ token?: string }>(),
    router = useRouter(),
    { colors, spacing } = useTheme(),
    [password, setPassword] = useState(''),
    [error, setError] = useState(''),
    [pending, setPending] = useState(false)
  async function save() {
    if (!token) {
      setError('This recovery link is incomplete')
      return
    }
    setPending(true)
    try {
      const result = await identity.resetPassword({
        token,
        newPassword: password,
      })
      if (result.error) throw Error(result.error.message)
      router.replace('/sign-in')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setPending(false)
    }
  }
  return (
    <View
      style={{ flex: 1, padding: spacing.lg, backgroundColor: colors.surface }}
    >
      <Text style={{ color: colors.ink }}>Set a new password</Text>
      <TextInput
        accessibilityLabel="New password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ color: colors.ink, padding: spacing.md }}
      />
      <Pressable disabled={pending} onPress={() => void save()}>
        <Text style={{ color: colors.primary }}>Save password</Text>
      </Pressable>
      {error ? (
        <Text accessibilityRole="alert" style={{ color: colors.danger }}>
          {error}
        </Text>
      ) : null}
    </View>
  )
}
