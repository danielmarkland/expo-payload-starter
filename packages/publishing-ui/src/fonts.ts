import localFont from 'next/font/local'
const font = localFont({
  display: 'swap',
  src: [
    {
      path: '../../design-tokens/assets/fonts/Poppins_400Regular.ttf',
      weight: '400',
    },
    {
      path: '../../design-tokens/assets/fonts/Poppins_500Medium.ttf',
      weight: '500',
    },
    {
      path: '../../design-tokens/assets/fonts/Poppins_600SemiBold.ttf',
      weight: '600',
    },
    {
      path: '../../design-tokens/assets/fonts/Poppins_700Bold.ttf',
      weight: '700',
    },
  ],
  variable: '--font-family-sans',
})

const interFont = localFont({
  src: '../../design-tokens/assets/fonts/Inter-Variable.ttf',
  weight: '100 900',
  display: 'swap',
  variable: '--font-family-inter',
})
const monoFont = localFont({
  src: '../../design-tokens/assets/fonts/IBMPlexMono-Regular.ttf',
  weight: '400',
  display: 'swap',
  variable: '--font-family-mono',
})

export const publishingFontClassName = `${font.variable} ${interFont.variable} ${monoFont.variable}`
