import { defineConfig, devices } from '@playwright/test'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import 'dotenv/config'

const serverURL = process.env.SITE_URL || 'http://localhost:3000'
const localURL = new URL(serverURL)
if (localURL.protocol !== 'http:' || !['localhost', '127.0.0.1'].includes(localURL.hostname))
  throw Error('Browser tests require an explicit local SITE_URL')

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: 'chromium' },
    },
  ],
  webServer: {
    command: `cross-env NODE_OPTIONS=--no-deprecation next dev --port ${localURL.port || '3000'}`,
    reuseExistingServer: false,
    // The homepage is CMS-managed and intentionally returns 404 until a `home` Page is published.
    url: `${serverURL}/search`,
  },
})
