import * as migration_20260926_033310_initial_cms from './20260926_033310_initial_cms'
import * as migration_20260926_205749_add_pages from './20260926_205749_add_pages'
import * as migration_20260926_210416_add_latest_posts from './20260926_210416_add_latest_posts'
import * as migration_20260926_213242 from './20260926_213242'
import * as migration_20260927_020507_header_navigation_logo_and_icons from './20260927_020507_header_navigation_logo_and_icons'
import * as migration_20260927_043014_homepage_migration from './20260927_043014_homepage_migration'

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
  {
    up: migration_20260927_020507_header_navigation_logo_and_icons.up,
    down: migration_20260927_020507_header_navigation_logo_and_icons.down,
    name: '20260927_020507_header_navigation_logo_and_icons',
  },
  {
    up: migration_20260927_043014_homepage_migration.up,
    down: migration_20260927_043014_homepage_migration.down,
    name: '20260927_043014_homepage_migration',
  },
]
