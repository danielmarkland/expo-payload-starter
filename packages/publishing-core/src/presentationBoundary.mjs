import { readFile, readdir } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'

/** Public presentation and CMS behavior share one owner. Both hosts use this policy; TypeScript is supplied by the host's tooling. */
export async function checkPresentationBoundaries(appRoot, ts) {
  const errors = []
  async function files(directory) {
    let entries
    try {
      entries = await readdir(directory, { withFileTypes: true })
    } catch (error) {
      if (error.code === 'ENOENT') return []
      throw error
    }
    return (
      await Promise.all(
        entries.map((entry) =>
          entry.isDirectory()
            ? files(join(directory, entry.name))
            : [join(directory, entry.name)],
        ),
      )
    ).flat()
  }
  for (const file of await files(join(appRoot, 'src'))) {
    const name = relative(join(appRoot, 'src'), file).replaceAll('\\', '/')
    const publicPresentation =
      name.startsWith('app/(frontend)/') ||
      name.startsWith('lib/') ||
      name.startsWith('components/')
    const protectedAdapter = [
      'lib/siteConfig.ts',
      'lib/linkIcons.ts',
      'lib/headerNavigationIcons.ts',
    ].includes(name)
    const publishingResource =
      /^(collections|globals)\/(?!Users\.ts$|Tenants\.ts$)[^/]+\.ts$/.test(name)
    if (!publicPresentation && !protectedAdapter && !publishingResource)
      continue
    const text = await readFile(file, 'utf8')
    const fail = (message) =>
      errors.push(
        `${file}: ${message}; keep shared publishing behavior in publishing packages and host policies in their service owners`,
      )
    if (file.endsWith('.css')) {
      const remainder = text
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(
          /@import\s+['"]@danielmarkland\/(?:publishing-ui|design-tokens)\/[^'"]+['"]\s*;/g,
          '',
        )
        .trim()
      if (remainder)
        fail('host stylesheet must only import shared publishing styles')
      continue
    }
    if (!/\.[cm]?[jt]sx?$/.test(file)) continue
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true)
    if (publishingResource) {
      const imports = new Map()
      for (const statement of source.statements) {
        if (
          ts.isImportDeclaration(statement) &&
          ts.isStringLiteralLike(statement.moduleSpecifier) &&
          statement.moduleSpecifier.text.startsWith(
            '@danielmarkland/publishing-core/',
          )
        ) {
          for (const element of statement.importClause?.namedBindings
            ?.elements || [])
            imports.set(
              element.name.text,
              (element.propertyName || element.name).text,
            )
        }
      }
      for (const statement of source.statements) {
        if (
          !ts.isVariableStatement(statement) ||
          !statement.modifiers?.some(
            (mod) => mod.kind === ts.SyntaxKind.ExportKeyword,
          )
        )
          continue
        for (const declaration of statement.declarationList.declarations) {
          const value = declaration.initializer
          const owned =
            value &&
            ts.isCallExpression(value) &&
            ts.isIdentifier(value.expression) &&
            /^create[A-Z]\w*(Collection|Global)$/.test(
              imports.get(value.expression.text) || '',
            )
          if (!owned)
            fail(
              'CMS definitions must invoke a shared collection/global factory; host supplies access, indexes and integration options',
            )
        }
      }
    }
    const shell = name === 'app/(frontend)/layout.tsx'
    const shellTags = new Set([
      'html',
      'head',
      'body',
      'style',
      'script',
      'link',
      'meta',
    ])
    function visit(node) {
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        const tag = node.tagName.getText(source)
        if (/^[a-z]/.test(tag) && (!shell || !shellTags.has(tag)))
          fail(`host renders owned publishing markup <${tag}>`)
      }
      if (
        ts.isCallExpression(node) &&
        /^(?:React\.)?createElement$/.test(node.expression.getText(source)) &&
        node.arguments[0] &&
        ts.isStringLiteralLike(node.arguments[0])
      )
        fail('host creates publishing DOM directly')
      const reference =
        ts.isImportDeclaration(node) || ts.isExportDeclaration(node)
          ? node.moduleSpecifier
          : ts.isCallExpression(node) &&
              (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
                node.expression.getText(source) === 'require')
            ? node.arguments[0]
            : ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)
              ? node.argument.literal
              : undefined
      if (reference && ts.isStringLiteralLike(reference)) {
        const target = reference.text
        const hostTarget = target.startsWith('@/')
          ? target.slice(2)
          : target.startsWith('.')
            ? relative(
                join(appRoot, 'src'),
                resolve(dirname(file), target),
              ).replaceAll('\\', '/')
            : null
        if (
          /^lib\/(publishing|tenants|domains|siteTransfer|profile|supabase|auth)\//.test(
            name,
          ) &&
          hostTarget &&
          /^lib\/api(?:\/|$)/.test(hostTarget)
        )
          fail('business services must not depend on the HTTP API layer')
        if (
          /^(?:next\/image|next\/font|react-icons(?:\/|$)|lucide-react$|@payloadcms\/richtext-lexical\/react)/.test(
            target,
          )
        )
          fail(`host imports presentation implementation ${target}`)
        if (
          protectedAdapter &&
          target.startsWith('@danielmarkland/design-tokens')
        )
          fail('theme resolution belongs to publishing-core')
      }
      if (
        protectedAdapter &&
        (ts.isFunctionDeclaration(node) || ts.isVariableDeclaration(node)) &&
        node.name &&
        [
          'siteConfigCSS',
          'mixHex',
          'resolvePalette',
          'linkIconDefinitions',
        ].includes(node.name.getText(source))
      )
        fail('host duplicates a shared presentation helper')
      if (
        (publicPresentation || publishingResource) &&
        ts.isFunctionDeclaration(node) &&
        node.name &&
        [
          'verifyTurnstile',
          'escapeHTML',
          'publishedPostConditions',
          'publishedDocumentConditions',
          'documentMetadata',
          'siteMetadata',
          'sitemapEntries',
          'syncSearchDocument',
          'createSearchFields',
          'validPreviewHeader',
          'publishingErrorResponse',
          'publishingCacheControl',
        ].includes(node.name.text)
      )
        fail('host duplicates shared publishing behavior')
      if (
        name.startsWith('lib/') &&
        ts.isCallExpression(node) &&
        node.expression.getText(source) === 'fetch' &&
        node.arguments[0] &&
        ts.isStringLiteralLike(node.arguments[0]) &&
        /turnstile|mailerlite/.test(node.arguments[0].text)
      )
        fail('form provider logic belongs to publishing-core/formDelivery')
      if (
        name.startsWith('lib/api/') &&
        ts.isCallExpression(node) &&
        node.expression.getText(source) === 'createRoute' &&
        node.arguments[0] &&
        ts.isObjectLiteralExpression(node.arguments[0])
      ) {
        const path = node.arguments[0].properties.find(
          (property) => property.name?.getText(source) === 'path',
        )?.initializer
        if (
          path &&
          ts.isStringLiteralLike(path) &&
          new Set([
            '/site-config',
            '/site-metadata',
            '/navigation',
            '/pages/{slug}',
            '/posts',
            '/posts/{slug}',
            '/search',
            '/sitemap',
            '/redirects',
            '/contact',
            '/newsletter',
          ]).has(path.text)
        )
          fail(
            'publishing route definitions belong to publishing-contracts/publishingApi',
          )
      }
      ts.forEachChild(node, visit)
    }
    visit(source)
  }
  return [...new Set(errors)]
}

export const checkPublishingBoundaries = checkPresentationBoundaries
