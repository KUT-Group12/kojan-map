// Playwright用テストデータ投入スクリプト例
import { APIRequestContext } from '@playwright/test';
import { createHmac } from 'crypto';

export async function setupTestData(request: APIRequestContext) {
  // 管理者ユーザー作成
  await request.post('http://localhost:8080/api/users/register', {
    data: { googleId: 'admin-001-token', gmail: 'admin-001@example.com', role: 'admin' },
  });
  // 一般ユーザー作成
  await request.post('http://localhost:8080/api/users/register', {
    data: { googleId: 'user-001-token', gmail: 'user-001@example.com', role: 'user' },
  });
  // 事業者ユーザー作成
  await request.post('http://localhost:8080/api/users/register', {
    data: { googleId: 'biz-001-token', gmail: 'biz-001@example.com', role: 'business' },
  });
  // テスト投稿用ユーザー登録
  await request.post('http://localhost:8080/api/users/register', {
    data: { googleId: 'test-user-token', gmail: 'test-user@gmail.com', role: 'user' },
  });
  // 通報テスト用ユーザー登録
  await request.post('http://localhost:8080/api/users/register', {
    data: { googleId: 'e2e-report-user-token', gmail: 'e2e-report-user@example.com', role: 'user' },
  });
  // 通報実行ユーザー登録
  await request.post('http://localhost:8080/api/users/register', {
    data: {
      googleId: 'e2e-reporter-user-token',
      gmail: 'e2e-reporter-user@example.com',
      role: 'user',
    },
  });
  // 自分の投稿通報テスト用ユーザー登録
  await request.post('http://localhost:8080/api/users/register', {
    data: {
      googleId: 'e2e-self-report-user-token',
      gmail: 'e2e-self-report-user@example.com',
      role: 'user',
    },
  });
  // ジャンル一覧を取得
  const genresRes = await request.get('http://localhost:8080/api/genres');
  const genres = (await genresRes.json()).genres;
  if (!genres || genres.length === 0) {
    throw new Error(
      'ジャンルが取得できませんでした。テストデータ投入前にジャンルをDBに登録してください。'
    );
  }
  // 英語名優先、なければ最初のジャンル
  const genreName =
    genres.find((g: { genreName: string }) => g.genreName === 'food')?.genreName ||
    genres[0].genreName;

  // ジャンル名をexport（他テストでimportして統一利用）
  (global as { E2E_GENRE_NAME?: string }).E2E_GENRE_NAME = genreName;

  // JWT生成（report.spec.tsと同じpayload形式）
  const base64UrlEncode = (input: Buffer | string): string => {
    const buf = typeof input === 'string' ? Buffer.from(input, 'utf8') : input;
    return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  };
  const createJwt = (params: { googleId: string; email: string; role: string }) => {
    const secret = process.env.JWT_SECRET_KEY || 'dev-secret-key-please-change-in-production';
    const header = { alg: 'HS256', typ: 'JWT' };
    const nowSec = Math.floor(Date.now() / 1000);
    const payload = {
      user_id: params.googleId,
      google_id: params.googleId,
      email: params.email,
      role: params.role,
      iat: nowSec,
      exp: nowSec + 60 * 60,
      iss: 'kojanmap-e2e',
      aud: 'kojanmap',
      sub: params.googleId,
    };
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const signingInput = `${encodedHeader}.${encodedPayload}`;
    const signature = createHmac('sha256', secret).update(signingInput).digest();
    const encodedSignature = base64UrlEncode(signature);
    return `${signingInput}.${encodedSignature}`;
  };
  const jwt = createJwt({
    googleId: 'test-user-token',
    email: 'test-user@gmail.com',
    role: 'user',
  });

  // サンプル投稿作成（JWT付与）
  await request.post('http://localhost:8080/api/posts', {
    headers: { Authorization: `Bearer ${jwt}` },
    data: {
      title: 'テスト投稿',
      text: 'これはテスト投稿です', // description→text
      genre: genreName,
      latitude: 33.6071,
      longitude: 133.6823,
    },
  });
}
