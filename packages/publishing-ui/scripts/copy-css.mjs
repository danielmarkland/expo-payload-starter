import { copyFile } from 'node:fs/promises'
for (const name of [
  'base',
  'LoadingRegion',
  'CustomerCommerce',
  'layout',
  'FunnelControls',
  'FunnelLayout',
  'PortableFonts',
])
  await copyFile(`src/${name}.css`, `dist/${name}.css`)
for (const name of [
  'ColorPickerField',
  'IconPickerField',
  'IdentifierDisplay',
]) {
  await copyFile(`src/admin/${name}.css`, `dist/admin/${name}.css`)
}
