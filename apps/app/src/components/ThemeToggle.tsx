import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { typography } from '@starter/design-tokens'
import { useTheme } from '@/src/context/ThemeContext'

export function ThemeToggle() {
  const insets = useSafeAreaInsets()
  const {
    allowToggle,
    colors,
    fonts,
    mode,
    radii,
    ready,
    spacing,
    toggleTheme,
  } = useTheme()
  const nextMode = mode === 'dark' ? 'light' : 'dark'
  const nextLabel = nextMode === 'dark' ? 'dark' : 'light'

  if (!allowToggle) return null

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <Pressable
        accessibilityLabel={`Current theme: ${mode} mode. Switch to ${nextLabel} mode.`}
        accessibilityRole="button"
        disabled={!ready}
        onPress={toggleTheme}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: colors.surfaceTop,
            borderColor: colors.border,
            borderRadius: radii.pill,
            opacity: !ready || pressed ? 0.72 : 1,
            paddingHorizontal: spacing.md,
            right: spacing.lg,
            top: insets.top + spacing.md,
          },
        ]}
      >
        <Text
          style={[
            styles.label,
            { color: colors.inkBody, fontFamily: fonts.medium },
          ]}
        >
          {mode === 'dark' ? 'Light mode' : 'Dark mode'}
        </Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderWidth: 1,
    minHeight: 40,
    position: 'absolute',
  },
  label: {
    fontSize: typography.fontSizes.small,
    lineHeight: 40,
    textTransform: 'capitalize',
  },
})
