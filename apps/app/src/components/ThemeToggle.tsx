import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { fonts, radii, spacing, typography } from '@starter/design-tokens'
import { useTheme } from '@/src/context/ThemeContext'

export function ThemeToggle() {
  const insets = useSafeAreaInsets()
  const { colors, mode, ready, toggleTheme } = useTheme()
  const nextMode = mode === 'dark' ? 'light' : 'dark'
  const nextLabel = nextMode === 'dark' ? 'dark' : 'light'

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
            opacity: !ready || pressed ? 0.72 : 1,
            right: spacing.lg,
            top: insets.top + spacing.md,
          },
        ]}
      >
        <Text style={[styles.label, { color: colors.inkBody }]}>
          {mode === 'dark' ? 'Light mode' : 'Dark mode'}
        </Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: radii.pill,
    borderWidth: 1,
    minHeight: 40,
    paddingHorizontal: spacing.md,
    position: 'absolute',
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: typography.fontSizes.small,
    lineHeight: 40,
    textTransform: 'capitalize',
  },
})
