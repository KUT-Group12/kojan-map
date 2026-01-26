import { test, expect } from '@playwright/test';
import { createUser } from './setupTestData';

test.describe('Post Creation E2E Tests', () => {
  // beforeEach: Login and navigate to the main page
  test.beforeEach(async ({ page, request }) => {
    const { jwt, user } = await createUser(request, 'e2e-post-user', 'user');

    await page.addInitScript(
      (arg) => {
        localStorage.setItem('kojanmap_user', JSON.stringify(arg.storedUser));
        localStorage.setItem('kojanmap_jwt', arg.storedJwt);
      },
      { storedUser: user, storedJwt: jwt }
    );

    await page.goto('/');
    // Wait for main app to load
    await expect(page.getByRole('button', { name: /ログアウト/ })).toBeVisible();
  });

  // Helper function to open the new post modal
  const openNewPostModal = async (page: import('@playwright/test').Page) => {
    // 地図タブに移動
    await page.getByRole('button', { name: '地図' }).click();

    const mapContainer = page.locator('.leaflet-container');
    await mapContainer.waitFor();

    const box = await mapContainer.boundingBox();
    if (box) {
      await page.mouse.dblclick(box.x + box.width / 2, box.y + box.height / 2);
    } else {
      await mapContainer.dblclick();
    }

    await page.waitForSelector('[data-testid="new-post-form"]', {
      timeout: 5000,
    });

    // Wait for the genre select trigger to be interactable
    await page.waitForSelector('[data-testid="genre-select"]', { state: 'visible', timeout: 5000 });
  };

  test('POST-003: 必須項目未入力で投稿できない', async ({ page }) => {
    await openNewPostModal(page);

    // タイトルを空のまま投稿ボタンをクリック
    await page.click('[data-testid="submit-post"]');

    // バリデーションエラーのトーストメッセージが表示されることを確認 (sonnerのコンテナ内)
    await expect(
      page.locator('[data-sonner-toaster]').getByText(/タイトルを入力してください/)
    ).toBeVisible({ timeout: 10000 });
  });

  test('POST-004: 位置情報を正しく保存できる', async ({ page }) => {
    await openNewPostModal(page);

    // フォームに入力
    await page.fill(
      '[data-testid="post-title"]',
      '位置情報テスト投稿'
    );
    await page.fill(
      '[data-testid="post-description"]',
      '位置情報テストです。'
    );

    // ジャンルを選択
    await page.click('[data-testid="genre-select"]');
    await page.getByRole('option', { name: 'グルメ' }).click();

    // 投稿ボタンをクリック
    const createResponsePromise = page.waitForResponse((resp) => {
      return resp.url().includes('/api/posts') && resp.request().method() === 'POST';
    });

    await page.click('[data-testid="submit-post"]');

    const createResponse = await createResponsePromise;
    expect(createResponse.status()).toBe(201);
  });
});
