import { readFile, readdir } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { builtinModules } from 'node:module'
import ts from 'typescript'

const builtins = new Set(
  builtinModules.map((name) => name.replace(/^node:/, '')),
)
export async function checkPackage(
  directory,
  { allowed, published = false } = {},
) {
  const root = resolve(directory)
  const manifest = JSON.parse(
    await readFile(join(root, 'package.json'), 'utf8'),
  )
  const runtime = { ...manifest.dependencies, ...manifest.peerDependencies }
  const errors = []
  if (allowed) {
    for (const name of Object.keys(runtime)) {
      if (!allowed.has(name))
        errors.push(
          `${manifest.name}: forbidden dependency declaration ${name}`,
        )
    }
  }
  for (const file of await sourceFiles(join(root, 'src'))) {
    const source = ts.createSourceFile(
      file,
      await readFile(file, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
    )
    const isTest = /\.(test|spec)\.[cm]?[jt]sx?$/.test(file)
    const declared = isTest
      ? { ...runtime, ...manifest.devDependencies }
      : runtime
    function visit(node) {
      let specifier
      if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node))
        specifier = node.moduleSpecifier
      else if (
        ts.isCallExpression(node) &&
        (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
          node.expression.getText(source) === 'require')
      )
        specifier = node.arguments[0]
      else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument))
        specifier = node.argument.literal
      if (specifier && ts.isStringLiteralLike(specifier)) {
        const value = specifier.text
        if (value.startsWith('.')) {
          if (relative(root, resolve(dirname(file), value)).startsWith('..'))
            errors.push(`${file}: import escapes package: ${value}`)
        } else {
          const name = value.startsWith('@')
            ? value.split('/').slice(0, 2).join('/')
            : value.split('/')[0]
          if (value.startsWith('@/') || value.startsWith('~/'))
            errors.push(`${file}: application alias ${value}`)
          else if (
            published &&
            (name.startsWith('@starter/') || name.startsWith('@groovepost/'))
          )
            errors.push(`${file}: private application dependency ${name}`)
          else if (!builtins.has(name.replace(/^node:/, ''))) {
            if (!declared[name])
              errors.push(`${file}: undeclared dependency ${name}`)
            if (allowed && !allowed.has(name) && !isTest)
              errors.push(`${file}: forbidden dependency ${name}`)
          }
        }
      }
      ts.forEachChild(node, visit)
    }
    visit(source)
  }
  return errors
}
export async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  return (
    await Promise.all(
      entries.map(async (entry) => {
        const path = join(directory, entry.name)
        if (entry.isDirectory()) return sourceFiles(path)
        return /\.[cm]?[jt]sx?$/.test(entry.name) ? [path] : []
      }),
    )
  ).flat()
}
