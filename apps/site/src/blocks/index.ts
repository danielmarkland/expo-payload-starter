import { createPublishingBlocks } from '@danielmarkland/publishing-core/payloadBlocks'
import * as fields from '@/fields/linkFields'

export { buttonVariantOptions } from '@danielmarkland/publishing-core/buttonVariants'
export const {
  appearanceField,
  HeroBlock,
  RichTextBlock,
  ImageBlock,
  FeatureGridBlock,
  SplitContentBlock,
  LinkGridBlock,
  PortfolioGridBlock,
  CallToActionBlock,
  TestimonialsBlock,
  LogoCloudBlock,
  ContactFormBlock,
  StatsBlock,
  FAQBlock,
  LatestPostsBlock,
  pageBlocks,
} = createPublishingBlocks(fields)
