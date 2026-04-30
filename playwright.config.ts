import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';

const localChromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const localChrome = existsSync(localChromePath)
  ? { launchOptions: { executablePath: localChromePath } }
  : {};

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], ...localChrome }
    }
  ]
});
