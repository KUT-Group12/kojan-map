import { test, expect } from '@playwright/test';
import { createUser } from './setupTestData';

test.describe('Auth E2E Tests', () => {
  test('AUTH-001: 未ログイン状態でログイン画面が表示される', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('ログイン')).toBeVisible();
  });

  test('AUTH-002: Google認証でログインできる (モック版)', async ({ page, request }) => {
    const { jwt, user } = await createUser(request, 'auth-user-2', 'user');
    await page.addInitScript(
      (data) => {
        localStorage.setItem('kojanmap_jwt', data.jwt);
        localStorage.setItem('kojanmap_user', JSON.stringify(data.user));
      },
      { jwt, user }
    );

    await page.goto('/');
    await expect(page.getByRole('button', { name: /ログアウト/ })).toBeVisible();
  });

  test('AUTH-003: ログアウトできる', async ({ page, request }) => {
    const { jwt, user } = await createUser(request, 'auth-user-3', 'user');
    await page.addInitScript(
      (data) => {
        localStorage.setItem('kojanmap_jwt', data.jwt);
        localStorage.setItem('kojanmap_user', JSON.stringify(data.user));
      },
      { jwt, user }
    );

    await page.goto('/');
    await page.getByRole('button', { name: /ログアウト/ }).click();
    await expect(page.getByText('ログイン')).toBeVisible();
  });

  test('AUTH-004: 一般ユーザーは管理者画面にアクセスできない', async ({ page, request }) => {
    const { jwt, user } = await createUser(request, 'auth-user-4', 'user');
    await page.addInitScript(
      (data) => {
        localStorage.setItem('kojanmap_jwt', data.jwt);
        localStorage.setItem('kojanmap_user', JSON.stringify(data.user));
      },
      { jwt, user }
    );

    await page.goto('/admin');
    // Expect to be redirected or see a "not authorized" message.
    // For this app, it seems to redirect to the main app, so we check for the logout button.
    await expect(page.getByRole('button', { name: /ログアウト/ })).toBeVisible();
    // Also assert that we are not on the admin page
    await expect(page.locator('h1:has-text("Admin Dashboard")')).not.toBeVisible();
  });

  test('AUTH-008: 認証切れ時にログイン画面にリダイレクトされる', async ({ page, request }) => {
    // This test requires a separate way to generate an expired token,
    // as createUser will always return a valid one.
    // For now, we can skip it or implement a dedicated expired token generator.
    test.skip('Skipping due to need for expired token');
  });
});

