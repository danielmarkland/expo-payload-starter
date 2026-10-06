import { copyFile } from 'node:fs/promises'
await copyFile('src/layout.css', 'dist/layout.css')
for (const name of ['ColorPickerField', 'IconPickerField']) {
  await copyFile(`src/admin/${name}.css`, `dist/admin/${name}.css`)
}
