import * as migration_20260926_033310_initial_cms from './20260926_033310_initial_cms'

export const migrations = [
  {
    up: migration_20260926_033310_initial_cms.up,
    down: migration_20260926_033310_initial_cms.down,
    name: '20260926_033310_initial_cms',
  },
]
