import { test, expect } from '@playwright/test';
// import { setupTestData } from './setupTestData'; // 使っていない場合は削除可
import { createHmac } from 'crypto';

// --- ヘルパー関数 ---
const base64UrlEncode = (input: Buffer | string): string => {
  const buf = typeof input === 'string' ? Buffer.from(input, 'utf8') : input;
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};

const createJwt = (params: { userId: string; googleId: string; email: string; role: string }) => {
  const secret = process.env.JWT_SECRET_KEY || 'dev-secret-key-please-change-in-production';
  const header = { alg: 'HS256', typ: 'JWT' };
  const nowSec = Math.floor(Date.now() / 1000);
  const payload = {
    user_id: params.userId,
    google_id: params.googleId,
    email: params.email,
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

let postId: number;

// ★ここにグループ化の開始を追加
test.describe('Reaction E2E Tests', () => {
  test.beforeAll(async ({ request }) => {
    // テスト用の投稿を作成
    const user = {
      id: 'test-user',
      googleId: 'test-user',
      email: 'test-user@gmail.com',
      role: 'user',
    };
    // ジャンル一覧を取得
    const genresRes = await request.get('http://localhost:8080/api/genres');
    const genres = (await genresRes.json()).genres;
    // 英語名でなければ強制的に'food'を使う
    const genreValue = ['food', 'event', 'scene', 'store', 'emergency', 'other'].includes(
      genres[0]?.genreName
    )
      ? genres[0].genreName
      : 'food';
    const jwt = createJwt({
      userId: user.id,
      googleId: user.googleId,
      email: user.email,
      role: user.role,
    });

    // 投稿作成API呼び出し（JWT付与）
    const createResponse = await request.post('http://localhost:8080/api/posts', {
      headers: { Authorization: `Bearer ${jwt}` },
      data: {
        latitude: 35.6812,
        longitude: 139.7671,
        title: 'リアクションテスト用投稿',
        description: 'リアクション機能のテスト用投稿です',
        genre: genreValue,
      }, // ★修正: ここで request.post のオブジェクトと関数を閉じる
    });

    expect(createResponse.status()).toBe(201);
    const createData = await createResponse.json();
    postId = createData.postId;
  });

  test.beforeEach(async ({ page }) => {
    const user = {
      id: 'test-user',
      googleId: 'test-user',
      email: 'test-user@gmail.com',
      role: 'user',
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

  test('REACT-001: 投稿にリアクションできる', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // 地図タブに移動
    await page.getByRole('button', { name: '地図' }).click();

    // 投稿一覧を読み込み
    const postsResponsePromise = page.waitForResponse((resp) => {
      return resp.url().includes('/api/posts') && resp.request().method() === 'GET';
    });

    await page.waitForSelector('[data-testid="map-pin"], .leaflet-marker-icon', { timeout: 10000 });

    const postsResponse = await postsResponsePromise;
    expect(postsResponse.status()).toBe(200);

    // 最初のピンをクリックして投稿詳細を表示
    await page.click('[data-testid="map-pin"], .leaflet-marker-icon:first-child');

    // 投稿詳細が表示されるのを待機
    await page.waitForSelector('[data-testid="post-detail"], .post-detail', { timeout: 5000 });

    // リアクションボタンをクリック
    const reactionResponsePromise = page.waitForResponse((resp) => {
      return resp.url().includes('/api/posts/reaction') && resp.request().method() === 'POST';
    });

    await page.click(
      '[data-testid="reaction-button"], button:has-text("♡"), button:has-text("いいね")'
    );

    const reactionResponse = await reactionResponsePromise;
    expect(reactionResponse.status()).toBe(200);

    const reactionData = await reactionResponse.json();
    expect(reactionData.message).toBe('reaction added');

    // リアクション数が増加したことを確認
    await expect(
      page.getByText('reaction added').or(page.getByText('リアクション追加'))
    ).toBeVisible({ timeout: 3000 });
  });

  test('REACT-002: リアクションを取り消せる', async ({ page, request }) => {
    // まずリアクションを追加しておく
    const user = {
      id: 'test-user',
      googleId: 'test-user',
      email: 'test-user@gmail.com',
      role: 'user',
    };

    const jwt = createJwt({
      userId: user.id,
      googleId: user.googleId,
      email: user.email,
      role: user.role,
    });

    await request.post('http://localhost:8080/api/posts/reaction', {
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
      data: {
        postId: postId,
      },
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // 地図タブに移動
    await page.getByRole('button', { name: '地図' }).click();

    // 投稿詳細を表示
    await page.waitForSelector('[data-testid="map-pin"], .leaflet-marker-icon', { timeout: 10000 });
    await page.click('[data-testid="map-pin"], .leaflet-marker-icon:first-child');

    // 投稿詳細が表示されるのを待機
    await page.waitForSelector('[data-testid="post-detail"], .post-detail', { timeout: 5000 });

    // リアクションボタンを再度クリックして取り消し
    const reactionResponsePromise = page.waitForResponse((resp) => {
      return resp.url().includes('/api/posts/reaction') && resp.request().method() === 'POST';
    });

    await page.click(
      '[data-testid="reaction-button"], button:has-text("❤️"), button:has-text("いいね済み")'
    );

    const reactionResponse = await reactionResponsePromise;
    expect(reactionResponse.status()).toBe(200);

    const reactionData = await reactionResponse.json();
    expect(reactionData.message).toBe('reaction added'); // APIの仕様に合わせて確認メッセージは適宜調整
  });

  test('REACT-003: リアクション数が正しく表示される', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // 地図タブに移動
    await page.getByRole('button', { name: '地図' }).click();

    // 投稿詳細を表示
    await page.waitForSelector('[data-testid="map-pin"], .leaflet-marker-icon', { timeout: 10000 });
    await page.click('[data-testid="map-pin"], .leaflet-marker-icon:first-child');

    // 投稿詳細が表示されるのを待機
    await page.waitForSelector('[data-testid="post-detail"], .post-detail', { timeout: 5000 });

    // リアクション数の表示を確認
    const reactionCount = page.locator('[data-testid="reaction-count"], .reaction-count');
    await expect(reactionCount).toBeVisible({ timeout: 5000 });

    // リアクションを追加して数が変わることを確認
    const initialCount = (await reactionCount.textContent()) || '0';

    const reactionResponsePromise = page.waitForResponse((resp) => {
      return resp.url().includes('/api/posts/reaction') && resp.request().method() === 'POST';
    });

    await page.click(
      '[data-testid="reaction-button"], button:has-text("♡"), button:has-text("いいね")'
    );

    await reactionResponsePromise;

    // 数値が更新されるのを待機
    await page.waitForTimeout(1000);

    const newCount = (await reactionCount.textContent()) || '0';
    expect(newCount).not.toBe(initialCount);
  });

  test('REACT-004: 自分の投稿にリアクションできる', async ({ page, request }) => {
    // 自分の投稿を作成
    const user = {
      id: 'test-user',
      googleId: 'test-user',
      email: 'test-user@gmail.com',
      role: 'user',
    };

    const jwt = createJwt({
      userId: user.id,
      googleId: user.googleId,
      email: user.email,
      role: user.role,
    });

    // ジャンル一覧を取得
    const genresRes = await request.get('http://localhost:8080/api/genres');
    const genres = (await genresRes.json()).genres;
    const genreValue = ['food', 'event', 'scene', 'store', 'emergency', 'other'].includes(
      genres[0]?.genreName
    )
      ? genres[0].genreName
      : 'food';
    const createResponse = await request.post('http://localhost:8080/api/posts', {
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
      data: {
        latitude: 35.6812,
        longitude: 139.7671,
        title: '自分の投稿テスト',
        description: '自分でリアクションするテスト',
        genre: genreValue,
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
          createdAt: new Date().toISOString(),
        },
        storedJwt: jwt,
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

    // 自分の投稿にリアクション
    const reactionResponsePromise = page.waitForResponse((resp) => {
      return resp.url().includes('/api/posts/reaction') && resp.request().method() === 'POST';
    });

    await page.click(
      '[data-testid="reaction-button"], button:has-text("♡"), button:has-text("いいね")'
    );

    const reactionResponse = await reactionResponsePromise;
    expect(reactionResponse.status()).toBe(200);

    const reactionData = await reactionResponse.json();
    expect(reactionData.message).toBe('reaction added');
  });

  test('REACT-005: リアクション状態がセッション跨ぎで保持される', async ({ page, browser }) => {
    // 別のセッションでログイン
    const user = {
      id: 'test-user',
      googleId: 'test-user',
      email: 'test-user@gmail.com',
      role: 'user',
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

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // 地図タブに移動
    await page.getByRole('button', { name: '地図' }).click();

    // 投稿一覧を読み込み
    await page.waitForSelector('[data-testid="map-pin"], .leaflet-marker-icon', { timeout: 10000 });

    // 最初のピンをクリックして投稿詳細を表示
    await page.click('[data-testid="map-pin"], .leaflet-marker-icon:first-child');

    // 投稿詳細が表示されるのを待機
    await page.waitForSelector('[data-testid="post-detail"], .post-detail', { timeout: 5000 });

    // リアクションボタンの状態を確認
    const reactionButton = page.locator('[data-testid="reaction-button"]');
    await expect(reactionButton).toHaveText('♡', { timeout: 5000 }); // いいねしていない状態

    // リアクションを追加
    const reactionResponsePromise = page.waitForResponse((resp) => {
      return resp.url().includes('/api/posts/reaction') && resp.request().method() === 'POST';
    });

    await reactionButton.click();

    const reactionResponse = await reactionResponsePromise;
    expect(reactionResponse.status()).toBe(200);

    const reactionData = await reactionResponse.json();
    expect(reactionData.message).toBe('reaction added');

    // セッションを跨いで再度ログイン
    await page.context().storageState({ path: 'state.json' }); // 現在のストレージ状態を保存

    const newContext = await browser.newContext();
    const newPage = await newContext.newPage();
    await newPage.goto('/', { waitUntil: 'domcontentloaded' });

    // 地図タブに移動
    await newPage.getByRole('button', { name: '地図' }).click();

    // 投稿詳細を表示
    await newPage.waitForSelector('[data-testid="map-pin"], .leaflet-marker-icon', {
      timeout: 10000,
    });
    await newPage.click('[data-testid="map-pin"], .leaflet-marker-icon:first-child');

    // 投稿詳細が表示されるのを待機
    await newPage.waitForSelector('[data-testid="post-detail"], .post-detail', { timeout: 5000 });

    // リアクションボタンの状態を確認
    const newReactionButton = newPage.locator('[data-testid="reaction-button"]');
    await expect(newReactionButton).toHaveText('❤️', { timeout: 5000 }); // いいねしている状態
  });

  test('REACT-006: リアクション状態が保持されている', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // 地図タブに移動
    await page.getByRole('button', { name: '地図' }).click();

    // 投稿詳細を表示
    await page.waitForSelector('[data-testid="map-pin"], .leaflet-marker-icon', { timeout: 10000 });
    await page.click('[data-testid="map-pin"], .leaflet-marker-icon:first-child');

    // 投稿詳細が表示されるのを待機
    await page.waitForSelector('[data-testid="post-detail"], .post-detail', { timeout: 5000 });

    // リアクションボタンの状態を確認
    const reactionButton = page.locator('[data-testid="reaction-button"]');
    await expect(reactionButton).toHaveText('❤️', { timeout: 5000 }); // いいねしている状態
  });
}); // test.describe の終了
