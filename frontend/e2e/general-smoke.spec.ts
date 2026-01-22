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
  const secret = process.env.JWT_SECRET_KEY;
  if (!secret) return null;

  const header = { alg: 'HS256', typ: 'JWT' };
  const nowSec = Math.floor(Date.now() / 1000);
  const payload = {
    user_id: params.userId,
    google_id: params.googleId,
    email: params.email,
    role: params.role,
    iat: nowSec,
    exp: nowSec + 60 * 60,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const signature = createHmac('sha256', secret).update(signingInput).digest();
  const encodedSignature = base64UrlEncode(signature);
  return `${signingInput}.${encodedSignature}`;
};

test('general user can load main app and fetch posts (real HTTP)', async ({ page }) => {
  test.skip(!process.env.JWT_SECRET_KEY, 'JWT_SECRET_KEY is not set (required to call protected APIs)');

  const user = {
    id: 'e2e-user',
    googleId: 'e2e-user',
    email: 'e2e-user@example.com',
    role: 'general',
    createdAt: new Date().toISOString(),
  };

  const jwt = createJwt({
    userId: user.id,
    googleId: user.googleId,
    email: user.email,
    role: user.role,
  });

  if (!jwt) throw new Error('failed to create JWT');

  await page.addInitScript(
    ({ storedUser, storedJwt }) => {
      localStorage.setItem('kojanmap_user', JSON.stringify(storedUser));
      localStorage.setItem('kojanmap_jwt', storedJwt);
    },
    { storedUser: user, storedJwt: jwt }
  );

  const postsResponsePromise = page.waitForResponse((resp) => {
    return resp.url().includes('/api/posts') && resp.request().method() === 'GET';
  });

  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const postsResponse = await postsResponsePromise;
  expect(postsResponse.status()).toBe(200);

  await expect(page.getByText('一般アカウント')).toBeVisible();
  await expect(page.getByRole('button', { name: '地図' })).toBeVisible();

  const historyResponsePromise = page.waitForResponse((resp) => {
    return resp.url().includes('/api/posts/history') && resp.request().method() === 'GET';
  });

  await page.getByRole('button', { name: 'マイページ' }).click();

  const historyResponse = await historyResponsePromise;
  expect(historyResponse.status()).toBe(200);
});
