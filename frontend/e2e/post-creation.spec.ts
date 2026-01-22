import { test, expect } from '@playwright/test';
import { createHmac } from 'crypto';

const base64UrlEncode = (input: Buffer | string): string => {
  const buf = typeof input === 'string' ? Buffer.from(input, 'utf8') : input;
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};

const createJwt = (params: { userId: string; googleId: string; email: string; role: string }) => {
  const secret = process.env.JWT_SECRET_KEY || 'dev-secret-key-please-change-in-production';

  const header = { alg: 'HS256', typ: 'JWT' };
  const nowSec = Math.floor(Date.now() / 1000);
  const payload = {
    userId: params.userId,
    gmail: params.email,
    role: params.role,
    iat: nowSec,
    exp: nowSec + 60 * 60,
    iss: 'kojan-map-business',
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const signature = createHmac('sha256', secret).update(signingInput).digest();
  const encodedSignature = base64UrlEncode(signature);
  return `${signingInput}.${encodedSignature}`;
};

test.describe('Post Creation E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    const user = {
      id: 'e2e-post-user',
      googleId: 'e2e-post-user',
      email: 'e2e-post@example.com',
      role: 'general',
      createdAt: new Date().toISOString(),
    };

    const jwt = createJwt({
      userId: user.id,
      googleId: user.googleId,
      email: user.email,
      role: user.role,
    });

    await page.addInitScript(
      ({ storedUser, storedJwt }) => {
        localStorage.setItem('kojanmap_user', JSON.stringify(storedUser));
        localStorage.setItem('kojanmap_jwt', storedJwt);
      },
      { storedUser: user, storedJwt: jwt }
    );
  });

  test('POST-001: 一般ユーザーが投稿を作成できる', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // 地図タブに移動
    await page.getByRole('button', { name: '地図' }).click();

    // 投稿作成ボタンを待機してクリック
    await page.waitForSelector('[data-testid="create-post-button"], button:has-text("投稿")', {
      timeout: 10000,
    });
    await page.click('[data-testid="create-post-button"], button:has-text("投稿")');

    // フォームが表示されるのを待機
    await page.waitForSelector('[data-testid="post-form"], form:has-text("タイトル")', {
      timeout: 5000,
    });

    // フォームに入力
    await page.fill(
      '[data-testid="post-title"], input[name="title"], input[placeholder*="タイトル"]',
      'E2Eテスト投稿'
    );
    await page.fill(
      '[data-testid="post-description"], textarea[name="description"], textarea[placeholder*="説明"]',
      'これはE2Eテストによる投稿です。'
    );

    // ジャンルを選択（最初のジャンル）
    await page.click('[data-testid="genre-select"], select[name="genre"]');
    await page.click('[data-testid="genre-select"] option, select[name="genre"] option');

    // 位置情報を設定（地図をクリック）
    await page.click('[data-testid="map-container"], .leaflet-container', {
      position: { x: 200, y: 200 },
    });

    // 投稿ボタンをクリック
    const createResponsePromise = page.waitForResponse((resp) => {
      return resp.url().includes('/api/posts') && resp.request().method() === 'POST';
    });

    await page.click('[data-testid="submit-post"], button:has-text("投稿"), button[type="submit"]');

    const createResponse = await createResponsePromise;
    expect(createResponse.status()).toBe(201);

    const responseData = await createResponse.json();
    expect(responseData).toHaveProperty('postId');
    expect(responseData.message).toBe('post created successfully');

    // 成功メッセージを確認
    await expect(page.getByText('投稿が作成されました')).toBeVisible({ timeout: 5000 });
  });

  test('POST-003: 必須項目未入力で投稿できない', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // 地図タブに移動
    await page.getByRole('button', { name: '地図' }).click();

    // 投稿作成ボタンをクリック
    await page.waitForSelector('[data-testid="create-post-button"], button:has-text("投稿")', {
      timeout: 10000,
    });
    await page.click('[data-testid="create-post-button"], button:has-text("投稿")');

    // フォームが表示されるのを待機
    await page.waitForSelector('[data-testid="post-form"], form:has-text("タイトル")', {
      timeout: 5000,
    });

    // タイトルを空のまま投稿ボタンをクリック
    await page.click('[data-testid="submit-post"], button:has-text("投稿"), button[type="submit"]');

    // バリデーションエラーが表示されることを確認
    await expect(
      page
        .getByText('タイトルは必須です')
        .or(page.getByText('title is required'))
        .or(page.getByText('invalid request format'))
    ).toBeVisible({ timeout: 5000 });
  });

  test('POST-004: 位置情報を正しく保存できる', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // 地図タブに移動
    await page.getByRole('button', { name: '地図' }).click();

    // 投稿作成ボタンをクリック
    await page.waitForSelector('[data-testid="create-post-button"], button:has-text("投稿")', {
      timeout: 10000,
    });
    await page.click('[data-testid="create-post-button"], button:has-text("投稿")');

    // フォームが表示されるのを待機
    await page.waitForSelector('[data-testid="post-form"], form:has-text("タイトル")', {
      timeout: 5000,
    });

    // フォームに入力
    await page.fill(
      '[data-testid="post-title"], input[name="title"], input[placeholder*="タイトル"]',
      '位置情報テスト投稿'
    );
    await page.fill(
      '[data-testid="post-description"], textarea[name="description"], textarea[placeholder*="説明"]',
      '位置情報テストです。'
    );

    // ジャンルを選択
    await page.click('[data-testid="genre-select"], select[name="genre"]');
    await page.click('[data-testid="genre-select"] option, select[name="genre"] option');

    // 特定の位置をクリック
    await page.click('[data-testid="map-container"], .leaflet-container', {
      position: { x: 300, y: 250 },
    });

    // 投稿ボタンをクリック
    const createResponsePromise = page.waitForResponse((resp) => {
      return resp.url().includes('/api/posts') && resp.request().method() === 'POST';
    });

    await page.click('[data-testid="submit-post"], button:has-text("投稿"), button[type="submit"]');

    const createResponse = await createResponsePromise;
    expect(createResponse.status()).toBe(201);

    // 投稿一覧を再読み込みして位置情報が保存されていることを確認
    await page.reload();

    // 新しい投稿がマップ上に表示されることを確認
    await page.waitForSelector('[data-testid="map-pin"], .leaflet-marker-icon', { timeout: 10000 });
    const pins = await page.locator('[data-testid="map-pin"], .leaflet-marker-icon').count();
    expect(pins).toBeGreaterThan(0);
  });
});
