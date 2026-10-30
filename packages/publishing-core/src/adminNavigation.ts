type Link = { href: string; label: string }
export function publishingAdminNavigation(
  visible: { collections: string[]; globals: string[] },
  overviewURL = '/admin',
) {
  const collection = (slug: string, label: string): Link[] =>
    visible.collections.includes(slug)
      ? [{ href: `/admin/collections/${slug}`, label }]
      : []
  const singleton = (
    collectionSlug: string,
    globalSlug: string,
    label: string,
  ): Link[] =>
    visible.collections.includes(collectionSlug)
      ? collection(collectionSlug, label)
      : visible.globals.includes(globalSlug)
        ? [{ href: `/admin/globals/${globalSlug}`, label }]
        : []
  return [
    {
      label: 'Content',
      links: [
        ...collection('posts', 'Posts'),
        ...collection('pages', 'Pages'),
        ...collection('media', 'Media'),
        ...collection('authors', 'Authors'),
        ...collection('categories', 'Categories'),
        ...collection('tags', 'Tags'),
      ],
    },
    {
      label: 'Site',
      links: [
        { href: overviewURL, label: 'Overview' },
        ...singleton('site-settings', 'siteSettings', 'Site Settings'),
        ...singleton('header-navigation', 'headerNavigation', 'Header'),
        ...singleton('footer-navigation', 'footerNavigation', 'Footer'),
        ...collection('landing-pages', 'Landing Pages'),
        ...collection('redirects', 'Redirects'),
        ...collection('users', 'Users'),
      ],
    },
  ]
}
