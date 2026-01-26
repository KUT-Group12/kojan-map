import { test, expect } from '@playwright/test';
import { createUser, setupTestData } from './setupTestData';

test.describe('Reaction E2E Tests', () => {
  let postId: number;
  let testUser: any;
  let testUserJwt: string;

  test.beforeAll(async ({ request }) => {
    // Create a user and a post for the entire test suite
    const { jwt, user } = await createUser(request, 'reaction-suite-user', 'user');
    testUser = user;
    testUserJwt = jwt;

    const postRes = await request.post('/api/posts', {
      headers: { Authorization: `Bearer ${testUserJwt}` },
      data: {
        title: 'Reaction Test Post',
        description: 'This is a post for reaction tests.',
        latitude: 33.56,
        longitude: 133.54,
        genre: (global as any).E2E_GENRE_NAME || 'food',
        images: [],
      },
    });
    expect(postRes.status()).toBe(201);
    const post = await postRes.json();
    postId = post.postId;
  });

  test.beforeEach(async ({ page, request }) => {
    // Log in as a new user for each test to ensure isolation
    const { jwt, user } = await createUser(request, `reaction-test-user-${Math.random()}`, 'user');

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
    // Assuming the post created in beforeAll is the first one
    const mapPin = page.locator('[data-testid="map-pin"]').first();
    await expect(mapPin).toBeVisible({ timeout: 15000 });
    await mapPin.click();
    await page.waitForSelector('[data-testid="post-detail"]');
  };

  test('REACT-001: 投稿にリアクションできる', async ({ page }) => {
    await openPostDetail(page);

    const reactionButton = page.locator('[data-testid="reaction-button"]');
    const reactionResponsePromise = page.waitForResponse('**/api/posts/reaction');

    await reactionButton.click();

    const reactionResponse = await reactionResponsePromise;
    expect(reactionResponse.status()).toBe(200);
    const reactionData = await reactionResponse.json();
    expect(reactionData.message).toContain('reaction');

    // Check if the button style changes (e.g., color, icon)
    await expect(reactionButton).toHaveClass(/reacted/);
  });

  test('REACT-002: リアクションを取り消せる', async ({ page, request }) => {
    // First, add a reaction directly via API to ensure the state
    const { jwt: reactorJwt } = await createUser(request, `reactor-user-${Math.random()}`, 'user');
    const reactRes = await request.post('/api/posts/reaction', {
      headers: { Authorization: `Bearer ${reactorJwt}` },
      data: { postId },
    });
    expect(reactRes.status()).toBe(200);

    // Now, open the page and undo the reaction
    await openPostDetail(page);

    const reactionButton = page.locator('[data-testid="reaction-button"]');
    await expect(reactionButton).toHaveClass(/reacted/);

    const reactionResponsePromise = page.waitForResponse('**/api/posts/reaction');
    await reactionButton.click();

    const reactionResponse = await reactionResponsePromise;
    expect(reactionResponse.status()).toBe(200);
    const reactionData = await reactionResponse.json();
    expect(reactionData.message).toContain('reaction');

    await expect(reactionButton).not.toHaveClass(/reacted/);
  });

  test('REACT-003: リアクション数が正しく表示される', async ({ page, request }) => {
    // Create a dedicated post for this test to avoid conflicts
    const { jwt, user } = await createUser(request, `reaction-count-user-${Math.random()}`, 'user');
    const postRes = await request.post('/api/posts', {
      headers: { Authorization: `Bearer ${jwt}` },
      data: {
        title: 'Reaction Count Test',
        description: 'A post to test reaction counts.',
        latitude: 33.57,
        longitude: 133.55,
        genre: 'event',
        images: [],
      },
    });
    expect(postRes.status()).toBe(201);
    const newPost = await postRes.json();

    await page.reload();
    await openPostDetail(page);

    const reactionCount = page.locator('[data-testid="reaction-count"]');
    await expect(reactionCount).toHaveText('0');

    // React to the post
    const reactionButton = page.locator('[data-testid="reaction-button"]');
    await reactionButton.click();
    await page.waitForResponse('**/api/posts/reaction');

    await expect(reactionCount).toHaveText('1');
  });

  test('REACT-004: 自分の投稿にリアクションできる', async ({ page, request }) => {
    // Log in as the user who created the post
    await page.addInitScript(
      (arg) => {
        localStorage.setItem('kojanmap_user', JSON.stringify(arg.storedUser));
        localStorage.setItem('kojanmap_jwt', arg.storedJwt);
      },
      { storedUser: testUser, storedJwt: testUserJwt }
    );
    await page.goto('/');
    await expect(page.getByTestId('loading-screen')).not.toBeVisible();

    await openPostDetail(page);

    const reactionButton = page.locator('[data-testid="reaction-button"]');
    const reactionResponsePromise = page.waitForResponse('**/api/posts/reaction');

    await reactionButton.click();

    const reactionResponse = await reactionResponsePromise;
    expect(reactionResponse.status()).toBe(200);
    await expect(reactionButton).toHaveClass(/reacted/);
  });
});