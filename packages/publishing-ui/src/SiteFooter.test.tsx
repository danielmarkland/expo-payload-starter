import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type { ComponentProps } from 'react'
import { createElement } from 'react'
import { resolvePublishingSiteConfig } from '@danielmarkland/publishing-core/siteConfig'
import { footerTextContent } from '@danielmarkland/publishing-core/footerMigration'
import { createSiteFooter } from './SiteFooter.js'
import { createLinkComponents } from './LinkAction.js'
vi.mock('next/link', () => ({
  default: ({ children, ...props }: ComponentProps<'a'>) =>
    createElement('a', props, children),
}))
vi.mock('next/image', () => ({
  default: ({
    unoptimized: _u,
    ...props
  }: ComponentProps<'img'> & { unoptimized?: boolean }) =>
    createElement('img', props),
}))
const { ContentLink } = createLinkComponents(() => undefined)
const Footer = createSiteFooter({
  ContentLink,
  getHeaderNavigationIcon: () => undefined,
  NewsletterForm: ({ destinationId, submitLabel }) => (
    <form data-destination={destinationId}>
      <input name="email" />
      <button>{submitLabel}</button>
    </form>
  ),
  ContactForm: ({ submitLabel }) => (
    <form>
      <input name="message" />
      <button>{submitLabel}</button>
    </form>
  ),
})
const siteConfig = resolvePublishingSiteConfig(
  {
    appTitle: 'Example',
    siteTitle: 'Example',
    shortName: 'Example',
    siteDescription: 'Example publication',
  },
  'https://example.com',
)
describe('composable footer', () => {
  it('keeps blank spacing defaults stable when persisted fields become null', () => {
    function render(appearance?: {
      paddingTop?: null | string
      paddingBottom?: null | string
    }) {
      return renderToStaticMarkup(
        <Footer
          siteConfig={siteConfig}
          posts={{ docs: [] }}
          navigation={{
            contentAreas: [
              {
                id: 'area',
                appearance,
                columns: [
                  {
                    id: 'column',
                    blocks: [{ id: 'copy', blockType: 'copyright' }],
                  },
                ],
              },
            ],
          }}
        />,
      )
    }
    expect(render({ paddingTop: null, paddingBottom: null })).toBe(render())
    expect(render()).toContain('padding-top-md padding-bottom-md')
    const explicit = render({ paddingTop: 'none', paddingBottom: 'lg' })
    expect(explicit).toContain('padding-top-none padding-bottom-lg')
    expect(explicit).not.toContain('padding-top-md')
  })
  it('renders each component anywhere without reserved form sections', () => {
    const html = renderToStaticMarkup(
      <Footer
        siteConfig={siteConfig}
        posts={{ docs: [] }}
        navigation={{
          contentAreas: [
            {
              id: 'area',
              title: 'Main',
              columns: [
                {
                  id: 'one',
                  blocks: [
                    { id: 'logo', blockType: 'logo' },
                    {
                      id: 'text',
                      blockType: 'text',
                      content: footerTextContent('Description'),
                    },
                    {
                      id: 'contact',
                      blockType: 'contactForm',
                      heading: 'Contact',
                      submitLabel: 'Send',
                      successMessage: 'Sent',
                    },
                  ],
                },
                {
                  id: 'two',
                  blocks: [
                    {
                      id: 'newsletter',
                      blockType: 'newsletter',
                      heading: 'Updates',
                      destinationId: 'news',
                      submitLabel: 'Subscribe',
                      successMessage: 'Subscribed',
                    },
                    {
                      id: 'links',
                      blockType: 'links',
                      items: [{ label: 'About', type: 'url', url: '/about' }],
                    },
                    { id: 'copyright', blockType: 'copyright' },
                  ],
                },
              ],
            },
          ],
        }}
      />,
    )
    expect(html).toContain('Description')
    expect(html).toContain('data-destination="news"')
    expect(html).toContain('href="/about"')
    expect(html.match(/<form/g)).toHaveLength(2)
    expect(html).toContain(`© ${new Date().getFullYear()}`)
  })
  it('does not add blank sections for empty areas or disabled components', () => {
    const html = renderToStaticMarkup(
      <Footer
        siteConfig={siteConfig}
        posts={{ docs: [] }}
        navigation={{
          contentAreas: [
            { columns: [{ blocks: [] }] },
            { columns: [{ blocks: [{ blockType: 'logo', enabled: false }] }] },
          ],
        }}
      />,
    )
    expect(html).not.toContain('<section')
  })
})
