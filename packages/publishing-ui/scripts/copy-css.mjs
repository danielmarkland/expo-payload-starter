import { copyFile } from 'node:fs/promises'
for (const name of [
  'base',
  'layout',
  'FunnelControls',
  'FunnelLayout',
  'PortableFonts',
])
  await copyFile(`src/${name}.css`, `dist/${name}.css`)
for (const name of ['ColorPickerField', 'IconPickerField']) {
  await copyFile(`src/admin/${name}.css`, `dist/admin/${name}.css`)
}
