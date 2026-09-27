import * as migration_20260926_033310_initial_cms from './20260926_033310_initial_cms'
import * as migration_20260926_205749_add_pages from './20260926_205749_add_pages'
import * as migration_20260926_210416_add_latest_posts from './20260926_210416_add_latest_posts'
import * as migration_20260926_213242 from './20260926_213242'

export const migrations = [
  {
    up: migration_20260926_033310_initial_cms.up,
    down: migration_20260926_033310_initial_cms.down,
    name: '20260926_033310_initial_cms',
  },
  {
    up: migration_20260926_205749_add_pages.up,
    down: migration_20260926_205749_add_pages.down,
    name: '20260926_205749_add_pages',
  },
  {
    up: migration_20260926_210416_add_latest_posts.up,
    down: migration_20260926_210416_add_latest_posts.down,
    name: '20260926_210416_add_latest_posts',
  },
  {
    up: migration_20260926_213242.up,
    down: migration_20260926_213242.down,
    name: '20260926_213242',
  },
]
