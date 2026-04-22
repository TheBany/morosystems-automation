import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry failed tests once locally, twice on CI — absorbs occasional server throttling on morosystems.cz */
  retries: process.env.CI ? 2 : 1,
  /* 4 workers locally for parallelization demo; 1 on CI for deterministic runs */
  workers: process.env.CI ? 1 : 4,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  /* Shared settings for all the projects below. */
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'cs-CZ',
    timezoneId: 'Europe/Prague',
  },

  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.05,
    },
  },

  updateSnapshots: 'missing',

  /* Configure projects for major browsers and mobile viewports */
  projects: [
    // Functional tests — all browsers and viewports
    {
      name: 'chromium',
      testDir: './tests/gui',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      testDir: './tests/gui',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      testDir: './tests/gui',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Microsoft Edge',
      testDir: './tests/gui',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    {
      name: 'Desktop Large',
      testDir: './tests/gui',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'Mobile Chrome',
      testDir: './tests/gui',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      testDir: './tests/gui',
      use: { ...devices['iPhone 13'] },
    },

    // Visual regression — Chromium-based only.
    // Different browser engines render subtly differently (fonts, anti-aliasing),
    // which causes pixel-level diffs that aren't real regressions.
    {
      name: 'visual-mobile',
      testDir: './tests/visual',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'visual-desktop',
      testDir: './tests/visual',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'visual-desktop-large',
      testDir: './tests/visual',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },

    // API tests — run against local todo-be instance (http://localhost:8080)
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: 'http://localhost:8080',
      },
    },
  ],
});