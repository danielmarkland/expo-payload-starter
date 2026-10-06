export type SectionAppearance = {
  headingAlignment?: null | string
  actionAlignment?: null | string
  mobileColumns?: null | string
  innerWidth?: null | string
  cardPadding?: null | string
  headingSpacing?: null | string
  columns?: null | string
  background?: null | string
  borderBottom?: null | string
  borderLeft?: null | string
  borderRight?: null | string
  borderTop?: null | string
  borderWidth?: null | string
  contentWidth?: null | string
  marginBottom?: null | string
  marginLeft?: null | string
  marginRight?: null | string
  marginTop?: null | string
  paddingBottom?: null | string
  paddingLeft?: null | string
  paddingRight?: null | string
  paddingTop?: null | string
  rounded?: null | boolean
}

export function sectionAppearanceClassName(
  baseClasses: string[],
  appearance?: null | SectionAppearance,
) {
  const classes = [...baseClasses]
  if (!appearance) return classes.join(' ')
  const values = [
    ['heading-alignment', appearance.headingAlignment],
    ['action-alignment', appearance.actionAlignment],
    ['columns', appearance.columns],
    ['mobile-columns', appearance.mobileColumns],
    ['inner-width', appearance.innerWidth],
    ['card-padding', appearance.cardPadding],
    ['heading-spacing', appearance.headingSpacing],
    ['padding-top', appearance.paddingTop],
    ['padding-right', appearance.paddingRight],
    ['padding-bottom', appearance.paddingBottom],
    ['padding-left', appearance.paddingLeft],
    ['margin-top', appearance.marginTop],
    ['margin-right', appearance.marginRight],
    ['margin-bottom', appearance.marginBottom],
    ['margin-left', appearance.marginLeft],
    ['content-width', appearance.contentWidth],
    ['background', appearance.background],
    ['border-top', appearance.borderTop],
    ['border-right', appearance.borderRight],
    ['border-bottom', appearance.borderBottom],
    ['border-left', appearance.borderLeft],
    ['border-width', appearance.borderWidth],
  ]
  for (const [prefix, value] of values)
    if (value) classes.push(`${prefix}-${value}`)
  if (appearance.rounded) classes.push('page-block-rounded')
  return classes.join(' ')
}
