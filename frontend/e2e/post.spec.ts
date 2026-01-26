import { test, expect } from '@playwright/test';
import { setupTestData, createUser } from './setupTestData';

test.describe('投稿機能E2E', () => {
  // 投稿機能テスト雛形

  test('POST-001: 投稿を作成できる', async ({ page, request }) => {
    const { jwt, user } = await createUser(request, 'test-user-post-1', 'user');

    await page.addInitScript(
      (arg) => {
        localStorage.setItem('kojanmap_user', JSON.stringify(arg.storedUser));
        localStorage.setItem('kojanmap_jwt', arg.storedJwt);
      },
      { storedUser: user, storedJwt: jwt }
    );
    await page.goto('/');

    // ローディング画面が消えるまで待機
    await expect(page.getByTestId('loading-screen')).not.toBeVisible({ timeout: 5000 });

    // 投稿作成ダイアログを開く（マップをダブルクリック）
    const mapContainer = page.locator('.leaflet-container');
    await mapContainer.waitFor();
    // マップの中心付近をダブルクリック
    const box = await mapContainer.boundingBox();
    if (box) {
      await page.mouse.dblclick(box.x + box.width / 2, box.y + box.height / 2);
    } else {
      await mapContainer.dblclick();
    }

    // 投稿フォームに入力
    await page.waitForSelector('[data-testid="new-post-form"]');
    await page.fill('[data-testid="post-title"]', 'E2Eテスト投稿');
    await page.fill('[data-testid="post-description"]', 'E2Eテスト用の投稿本文です');
    // ジャンル選択（最初の選択肢を選ぶ）
    await page.click('[data-testid="genre-select"]');
    await page.getByRole('option').first().click();

    // 投稿ボタン押下
    await page.click('[data-testid="submit-post"]');

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

  test('POST-006: ピンをクリックで詳細表示', async ({ page, request }) => {
    const { jwt, user } = await createUser(request, 'test-user-post-6', 'user');

    await page.addInitScript(
      (arg) => {
        localStorage.setItem('kojanmap_user', JSON.stringify(arg.storedUser));
        localStorage.setItem('kojanmap_jwt', arg.storedJwt);
      },
      { storedUser: user, storedJwt: jwt }
    );
    await page.goto('/');

    // ローディング画面が消えるまで待機
    await expect(page.getByTestId('loading-screen')).not.toBeVisible({ timeout: 5000 });

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
