import { readFile, access } from 'node:fs/promises'
import assert from 'node:assert/strict'
import { test } from 'node:test'
const publicFiles = [
  'LoadingRegion',
  'PostList',
  'PostArchive',
  'LatestPostsSection',
  'SiteBrand',
  'SiteHeader',
  'GoogleTagManager',
  'PageRenderer',
  'LinkAction',
  'SiteFooter',
  'postHeadings',
  'Identifier',
  'identifiers',
]
const clientFiles = [
  'HeaderSurface',
  'HeroSurface',
  'FunnelControls',
  'ProductWidget',
  'ThemeToggle',
  'SiteConfigProvider',
  'TurnstileField',
  'ContactForm',
  'NewsletterForm',
  'admin/index',
  'admin/ColorPickerField',
  'admin/IconPickerField',
  'admin/FooterEditor',
  'admin/LinkRowLabel',
  'admin/UnsavedChanges',
  'admin/AdminDate',
  'admin/FormsView',
  'admin/SubmissionsView',
]

test('published component entry points include JavaScript and declarations', async () => {
  for (const name of [...publicFiles, ...clientFiles]) {
    await access(`dist/${name}.js`)
    await access(`dist/${name}.d.ts`)
  }
})
test('compiled client entry points keep their React boundary', async () => {
  for (const name of clientFiles) {
    assert.match(
      await readFile(`dist/${name}.js`, 'utf8'),
      /^['"]use client['"];/,
    )
  }
})
test('admin styles ship beside their compiled imports', async () => {
  for (const name of ['ColorPickerField', 'IconPickerField']) {
    assert.match(
      await readFile(`dist/admin/${name}.js`, 'utf8'),
      new RegExp(name + '\\.css'),
    )
    assert.ok((await readFile(`dist/admin/${name}.css`, 'utf8')).length > 0)
  }
})
test('public imports keep the optional Payload admin dependency separate', async () => {
  const source = await readFile('dist/index.js', 'utf8')
  assert.doesNotMatch(source, /admin|@payloadcms|payload/)
  const manifest = JSON.parse(await readFile('package.json', 'utf8'))
  assert.equal(manifest.peerDependenciesMeta.payload.optional, true)
  assert.equal(manifest.peerDependenciesMeta['@payloadcms/ui'].optional, true)
})

test('exports enumerate supported entry points and exclude test artifacts', async () => {
  const manifest = JSON.parse(await readFile('package.json', 'utf8'))
  assert.equal(manifest.exports['./*'], undefined)
  for (const name of [
    ...publicFiles,
    ...clientFiles.filter(
      (name) => !['admin/index', 'HeaderSurface', 'HeroSurface'].includes(name),
    ),
  ]) {
    assert.ok(manifest.exports[`./${name}`], name)
  }
  assert.equal(manifest.exports['./HeaderSurface'], undefined)
  assert.equal(manifest.exports['./HeroSurface'], undefined)
  assert.equal(manifest.exports['./PublishingComponents.test'], undefined)
})

test('compact admin identifier styles are exported and packaged', async () => {
  const manifest = JSON.parse(await readFile('package.json', 'utf8'))
  assert.equal(
    manifest.exports['./admin/IdentifierDisplay.css'],
    './dist/admin/IdentifierDisplay.css',
  )
  await access('dist/admin/IdentifierDisplay.css')
})

test('native admin layout CSS and strict list loader ship with the package', async () => {
  await access('dist/admin/AdminPresentation.css')
  await access('tooling/payload-list-actions.cjs')
})
