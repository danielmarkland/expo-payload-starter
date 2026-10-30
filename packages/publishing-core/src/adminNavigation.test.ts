import { expect, it } from 'vitest'
import { publishingAdminNavigation } from './adminNavigation.js'
it('shares Content and Site ordering across global and tenant registrations without hosting links', () => {
  const groups = publishingAdminNavigation({
    collections: ['pages', 'posts', 'media', 'users'],
    globals: ['siteSettings', 'headerNavigation', 'footerNavigation'],
  })
  expect(groups.map((group) => group.label)).toEqual(['Content', 'Site'])
  expect(groups[0]?.links.map((link) => link.label)).toEqual([
    'Posts',
    'Pages',
    'Media',
  ])
  expect(groups[1]?.links.map((link) => link.label)).toEqual([
    'Overview',
    'Site Settings',
    'Header',
    'Footer',
    'Users',
  ])
  expect(
    groups
      .flatMap((group) => group.links)
      .some((link) => /domains|apps|services/.test(link.href)),
  ).toBe(false)
  expect(
    publishingAdminNavigation(
      { collections: ['site-settings'], globals: [] },
      '/admin/tenant',
    )[1]?.links,
  ).toContainEqual({
    href: '/admin/collections/site-settings',
    label: 'Site Settings',
  })
})
