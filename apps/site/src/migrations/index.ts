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
import * as migration_20260928_181815 from './20260928_181815'
import * as migration_20260928_193114_page_section_anchors_eyebrows from './20260928_193114_page_section_anchors_eyebrows'
import * as migration_20260928_232313_expand_page_block_appearance from './20260928_232313_expand_page_block_appearance'
import * as migration_20260928_235332_structured_footer from './20260928_235332_structured_footer'
import * as migration_20260929_004712_button_variants from './20260929_004712_button_variants'
import * as migration_20260929_010246_contact_form_button_variant from './20260929_010246_contact_form_button_variant'
import * as migration_20260929_015744_minimal_runtime_configuration from './20260929_015744_minimal_runtime_configuration'
import * as migration_20260929_025039_global_footer_conversion_sections from './20260929_025039_global_footer_conversion_sections'
import * as migration_20260929_031022_remove_footer_app_link from './20260929_031022_remove_footer_app_link'
import * as migration_20260930_014425_consistent_link_controls from './20260930_014425_consistent_link_controls'
import * as migration_20260930_023515_expanded_icon_picker from './20260930_023515_expanded_icon_picker'
import * as migration_20261005_230402_practical_layout_coverage from './20261005_230402_practical_layout_coverage'
import * as migration_20261005_site_transfer_gates from './20261005_site_transfer_gates'

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
  {
    up: migration_20260928_181815.up,
    down: migration_20260928_181815.down,
    name: '20260928_181815',
  },
  {
    up: migration_20260928_193114_page_section_anchors_eyebrows.up,
    down: migration_20260928_193114_page_section_anchors_eyebrows.down,
    name: '20260928_193114_page_section_anchors_eyebrows',
  },
  {
    up: migration_20260928_232313_expand_page_block_appearance.up,
    down: migration_20260928_232313_expand_page_block_appearance.down,
    name: '20260928_232313_expand_page_block_appearance',
  },
  {
    up: migration_20260928_235332_structured_footer.up,
    down: migration_20260928_235332_structured_footer.down,
    name: '20260928_235332_structured_footer',
  },
  {
    up: migration_20260929_004712_button_variants.up,
    down: migration_20260929_004712_button_variants.down,
    name: '20260929_004712_button_variants',
  },
  {
    up: migration_20260929_010246_contact_form_button_variant.up,
    down: migration_20260929_010246_contact_form_button_variant.down,
    name: '20260929_010246_contact_form_button_variant',
  },
  {
    up: migration_20260929_015744_minimal_runtime_configuration.up,
    down: migration_20260929_015744_minimal_runtime_configuration.down,
    name: '20260929_015744_minimal_runtime_configuration',
  },
  {
    up: migration_20260929_025039_global_footer_conversion_sections.up,
    down: migration_20260929_025039_global_footer_conversion_sections.down,
    name: '20260929_025039_global_footer_conversion_sections',
  },
  {
    up: migration_20260929_031022_remove_footer_app_link.up,
    down: migration_20260929_031022_remove_footer_app_link.down,
    name: '20260929_031022_remove_footer_app_link',
  },
  {
    up: migration_20260930_014425_consistent_link_controls.up,
    down: migration_20260930_014425_consistent_link_controls.down,
    name: '20260930_014425_consistent_link_controls',
  },
  {
    up: migration_20260930_023515_expanded_icon_picker.up,
    down: migration_20260930_023515_expanded_icon_picker.down,
    name: '20260930_023515_expanded_icon_picker',
  },
  {
    up: migration_20261005_site_transfer_gates.up,
    down: migration_20261005_site_transfer_gates.down,
    name: '20261005_site_transfer_gates',
  },
  {
    up: migration_20261005_230402_practical_layout_coverage.up,
    down: migration_20261005_230402_practical_layout_coverage.down,
    name: '20261005_230402_practical_layout_coverage',
  },
]
