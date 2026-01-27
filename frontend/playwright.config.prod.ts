import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  workers: process.env.E2E_WORKERS ? parseInt(process.env.E2E_WORKERS) : 1,
  timeout: process.env.E2E_TIMEOUT ? parseInt(process.env.E2E_TIMEOUT) : 30000,
  retries: process.env.E2E_RETRIES ? parseInt(process.env.E2E_RETRIES) : 2,

  use: {
    baseURL: process.env.BASE_URL || 'https://localhost',
    navigationTimeout: 15000,
    actionTimeout: 10000,
    extraHTTPHeaders: {
      'User-Agent': 'E2E-Test-Bot-Production',
    },
    // スクリーンショットとビデオを有効化（本番デバッグ用）
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // 本番ではwebServer不要（既存サーバーに接続）
  webServer: undefined,

  // レポート設定
  reporter: [
    ['html', { outputFolder: 'playwright-report-production' }],
    ['json', { outputFile: 'test-results-production.json' }],
  ],
});
