import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const tokens = JSON.parse(
  await readFile(resolve(root, 'src/tokens.json'), 'utf8'),
)
const outputPath = resolve(root, 'src/theme.css')

function kebabCase(value) {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
}

function declarations(values, prefix, indentation = '  ') {
  return Object.entries(values)
    .map(([key, value]) => {
      const unit = ['font-size', 'space', 'radius', 'layout'].includes(prefix)
        ? 'px'
        : ''
      return `${indentation}--${prefix}-${kebabCase(key)}: ${value}${unit};`
    })
    .join('\n')
}

function themeBlock(mode, values, selector) {
  return `${selector} {\n  color-scheme: ${mode};\n${declarations(values, 'color')}\n}`
}

const dark = themeBlock('dark', tokens.themes.dark, ':root')
const light = themeBlock(
  'light',
  tokens.themes.light,
  ":root[data-theme='light']",
)
const shared = [
  declarations(
    Object.fromEntries(
      Object.entries(tokens.fonts.weights).map(([name, weight]) => [
        name,
        weight,
      ]),
    ),
    'font-weight',
  ),
  declarations(tokens.fontSizes, 'font-size'),
  declarations(tokens.lineHeights, 'line-height'),
  declarations(tokens.spacing, 'space'),
  declarations(tokens.radii, 'radius'),
  declarations(tokens.layout, 'layout'),
].join('\n')

const mediaLight = `@media (prefers-color-scheme: light) {\n  :root:not([data-theme]) {\n    color-scheme: light;\n${declarations(tokens.themes.light, 'color', '    ')}\n  }\n}`
const css = `${dark}\n${light}\n${mediaLight}\n:root {\n${shared}\n}\n`

if (process.argv.includes('--check')) {
  let existing = ''
  try {
    existing = await readFile(outputPath, 'utf8')
  } catch {}
  if (existing !== css) {
    console.error(
      'Generated theme.css is out of date. Run pnpm --filter @starter/design-tokens generate:css.',
    )
    process.exitCode = 1
  }
} else {
  await writeFile(outputPath, css)
}
