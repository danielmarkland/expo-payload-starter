const path = require('node:path')

const brand = require('../../packages/brand/src/brand.json')
const tokens = require('../../packages/design-tokens/src/tokens.json')
const asset = (filename) =>
  path.resolve(__dirname, '../../packages/brand/assets', filename)

module.exports = {
  name: brand.appTitle,
  slug: 'expo-payload-starter',
  version: '1.0.0',
  scheme: 'expopayloadstarter',
  orientation: 'default',
  icon: asset(brand.assets.appIcon),
  userInterfaceStyle: 'automatic',
  splash: {
    image: asset(brand.assets.splashIcon),
    imageWidth: 200,
    resizeMode: 'contain',
    backgroundColor: tokens.themes.dark.surface,
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.example.expopayloadstarter',
  },
  android: {
    adaptiveIcon: {
      backgroundColor: tokens.themes.dark.surface,
      foregroundImage: asset(brand.assets.androidForeground),
      backgroundImage: asset(brand.assets.androidBackground),
      monochromeImage: asset(brand.assets.androidMonochrome),
    },
    predictiveBackGestureEnabled: false,
    package: 'com.example.expopayloadstarter',
  },
  web: {
    bundler: 'metro',
    output: 'single',
    name: brand.appTitle,
    shortName: brand.shortName,
    favicon: asset(brand.assets.favicon),
  },
  plugins: ['expo-router', 'expo-secure-store'],
}
