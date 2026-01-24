import { test, expect } from '@playwright/test';
import { setupTestData } from './setupTestData';
import { generateJWT } from './jwtUtil';

test.beforeAll(async ({ request }) => {
  await setupTestData(request);
});

// 投稿機能テスト雛形

test('POST-001: 投稿を作成できる', async ({ page }) => {
  const jwt = generateJWT('test-user', 'test-user@gmail.com', 'user');
  await page.addInitScript((token) => localStorage.setItem('kojanmap_jwt', token), jwt);
  await page.goto('http://localhost:5173/');
  // 投稿作成画面の操作雛形
  // ...
  await expect(page.getByText('投稿が作成されました')).toBeVisible();
});

test('POST-002: 画像付き投稿を作成できる', async () => {
  // ...
});

test('POST-003: 必須項目未入力で投稿できない', async () => {
  // ...
});

test('POST-004: 位置情報を正しく保存できる', async () => {
  // ...
});

test('POST-005: 投稿一覧が表示される', async () => {
  // ...
});

test('POST-006: ピンをクリックで詳細表示', async () => {
  // ...
});

test('POST-007: ジャンル別フィルタリングができる', async () => {
  // ...
});

test('POST-008: 自分の投稿を削除できる', async () => {
  // ...
});

test('POST-009: 他人の投稿を削除できない', async () => {
  // ...
});

test('POST-010: 事業者投稿が識別できる', async () => {
  // ...
});

test('POST-011: 投稿履歴を確認できる', async () => {
  // ...
});

test('POST-012: 人気投稿が識別できる', async () => {
  // ...
});
