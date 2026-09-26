import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { fonts } from '@starter/design-tokens'
import { ThemeToggle } from '@/src/components/ThemeToggle'
import { AuthProvider, useAuth } from '@/src/context/AuthContext'
import { ThemeProvider, useTheme } from '@/src/context/ThemeContext'

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient())
  const [fontsLoaded] = useFonts({
    [fonts.regular]: require('@starter/design-tokens/assets/fonts/Poppins_400Regular.ttf'),
    [fonts.medium]: require('@starter/design-tokens/assets/fonts/Poppins_500Medium.ttf'),
    [fonts.semibold]: require('@starter/design-tokens/assets/fonts/Poppins_600SemiBold.ttf'),
    [fonts.bold]: require('@starter/design-tokens/assets/fonts/Poppins_700Bold.ttf'),
  })

  if (!fontsLoaded) return null

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  )
}

function RootNavigator() {
  const { initialized, user } = useAuth()
  const { colors, mode, ready } = useTheme()

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      {!initialized || !ready ? (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <ActivityIndicator
            accessibilityLabel="Restoring session"
            color={colors.accent}
          />
        </View>
      ) : (
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: colors.surface },
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.ink,
            headerTitleStyle: { color: colors.ink, fontFamily: fonts.medium },
          }}
        >
          <Stack.Protected guard={Boolean(user)}>
            <Stack.Screen name="(app)" options={{ headerShown: false }} />
          </Stack.Protected>
          <Stack.Protected guard={!user}>
            <Stack.Screen name="sign-in" options={{ headerShown: false }} />
          </Stack.Protected>
          <Stack.Screen
            name="auth/callback"
            options={{ title: 'Signing in' }}
          />
        </Stack>
      )}
      <ThemeToggle />
    </View>
  )
}
