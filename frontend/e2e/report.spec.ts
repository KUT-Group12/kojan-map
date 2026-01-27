import { test, expect } from '@playwright/test';
import { createUser, setupTestData } from './setupTestData';

test.describe('通報機能 E2Eテスト', () => {
  let postId: number;
  let postAuthor: any;
  let postAuthorJwt: string;

  test.beforeAll(async ({ request }) => {
    // Create a user and a post for the entire test suite
    const { jwt, user } = await createUser(request, 'report-post-author', 'user');
    postAuthor = user;
    postAuthorJwt = jwt;

    const postRes = await request.post('/api/posts', {
      headers: { Authorization: `Bearer ${postAuthorJwt}` },
      data: {
        title: 'Report Test Post',
        description: 'This is a post for report tests.',
        latitude: 33.561,
        longitude: 133.541,
        genre: (global as any).E2E_GENRE_NAME || 'food',
        images: [],
      },
    });
    expect(postRes.status()).toBe(201);
    const post = await postRes.json();
    postId = post.postId;
  });

  test.beforeEach(async ({ page, request }) => {
    // Log in as a new user (the reporter) for each test
    const { jwt, user } = await createUser(request, `reporter-user-${Math.random()}`, 'user');

    await page.addInitScript(
      (arg) => {
        localStorage.setItem('kojanmap_user', JSON.stringify(arg.storedUser));
        localStorage.setItem('kojanmap_jwt', arg.storedJwt);
      },
      { storedUser: user, storedJwt: jwt }
    );
    await page.goto('/');
    await expect(page.getByTestId('loading-screen')).not.toBeVisible({ timeout: 10000 });
  });

  const openPostDetail = async (page: import('@playwright/test').Page) => {
    await page.getByRole('button', { name: '地図' }).click();
    await page.waitForSelector('.leaflet-container');
    const mapPin = page.locator('[data-testid="map-pin"]').first();
    await expect(mapPin).toBeVisible({ timeout: 15000 });
    await mapPin.click();
    await page.waitForSelector('[data-testid="post-detail"]');
  };

  test('REPORT-001: 投稿を通報できる', async ({ page }) => {
    await openPostDetail(page);

    await page.click('[data-testid="report-button"]');
    await page.waitForSelector('[data-testid="report-dialog"]');

    await page.fill('[data-testid="report-reason"]', '不適切なコンテンツです。');

    const reportResponsePromise = page.waitForResponse('**/api/report');
    await page.click('[data-testid="submit-report"]');

    const reportResponse = await reportResponsePromise;
    expect(reportResponse.status()).toBe(201);

    await expect(page.getByText('通報しました')).toBeVisible();
    await expect(page.locator('[data-testid="report-dialog"]')).not.toBeVisible();
  });

  test('REPORT-002: 通報理由は必須', async ({ page }) => {
    await openPostDetail(page);

    await page.click('[data-testid="report-button"]');
    await page.waitForSelector('[data-testid="report-dialog"]');

    await page.click('[data-testid="submit-report"]');

    // Assuming there's a validation message shown
    const validationMessage = page.locator('.text-red-500');
    await expect(validationMessage).toContainText(/理由/);
  });

  test('REPORT-003: 同じ投稿を重複通報できない', async ({ page, request }) => {
    const { jwt: reporterJwt } = await createUser(request, `reporter-${Math.random()}`, 'user');

    // First report
    const reportRes1 = await request.post('/api/report', {
      headers: { Authorization: `Bearer ${reporterJwt}` },
      data: { postId, reason: 'First report' },
    });
    expect(reportRes1.status()).toBe(201);

    // Try to report again with the same user
    const reportRes2 = await request.post('/api/report', {
      headers: { Authorization: `Bearer ${reporterJwt}` },
      data: { postId, reason: 'Second report' },
    });
    expect(reportRes2.status()).toBe(400); // Expect a conflict or bad request
    const error = await reportRes2.json();
    expect(error.error).toContain('already reported');
  });

  test('REPORT-004: 自分の投稿を通報できない', async ({ page }) => {
    // Log in as the post author
    await page.addInitScript(
      (arg) => {
        localStorage.setItem('kojanmap_user', JSON.stringify(arg.storedUser));
        localStorage.setItem('kojanmap_jwt', arg.storedJwt);
      },
      { storedUser: postAuthor, storedJwt: postAuthorJwt }
    );
    await page.goto('/');
    await expect(page.getByTestId('loading-screen')).not.toBeVisible();

    await openPostDetail(page);

    // The report button should not be visible for the author's own post
    await expect(page.locator('[data-testid="report-button"]')).not.toBeVisible();
  });
});