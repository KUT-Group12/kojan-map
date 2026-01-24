// Playwright用テストデータ投入スクリプト例
import { APIRequestContext } from '@playwright/test';
import { generateJWT } from './jwtUtil';

export async function setupTestData(request: APIRequestContext) {
  // 管理者ユーザー作成
  // 管理者ユーザー作成
  await request.post('http://localhost:8080/api/users/register', {
    data: {
      google_token: 'admin-001-token',
      role: 'admin',
    },
  });
  // 一般ユーザー作成
  await request.post('http://localhost:8080/api/users/register', {
    data: {
      google_token: 'user-001-token',
      role: 'user',
    },
  });
  // 事業者ユーザー作成
  await request.post('http://localhost:8080/api/users/register', {
    data: {
      google_token: 'biz-001-token',
      role: 'business',
    },
  });

  // ★追加: テスト投稿用ユーザー登録
  await request.post('http://localhost:8080/api/users/register', {
    data: {
      google_token: 'test-user-token',
      role: 'user',
    },
  });
  // ジャンル一覧を取得
  const genresRes = await request.get('http://localhost:8080/api/genres');
  const genres = (await genresRes.json()).genres;
  const genreName = genres[0]?.genreName || '食事';

  // JWT生成
  const jwt = generateJWT('test-user', 'test-user@gmail.com', 'user');

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
