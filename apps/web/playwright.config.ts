import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  // Declared worker and fixture model (FTEST.ISOLATION.001): a fixed worker count
  // so a pass is reproducible, one browser context per test, no shared mutable
  // fixture, and no retries that would hide an isolation failure.
  fullyParallel: true,
  workers: 4,
  retries: 0,
  reporter: [['list']],
  use: { baseURL: 'http://127.0.0.1:3200', trace: 'on-first-retry' },
  // The browser gate starts its own server by default so `pnpm verify` actually
  // exercises it. A suite that skips itself and still reports success is a masked
  // gate. Set CALM_E2E_NO_SERVER=1 only in an environment that cannot listen.
  webServer:
    process.env.CALM_E2E_NO_SERVER === '1'
      ? undefined
      : {
          command: 'pnpm dev',
          url: 'http://127.0.0.1:3200',
          reuseExistingServer: true,
          timeout: 120_000,
        },
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
