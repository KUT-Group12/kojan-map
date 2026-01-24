import { test, expect } from '@playwright/test';
import { setupTestData } from './setupTestData';
import { generateJWT } from './jwtUtil';

test.describe('投稿機能E2E', () => {
  test.beforeAll(async ({ request }) => {
    await setupTestData(request);
  });

  // 投稿機能テスト雛形

  test('POST-001: 投稿を作成できる', async ({ page }) => {
    const jwt = generateJWT('test-user', 'test-user@gmail.com', 'user');
    await page.addInitScript((token) => localStorage.setItem('kojanmap_jwt', token), jwt);
    await page.goto('http://localhost:5173/');

    // 投稿作成ダイアログを開く（サイドバーの「新規投稿」ボタンを想定。なければ適宜修正）
    // 例: data-testid="open-new-post-dialog" のボタンがあればそれを使う
    // await page.getByTestId('open-new-post-dialog').click();
    // ここでは仮に最初の「新規投稿」ボタンをクリックする例
    await page
      .getByRole('button', { name: /新規投稿|投稿作成|新しい投稿/ })
      .first()
      .click();

    // 投稿フォームに入力
    const form = await page.getByTestId('new-post-form');
    await form.getByLabel('タイトル').fill('E2Eテスト投稿');
    await form.getByLabel('説明').fill('E2Eテスト用の投稿本文です');
    // ジャンル選択（最初の選択肢を選ぶ）
    await form.getByLabel('ジャンル').selectOption({ index: 0 });
    // 緯度・経度はデフォルト値を利用

    // 投稿ボタン押下
    await form.getByRole('button', { name: '投稿する' }).click();

    // 成功メッセージを待機（UIのトースト内容に合わせて修正）
    await expect(page.getByText(/投稿しました|投稿が作成されました/)).toBeVisible({
      timeout: 10000,
    });
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

  test('POST-006: ピンをクリックで詳細表示', async ({ page }) => {
    const jwt = generateJWT('test-user', 'test-user@gmail.com', 'user');
    await page.addInitScript((token) => localStorage.setItem('kojanmap_jwt', token), jwt);
    await page.goto('http://localhost:5173/');

    // マップ上のピンを取得しクリック
    const mapPin = await page.getByTestId('map-pin').first();
    await mapPin.click();
    // 詳細表示の内容を検証（例: タイトルや説明が表示されること）
    await expect(page.getByText(/E2Eテスト投稿/)).toBeVisible();
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
});
