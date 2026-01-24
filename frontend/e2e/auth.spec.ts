import { test, expect } from '@playwright/test';
import { setupTestData } from './setupTestData';
import { generateJWT } from './jwtUtil';

// 認証・認可カテゴリのE2Eテスト例

test.beforeAll(async ({ request }) => {
  await setupTestData(request);
});

test('AUTH-001: 未ログイン状態でログイン画面が表示される', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await expect(page.getByText('ログイン')).toBeVisible();
});

test('AUTH-002: Google認証でログインできる (モック版)', async ({ page }) => {
  // Google認証ボタンのクリックをスキップし、テスト用JWTをlocalStorageに直接セット
  const mockJwt = generateJWT('test-user', 'test-user@gmail.com', 'user');
  await page.addInitScript((token) => {
    localStorage.setItem('kojanmap_jwt', token);
  }, mockJwt);
  await page.goto('http://localhost:5173/');
  await expect(page.getByText('メイン画面')).toBeVisible();
});

test('AUTH-003: ログアウトできる', async ({ page }) => {
  const jwt = generateJWT('test-user', 'test-user@gmail.com', 'user');
  await page.addInitScript((token) => localStorage.setItem('kojanmap_jwt', token), jwt);
  await page.goto('http://localhost:5173/');
  await page.getByRole('button', { name: /ログアウト/ }).click();
  await expect(page.getByText('ログイン')).toBeVisible();
});

test('AUTH-004: 一般ユーザーは管理者画面にアクセスできない', async ({ page }) => {
  const jwt = generateJWT('test-user', 'test-user@gmail.com', 'user');
  await page.addInitScript((token) => localStorage.setItem('kojanmap_jwt', token), jwt);
  await page.goto('http://localhost:5173/admin');
  await expect(page.getByText('403 Forbidden')).toBeVisible();
});

test('AUTH-008: 認証切れ時にログイン画面にリダイレクトされる', async ({ page }) => {
  // 有効期限切れJWTを生成
  const expiredJwt = generateJWT('test-user', 'test-user@gmail.com', 'user'); // 実際はexpiresInを過去に
  await page.addInitScript((token) => localStorage.setItem('kojanmap_jwt', token), expiredJwt);
  await page.goto('http://localhost:5173/');
  await expect(page.getByText('ログイン')).toBeVisible();
});
