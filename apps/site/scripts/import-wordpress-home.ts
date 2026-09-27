import { JSDOM } from 'jsdom'
import { getPayload, type Payload } from 'payload'
import { config as loadEnv } from 'dotenv'

import type { Page } from '../src/payload-types.js'
import { createHeroHeadline } from '../src/lib/heroHeadline.js'

loadEnv({ path: new URL('../.env', import.meta.url) })

const wordpressURL = 'https://danielmarkland.com'
const majorHeadings = ['About', 'Expertise', 'Career Highlights', 'My Companies', 'How Can I Help?']

type WordPressPage = {
  content: { rendered: string }
  yoast_head_json?: {
    description?: string
    og_image?: Array<{ url?: string }>
    title?: string
  }
}

function text(element: Element | null | undefined) {
  return element?.textContent?.replace(/\s+/g, ' ').trim() || ''
}

function richText(paragraphs: string[]) {
  return {
    root: {
      children: paragraphs.map((paragraph) => ({
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal' as const,
            style: '',
            text: paragraph,
            type: 'text' as const,
            version: 1,
          },
        ],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        type: 'paragraph' as const,
        version: 1,
      })),
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      type: 'root' as const,
      version: 1,
    },
  }
}

function sectionGroup(document: Document, heading: string) {
  const sections = [...document.querySelectorAll('section.elementor-top-section')]
  const start = sections.findIndex((section) =>
    [...section.querySelectorAll('h2')].some((candidate) => text(candidate) === heading),
  )
  if (start === -1) throw new Error(`Could not find the WordPress section “${heading}”.`)

  const group: Element[] = []
  for (let index = start; index < sections.length; index += 1) {
    const section = sections[index]
    if (
      index > start &&
      [...section.querySelectorAll('h2')].some((candidate) =>
        majorHeadings.includes(text(candidate)),
      )
    ) {
      break
    }
    group.push(section)
  }
  return group
}

function descendants(group: Element[], selector: string) {
  return group.flatMap((section) => [...section.querySelectorAll(selector)])
}

async function fetchPage() {
  const response = await fetch(
    `${wordpressURL}/wp-json/wp/v2/pages/1174?_fields=content,yoast_head_json`,
  )
  if (!response.ok) throw new Error(`WordPress returned ${response.status} for the homepage.`)
  return (await response.json()) as WordPressPage
}

function parseHomepage(page: WordPressPage) {
  const document = new JSDOM(page.content.rendered).window.document
  const services = [...document.querySelectorAll('.elementor-icon-box-wrapper')]
    .slice(0, 4)
    .map((item) => ({
      description: text(item.querySelector('.elementor-icon-box-description')),
      title: text(item.querySelector('.elementor-icon-box-title')),
    }))

  const about = sectionGroup(document, 'About')
  const expertise = sectionGroup(document, 'Expertise')
  const career = sectionGroup(document, 'Career Highlights')
  const companies = sectionGroup(document, 'My Companies')
  const contact = sectionGroup(document, 'How Can I Help?')

  const expertiseItems = descendants(expertise, 'h3 a').map((item) => ({
    label: text(item),
    url: item.getAttribute('href') || undefined,
  }))
  const careerItems = descendants(career, '.elementor-column')
    .map((item) => {
      const link = item.querySelector('h3 a, h2 a')
      const role = [...item.querySelectorAll('h2, h4')].find(
        (candidate) => !candidate.querySelector('a'),
      )
      return link
        ? {
            description: text(item.querySelector('p')),
            name: text(link),
            role: text(role),
            url: link.getAttribute('href') || undefined,
          }
        : null
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item?.description))
  const companyItems = descendants(companies, 'a')
    .map((item) => {
      const image = item.querySelector('img')
      return image
        ? {
            alt: image.getAttribute('alt') || text(item),
            imageURL: image.getAttribute('src') || '',
            name: image.getAttribute('alt') || text(item),
            url: item.getAttribute('href') || undefined,
          }
        : null
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item?.imageURL))

  const aboutImage = descendants(about, 'img')[0]
  const contactParagraphs = descendants(contact, 'p').map(text).filter(Boolean)
  const heroHeading = text(document.querySelector('h1'))
  const heroBody = text(document.querySelector('h1')?.closest('section')?.querySelector('h2'))
  const serviceIntro = text(
    document.querySelectorAll('section.elementor-top-section')[1]?.querySelector('p'),
  )

  if (
    !heroHeading ||
    services.length !== 4 ||
    !aboutImage ||
    expertiseItems.length !== 18 ||
    careerItems.length !== 10 ||
    companyItems.length !== 2
  ) {
    throw new Error(
      `The WordPress homepage structure changed; refusing a partial import (services=${services.length}, expertise=${expertiseItems.length}, career=${careerItems.length}, companies=${companyItems.length}).`,
    )
  }

  return {
    about: {
      imageAlt: aboutImage.getAttribute('alt') || 'Daniel Markland',
      imageURL: aboutImage.getAttribute('src') || '',
      paragraphs: descendants(about, 'p').map(text).filter(Boolean),
    },
    careerItems,
    companies: companyItems,
    contactBody: contactParagraphs[0] || '',
    contactIntro: contactParagraphs[1] || '',
    expertiseIntro: descendants(expertise, 'p').map(text).find(Boolean) || '',
    expertiseItems,
    heroBody,
    heroHeading,
    meta: page.yoast_head_json,
    socialImageURL:
      page.yoast_head_json?.og_image?.[0]?.url || aboutImage.getAttribute('src') || '',
    serviceIntro,
    services,
  }
}

