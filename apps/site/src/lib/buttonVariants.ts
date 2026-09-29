export const buttonVariantValues = [
  'primary-filled',
  'primary-outline',
  'secondary-filled',
  'secondary-outline',
] as const

export type ButtonVariant = (typeof buttonVariantValues)[number]

export const buttonVariantOptions: Array<{ label: string; value: ButtonVariant }> = [
  { label: 'Primary Filled', value: 'primary-filled' },
  { label: 'Primary Outline', value: 'primary-outline' },
  { label: 'Secondary Filled', value: 'secondary-filled' },
  { label: 'Secondary Outline', value: 'secondary-outline' },
]

const buttonVariants = new Set<string>(buttonVariantValues)

export function buttonClassName(
  value: null | string | undefined,
  fallback: ButtonVariant = 'primary-filled',
) {
  const variant = value && buttonVariants.has(value) ? value : fallback
  return `button button-${variant}`
}
