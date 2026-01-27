// Playwright用テストデータ投入スクリプト
import { APIRequestContext, expect } from '@playwright/test';

const API_BASE_URL = process.env.API_URL || 'http://backend:8080';

/**
 * テスト用のユーザーを作成し、JWTトークンとユーザー情報を返す
 * @param request PlaywrightのAPIリクエストコンテキスト
 * @param googleId 作成するユーザーのGoogle ID
 * @param role 'user' | 'business' | 'admin'
 */
export const createUser = async (
  request: APIRequestContext,
  googleId: string,
  role: 'user' | 'business' | 'admin'
) => {
  const response = await request.post(`${API_BASE_URL}/api/auth/exchange-token`, {
    data: {
      google_token: `${googleId}-token`,
      role: role,
    },
  });
  expect(response.status()).toBe(200);
  const { jwt_token, user } = await response.json();
  expect(jwt_token).toBeDefined();
  expect(user).toBeDefined();
  return { jwt: jwt_token, user };
};

/**
 * E2Eテスト全体のセットアップ処理
 * @param request PlaywrightのAPIリクエストコンテキスト
 */
export async function setupTestData(request: APIRequestContext) {
  // ジャンル一覧を取得
  const genresRes = await request.get(`${API_BASE_URL}/api/genres`);
  const genresBody = await genresRes.json();
  const genres = genresBody.genres;
  expect(genres).toBeDefined();
  expect(genres.length).toBeGreaterThan(0);

  const genreName =
    genres.find((g: { genreName: string }) => g.genreName === 'food')?.genreName ||
    genres[0].genreName;

  // グローバルに変数を設定して他テストで利用
  (global as any).E2E_GENRE_NAME = genreName;
}
