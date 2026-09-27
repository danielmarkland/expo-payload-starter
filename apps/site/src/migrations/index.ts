import * as migration_20260926_033310_initial_cms from './20260926_033310_initial_cms'
import * as migration_20260926_205749_add_pages from './20260926_205749_add_pages'
import * as migration_20260926_210416_add_latest_posts from './20260926_210416_add_latest_posts'
import * as migration_20260926_213242 from './20260926_213242'
import * as migration_20260927_020507_header_navigation_logo_and_icons from './20260927_020507_header_navigation_logo_and_icons'
import * as migration_20260927_043014_homepage_migration from './20260927_043014_homepage_migration'
import * as migration_20260927_162621_hero_headline from './20260927_162621_hero_headline'
import * as migration_20260927_164523_runtime_site_theme from './20260927_164523_runtime_site_theme'
import * as migration_20260927_171523_light_dark_logos from './20260927_171523_light_dark_logos'
import * as migration_20260927_173134_configurable_header_search from './20260927_173134_configurable_header_search'
import * as migration_20260927_185854_section_appearance from './20260927_185854_section_appearance'
import * as migration_20260927_204325_reusable_layout_capabilities from './20260927_204325_reusable_layout_capabilities'

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
  {
    up: migration_20260927_162621_hero_headline.up,
    down: migration_20260927_162621_hero_headline.down,
    name: '20260927_162621_hero_headline',
  },
  {
    up: migration_20260927_164523_runtime_site_theme.up,
    down: migration_20260927_164523_runtime_site_theme.down,
    name: '20260927_164523_runtime_site_theme',
  },
  {
    up: migration_20260927_171523_light_dark_logos.up,
    down: migration_20260927_171523_light_dark_logos.down,
    name: '20260927_171523_light_dark_logos',
  },
  {
    up: migration_20260927_173134_configurable_header_search.up,
    down: migration_20260927_173134_configurable_header_search.down,
    name: '20260927_173134_configurable_header_search',
  },
  {
    up: migration_20260927_185854_section_appearance.up,
    down: migration_20260927_185854_section_appearance.down,
    name: '20260927_185854_section_appearance',
  },
  {
    up: migration_20260927_204325_reusable_layout_capabilities.up,
    down: migration_20260927_204325_reusable_layout_capabilities.down,
    name: '20260927_204325_reusable_layout_capabilities',
  },
]
