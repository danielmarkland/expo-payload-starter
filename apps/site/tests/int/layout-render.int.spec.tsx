// @vitest-environment node
import React from 'react'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import {
  pageSchema,
  archivePresentationSchema,
  footerNavigationSchema,
} from '@danielmarkland/publishing-contracts'
import { createHeroHeadline } from '@danielmarkland/publishing-core'
import { createPageRenderer } from '@danielmarkland/publishing-ui/PageRenderer'
import { LatestPostsSection } from '@danielmarkland/publishing-ui/LatestPostsSection'
import { PostArchive } from '@danielmarkland/publishing-ui/PostArchive'
import { ContactForm } from '@/components/ContactForm'
import { NewsletterForm } from '@/components/NewsletterForm'
import { createSiteFooter } from '@danielmarkland/publishing-ui/SiteFooter'
import { ActionLink, ContentLink } from '@/components/LinkAction'
import { SiteConfigProvider } from '@/components/SiteConfigProvider'
import { resolveSiteConfig, siteConfigCSS } from '@/lib/siteConfig'
import type { SiteSetting } from '@/payload-types'
const artwork = (color: string, label: string) =>
  'data:image/svg+xml;base64,' +
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="600" height="600" fill="${color}"/><circle cx="300" cy="270" r="180" fill="none" stroke="white" stroke-width="20"/><text x="300" y="520" text-anchor="middle" fill="white" font-size="48">${label}</text></svg>`,
  ).toString('base64')
const posts = ['Radio', 'Good Life', 'Soul'].map((title, index) => ({
  id: index + 1,
  slug: `mix-${index}`,
  title,
  summary: 'A representative music release.',
  publishedAt: '2026-01-01',
  meta: {
    image: {
      id: index + 1,
      alt: title,
      url: artwork(['#007c91', '#297035', '#7c1f44'][index], title),
      width: 600,
      height: 600,
    },
  },
}))
const media = {
  id: 10,
  alt: 'Illustrative hero artwork',
  url: artwork('#24303d', 'Studio'),
  width: 600,
  height: 600,
}
const action = { type: 'url', url: '/more', label: 'Find out more' }
const Renderer = createPageRenderer({
  ContactForm,
  ActionLink,
  ContentLink,
  LatestPostsSection: (props) => <LatestPostsSection {...props} posts={posts} />,
})
const Footer = createSiteFooter({
  ContactForm,
  NewsletterForm,
  ContentLink,
  getHeaderNavigationIcon: () => undefined,
})
const samples = {
  daniel: [
    {
      blockType: 'hero',
      variant: 'text',
      heading: createHeroHeadline('Hello, my name is Daniel Markland.'),
    },
    {
      blockType: 'featureGrid',
      heading: 'Services',
      layout: 'stacked',
      items: [
        { title: 'AI App Development', description: 'Build practical applications.' },
        { title: 'Web App Development', description: 'Create dependable software.' },
      ],
    },
    {
      blockType: 'splitContent',
      heading: 'About',
      content: createHeroHeadline('Over two decades of experience.'),
      image: media,
      imagePosition: 'right',
    },
    {
      blockType: 'linkGrid',
      heading: 'Expertise',
      appearance: { columns: '2' },
      items: [{ label: 'Python' }, { label: 'React' }],
    },
    {
      blockType: 'portfolioGrid',
      heading: 'Career Highlights',
      appearance: { columns: '2' },
      items: [
        { name: 'Project One', role: 'WEB', description: 'Application development.' },
        { name: 'Project Two', description: 'Mobile development.' },
      ],
    },
    {
      blockType: 'contactForm',
      heading: 'How Can I Help?',
      submitLabel: 'Send',
      successMessage: 'Thanks',
    },
  ],
  code: [
    {
      blockType: 'hero',
      variant: 'text',
      alignment: 'center',
      heading: createHeroHeadline('Test Demand Before You Build'),
      primaryButton: action,
      secondaryButton: { ...action, label: 'Work with us' },
    },
    {
      blockType: 'featureGrid',
      heading: 'Three Weeks, Four Steps',
      numbered: true,
      appearance: { columns: '4' },
      items: ['Set the Bar', 'Build the Funnel', 'Run the Traffic', 'Deliver the Verdict'].map(
        (title) => ({ title, description: 'A practical step toward validation.' }),
      ),
    },
    {
      blockType: 'featureGrid',
      heading: 'The Code Assassins System',
      layout: 'plain',
      appearance: { columns: '3' },
      items: ['Research', 'Backtesting', 'Execution'].map((title, index) => ({
        title,
        description: 'Make evidence-based decisions.',
        ruleColor: ['#00cc55', '#3355ff', '#666666'][index],
      })),
    },
    {
      blockType: 'testimonials',
      items: [{ quote: 'An illustrative testimonial.', name: 'Example', role: 'Founder' }],
    },
  ],
  strick: [
    {
      blockType: 'hero',
      variant: 'background',
      height: 'tall',
      heading: createHeroHeadline('Mostly House. Sometimes Funk, Jazz & Soul. Always Hip-Hop.'),
      secondaryHeading: 'Dallas, TX Based DJ & Music Producer.',
      image: media,
      appearance: { contentWidth: 'full' },
    },
    {
      blockType: 'latestPosts',
      heading: 'Featured DJ Mixes',
      source: 'category',
      category: 1,
      imageProportion: 'square',
      presentation: 'imageOnly',
      appearance: { columns: '3', headingAlignment: 'center', actionAlignment: 'center' },
      action,
    },
    {
      blockType: 'latestPosts',
      heading: 'Featured Remixes',
      source: 'selected',
      selectedPosts: [1, 2, 3],
      imageProportion: 'square',
      presentation: 'imageOnly',
      appearance: { columns: '3', headingAlignment: 'center', actionAlignment: 'center' },
      action,
    },
    {
      blockType: 'contactForm',
      heading: 'Booking',
      nameMode: 'separate',
      showCompany: true,
      submitLabel: 'Send',
      successMessage: 'Thanks',
      appearance: { background: 'accent', contentWidth: 'full', headingAlignment: 'center' },
    },
  ],
}
describe('screenshot layout fixtures', () => {
  it('renders all four practical structures with the real shared renderer and application CSS', async () => {
    const output = process.env.LAYOUT_RENDER_OUTPUT_DIR
    const config = resolveSiteConfig(
      {
        siteTitle: 'Layout fixture',
        appTitle: 'Fixture',
        shortName: 'Fixture',
        siteDescription: 'Practical layout coverage',
        theme: { defaultMode: 'dark', allowToggle: false, fontPreset: 'system' },
      } as SiteSetting,
      'http://localhost:3000',
    )
    const css = await readFile(resolve('src/app/(frontend)/styles.css'), 'utf8')
    const tokens = await readFile(
      resolve('node_modules/@danielmarkland/design-tokens/src/theme.css'),
      'utf8',
    )
    const shared = await readFile(
      resolve('node_modules/@danielmarkland/publishing-ui/dist/layout.css'),
      'utf8',
    )
    const views: Record<string, React.ReactNode> = Object.fromEntries(
      Object.entries(samples).map(([name, layout]) => [
        name,
        <Renderer key={name} page={pageSchema.parse({ id: 1, slug: name, title: name, layout })} />,
      ]),
    )
    views.archive = (
      <>
        <PostArchive
          header={<h1>Mixtapes</h1>}
          posts={[...posts, ...posts.map((post) => ({ ...post, id: post.id + 3 }))]}
          settings={archivePresentationSchema.parse({
            columns: '3',
            imageProportion: 'square',
            presentation: 'simple',
            titleSurface: 'dark',
            listSurface: 'light',
          })}
          pagination={{
            page: 1,
            prevPage: null,
            nextPage: 2,
            totalPages: 2,
            hasPrevPage: false,
            hasNextPage: true,
          }}
        />
        <Footer
          siteConfig={config}
          navigation={footerNavigationSchema.parse({
            contactForm: { ...samples.strick[3], show: true },
            latestPosts: { show: false },
            tagline: 'Representative music site',
          })}
          posts={{ docs: posts }}
        />
      </>
    )
    for (const [name, view] of Object.entries(views)) {
      const markup = renderToStaticMarkup(
        <SiteConfigProvider config={config}>
          {view}
          {name === 'code' ? (
            <Footer
              siteConfig={config}
              navigation={footerNavigationSchema.parse({
                newsletter: {
                  show: true,
                  heading: 'Notes From the Lab',
                  submitLabel: 'Get the notes',
                  successMessage: 'Thanks',
                },
                latestPosts: { show: true, limit: 2 },
              })}
              posts={{ docs: posts.slice(0, 2) }}
            />
          ) : null}
        </SiteConfigProvider>,
      )
      expect(markup).not.toContain('undefined')
      expect(markup).toContain(
        name === 'archive'
          ? 'Mixtapes'
          : name === 'strick'
            ? 'Featured DJ Mixes'
            : name === 'code'
              ? 'Four Steps'
              : 'Career Highlights',
      )
      if (output) {
        await mkdir(output, { recursive: true })
        await writeFile(
          resolve(output, `${name}.html`),
          `<!doctype html><html data-theme="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${tokens}${siteConfigCSS(config)}${css}${shared}</style></head><body>${markup}</body></html>`,
        )
      }
    }
  })
})
