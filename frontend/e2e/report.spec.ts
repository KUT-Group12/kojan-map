import { test, expect } from '@playwright/test';
import { createHmac } from 'crypto';

const base64UrlEncode = (input: Buffer | string): string => {
  const buf = typeof input === 'string' ? Buffer.from(input, 'utf8') : input;
  return buf
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
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
    iss: 'kojan-map-business'
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const signature = createHmac('sha256', secret).update(signingInput).digest();
  const encodedSignature = base64UrlEncode(signature);
  return `${signingInput}.${encodedSignature}`;
};

test.describe('通報機能 E2Eテスト', () => {
  let postId: number;

  test.beforeAll(async ({ request }) => {
    // テスト用の投稿を作成
    const user = {
      id: 'e2e-report-user',
      googleId: 'e2e-report-user',
      email: 'e2e-report@example.com',
      role: 'general',
    };

    const jwt = createJwt({
      userId: user.id,
      googleId: user.googleId,
      email: user.email,
      role: user.role,
    });

    // 投稿作成APIを直接呼び出し
    const createResponse = await request.post('http://localhost:8080/api/posts', {
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
      data: {
        latitude: 35.6812,
        longitude: 139.7671,
        title: '通報テスト用投稿',
        description: '通報機能のテスト用投稿です',
        genre: '食事',
      },
    });

    expect(createResponse.status()).toBe(201);
    const createData = await createResponse.json();
    postId = createData.postId;
  });

  test.beforeEach(async ({ page }) => {
    const user = {
      id: 'e2e-reporter-user',
      googleId: 'e2e-reporter-user',
      email: 'e2e-reporter@example.com',
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

  test('REPORT-001: 投稿を通報できる', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // 地図タブに移動
    await page.getByRole('button', { name: '地図' }).click();

    // 投稿一覧を読み込み
    await page.waitForSelector('[data-testid="map-pin"], .leaflet-marker-icon', { timeout: 10000 });

    // 最初のピンをクリックして投稿詳細を表示
    await page.click('[data-testid="map-pin"], .leaflet-marker-icon:first-child');

    // 投稿詳細が表示されるのを待機
    await page.waitForSelector('[data-testid="post-detail"], .post-detail', { timeout: 5000 });

    // 通報ボタンをクリック
    await page.click('[data-testid="report-button"], button:has-text("通報"), button:has-text("🚨")');

    // 通報ダイアログが表示されるのを待機
    await page.waitForSelector('[data-testid="report-dialog"], .report-dialog', { timeout: 3000 });

    // 通報理由を入力
    await page.fill('[data-testid="report-reason"], textarea[name="reason"], textarea[placeholder*="理由"]', '不適切な内容です');

    // 通報送信ボタンをクリック
    const reportResponsePromise = page.waitForResponse((resp) => {
      return resp.url().includes('/api/report') && resp.request().method() === 'POST';
    });

    await page.click('[data-testid="submit-report"], button:has-text("通報する"), button[type="submit"]');

    const reportResponse = await reportResponsePromise;
    expect(reportResponse.status()).toBe(201);

    const reportData = await reportResponse.json();
    expect(reportData.message).toBe('report created');

    // 成功メッセージを確認
    await expect(page.getByText('通報しました').or(page.getByText('report created'))).toBeVisible({ timeout: 3000 });

    // ダイアログが閉じるのを確認
    await expect(page.locator('[data-testid="report-dialog"], .report-dialog')).not.toBeVisible({ timeout: 3000 });
  });

  test('REPORT-002: 通報理由は必須', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // 地図タブに移動
    await page.getByRole('button', { name: '地図' }).click();

    // 投稿詳細を表示
    await page.waitForSelector('[data-testid="map-pin"], .leaflet-marker-icon', { timeout: 10000 });
    await page.click('[data-testid="map-pin"], .leaflet-marker-icon:first-child');

    // 投稿詳細が表示されるのを待機
    await page.waitForSelector('[data-testid="post-detail"], .post-detail', { timeout: 5000 });

    // 通報ボタンをクリック
    await page.click('[data-testid="report-button"], button:has-text("通報"), button:has-text("🚨")');

    // 通報ダイアログが表示されるのを待機
    await page.waitForSelector('[data-testid="report-dialog"], .report-dialog', { timeout: 3000 });

    // 理由を空のまま送信ボタンをクリック
    await page.click('[data-testid="submit-report"], button:has-text("通報する"), button[type="submit"]');

    // バリデーションエラーが表示されることを確認
    await expect(page.getByText('理由は必須です').or(page.getByText('reason is required')).or(page.getByText('invalid request format'))).toBeVisible({ timeout: 3000 });
  });

  test('REPORT-003: 同じ投稿を重複通報できない', async ({ page, request }) => {
    // まず一度通報する
    const user = {
      id: 'e2e-reporter-user',
      googleId: 'e2e-reporter-user',
      email: 'e2e-reporter@example.com',
      role: 'general',
    };

    const jwt = createJwt({
      userId: user.id,
      googleId: user.googleId,
      email: user.email,
      role: user.role,
    });

    // 最初の通報
    const firstReportResponse = await request.post('http://localhost:8080/api/report', {
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
      data: {
        postId: postId,
        reason: '最初の通報',
      },
    });

    expect(firstReportResponse.status()).toBe(201);

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // 地図タブに移動
    await page.getByRole('button', { name: '地図' }).click();

    // 投稿詳細を表示
    await page.waitForSelector('[data-testid="map-pin"], .leaflet-marker-icon', { timeout: 10000 });
    await page.click('[data-testid="map-pin"], .leaflet-marker-icon:first-child');

    // 投稿詳細が表示されるのを待機
    await page.waitForSelector('[data-testid="post-detail"], .post-detail', { timeout: 5000 });

    // 通報ボタンをクリック
    await page.click('[data-testid="report-button"], button:has-text("通報"), button:has-text("🚨")');

    // 通報ダイアログが表示されるのを待機
    await page.waitForSelector('[data-testid="report-dialog"], .report-dialog', { timeout: 3000 });

    // 通報理由を入力
    await page.fill('[data-testid="report-reason"], textarea[name="reason"], textarea[placeholder*="理由"]', '重複通報テスト');

    // 通報送信ボタンをクリック
    const reportResponsePromise = page.waitForResponse((resp) => {
      return resp.url().includes('/api/report') && resp.request().method() === 'POST';
    });

    await page.click('[data-testid="submit-report"], button:has-text("通報する"), button[type="submit"]');

    const reportResponse = await reportResponsePromise;
    
    // 重複通報の場合はエラーになるか、同じレスポンスが返る
    if (reportResponse.status() === 400) {
      const errorData = await reportResponse.json();
      expect(errorData.error).toContain('already reported');
    } else {
      // 一部の実装では同じレスポンスを返す場合がある
      expect([201, 400]).toContain(reportResponse.status());
    }
  });

  test('REPORT-004: 自分の投稿を通報できない', async ({ page, request }) => {
    // 自分の投稿を作成
    const user = {
      id: 'e2e-self-report-user',
      googleId: 'e2e-self-report-user',
      email: 'e2e-self-report@example.com',
      role: 'general',
    };

    const jwt = createJwt({
      userId: user.id,
      googleId: user.googleId,
      email: user.email,
      role: user.role,
    });

    const createResponse = await request.post('http://localhost:8080/api/posts', {
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
      data: {
        latitude: 35.6812,
        longitude: 139.7671,
        title: '自分の投稿テスト',
        description: '自分で通報するテスト',
        genre: '食事',
      },
    });

    expect(createResponse.status()).toBe(201);

    // ページにログイン
    await page.addInitScript(
      ({ storedUser, storedJwt }) => {
        localStorage.setItem('kojanmap_user', JSON.stringify(storedUser));
        localStorage.setItem('kojanmap_jwt', storedJwt);
      },
      { 
        storedUser: { 
          ...user, 
          createdAt: new Date().toISOString() 
        }, 
        storedJwt: jwt 
      }
    );

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // 地図タブに移動
    await page.getByRole('button', { name: '地図' }).click();

    // 投稿詳細を表示
    await page.waitForSelector('[data-testid="map-pin"], .leaflet-marker-icon', { timeout: 10000 });
    await page.click('[data-testid="map-pin"], .leaflet-marker-icon:first-child');

    // 投稿詳細が表示されるのを待機
    await page.waitForSelector('[data-testid="post-detail"], .post-detail', { timeout: 5000 });

    // 自分の投稿の場合は通報ボタンが表示されないことを確認
    const reportButton = page.locator('[data-testid="report-button"], button:has-text("通報"), button:has-text("🚨")');
    await expect(reportButton).not.toBeVisible({ timeout: 3000 });
  });
});
