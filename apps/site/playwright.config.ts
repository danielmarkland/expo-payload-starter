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
  /* These suites edit the same CMS globals; serialize their save/restore fixtures. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',

    /* Keep the first failure trace too; retries can have different symptoms. See https://playwright.dev/docs/trace-viewer */
    trace: 'retain-on-failure',
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
