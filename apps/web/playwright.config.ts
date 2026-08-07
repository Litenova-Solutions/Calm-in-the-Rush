import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: 'http://127.0.0.1:3200', trace: 'on-first-retry' },
  webServer:
    process.env.CI === 'true' || process.env.CALM_E2E_SERVER === '1'
      ? {
          command: 'pnpm dev',
          url: 'http://127.0.0.1:3200',
          reuseExistingServer: true,
          timeout: 120_000,
        }
      : undefined,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], viewport: { width: 390, height: 844 } },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], viewport: { width: 320, height: 568 } },
    },
  ],
});
