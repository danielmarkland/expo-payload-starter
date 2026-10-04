import { copyFile } from 'node:fs/promises'
for (const name of ['ColorPickerField', 'IconPickerField']) {
  await copyFile(`src/admin/${name}.css`, `dist/admin/${name}.css`)
}