async function upsertMedia(payload: Payload, sourceURL: string, alt: string) {
  const filename = new URL(sourceURL).pathname.split('/').pop()
  if (!filename) throw new Error(`Could not determine a filename for ${sourceURL}`)

  const existing = await payload.find({
    collection: 'media',
    limit: 1,
    overrideAccess: true,
    where: { filename: { equals: filename } },
  })
  if (existing.docs[0]) return existing.docs[0]

  const response = await fetch(sourceURL)
  if (!response.ok) throw new Error(`Could not download ${sourceURL}: ${response.status}`)
  const data = Buffer.from(await response.arrayBuffer())

  return payload.create({
    collection: 'media',
    data: { alt },
    file: {
      data,
      mimetype: response.headers.get('content-type')?.split(';')[0] || 'application/octet-stream',
      name: filename,
      size: data.byteLength,
    },
    overrideAccess: true,
  })
}

async function run() {
  const page = await fetchPage()
  const homepage = parseHomepage(page)
  const dryRun = process.argv.includes('--dry-run')
  const publish = process.argv.includes('--publish')

  if (dryRun) {
    console.log(
      JSON.stringify(
        {
          careerHighlights: homepage.careerItems.length,
          companies: homepage.companies.length,
          expertiseLinks: homepage.expertiseItems.length,
          hero: homepage.heroHeading,
          services: homepage.services.length,
        },
        null,
        2,
      ),
    )
    return
  }

  const { default: config } = await import('../src/payload.config.js')
  const payload = await getPayload({ config })
  try {
    const portrait = await upsertMedia(payload, homepage.about.imageURL, homepage.about.imageAlt)
    const socialImage = await upsertMedia(
      payload,
      homepage.socialImageURL,
      'Daniel Markland — software engineer based in Dallas, Texas',
    )
    const companyMedia = await Promise.all(
      homepage.companies.map(async (company) => ({
        ...company,
        media: await upsertMedia(payload, company.imageURL, company.alt),
      })),
    )

    const layout: Page['layout'] = [
      {
        blockType: 'hero' as const,
        heading: createHeroHeadline(homepage.heroHeading, [
          'Daniel Markland',
          'software engineer',
          'Dallas, TX',
        ]),
        primaryButton: { label: 'Start a conversation', url: '#contact' },
        secondaryHeading: homepage.heroBody,
      },
      {
        blockType: 'featureGrid' as const,
        heading: 'How I can help',
        intro: homepage.serviceIntro,
        items: homepage.services,
      },
      {
        anchor: 'about',
        blockType: 'splitContent' as const,
        content: richText(homepage.about.paragraphs),
        heading: 'About',
        image: portrait.id,
        imagePosition: 'right' as const,
      },
      {
        anchor: 'expertise',
        blockType: 'linkGrid' as const,
        heading: 'Expertise',
        intro: homepage.expertiseIntro,
        items: homepage.expertiseItems,
      },
      {
        anchor: 'career-highlights',
        blockType: 'portfolioGrid' as const,
        heading: 'Career Highlights',
        intro:
          'My ability to combine technical decisions with business goals brings remarkable value to development projects.',
        items: homepage.careerItems,
      },
      {
        anchor: 'companies',
        blockType: 'logoCloud' as const,
        heading: 'My Companies',
        intro: 'I’m an entrepreneur at heart. Learn more about the companies I’ve launched.',
        items: companyMedia.map((company) => ({
          image: company.media.id,
          name: company.name,
          url: company.url,
        })),
      },
      {
        anchor: 'contact',
        blockType: 'contactForm' as const,
        body: [homepage.contactBody, homepage.contactIntro].filter(Boolean).join('\n\n'),
        heading: 'How Can I Help?',
        submitLabel: 'Send message',
        successMessage: 'Thanks. Your message has been sent.',
      },
    ]

    const existing = await payload.find({
      collection: 'pages',
      draft: true,
      limit: 1,
      overrideAccess: true,
      where: { slug: { equals: 'home' } },
    })
    const data = {
      _status: publish ? ('published' as const) : ('draft' as const),
      layout,
      meta: {
        description: homepage.meta?.description,
        image: socialImage.id,
        title: homepage.meta?.title,
      },
      slug: 'home',
      title: 'Home',
    }

    if (existing.docs[0]) {
      await payload.update({
        collection: 'pages',
        data,
        id: existing.docs[0].id,
        overrideAccess: true,
      })
    } else {
      await payload.create({ collection: 'pages', data, overrideAccess: true })
    }

    await payload.updateGlobal({
      data: {
        items: [
          { label: 'Contact', type: 'url', url: '#contact' },
          {
            icon: 'linkedin',
            iconOnly: true,
            label: 'LinkedIn',
            newTab: true,
            type: 'url',
            url: 'https://linkedin.com/in/danielmarkland',
          },
          {
            icon: 'twitter',
            iconOnly: true,
            label: 'X',
            newTab: true,
            type: 'url',
            url: 'https://twitter.com/danielmarkland',
          },
        ],
      },
      overrideAccess: true,
      slug: 'headerNavigation',
    })
    await payload.updateGlobal({
      data: {
        items: [
          { label: 'Contact', type: 'url', url: '#contact' },
          {
            label: 'LinkedIn',
            newTab: true,
            type: 'url',
            url: 'https://linkedin.com/in/danielmarkland',
          },
        ],
      },
      overrideAccess: true,
      slug: 'footerNavigation',
    })
    await payload.updateGlobal({
      data: {
        meta: {
          description: homepage.meta?.description,
          image: socialImage.id,
          title: 'Daniel Markland',
        },
        siteDescription: homepage.meta?.description,
      },
      overrideAccess: true,
      slug: 'siteSettings',
    })

    console.log(`Imported the WordPress homepage as ${publish ? 'published' : 'draft'} content.`)
  } finally {
    await payload.destroy()
  }
}

await run()
