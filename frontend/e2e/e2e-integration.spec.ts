import { test, expect } from '@playwright/test';
import { createUser } from './setupTestData';

test.describe('E2E Integration Tests', () => {
  test.beforeEach(async ({ page, request }) => {
    const { jwt, user } = await createUser(request, `e2e-int-user-${Math.random()}`, 'user');
    await page.addInitScript(
      (data) => {
        localStorage.setItem('kojanmap_jwt', data.jwt);
        localStorage.setItem('kojanmap_user', JSON.stringify(data.user));
      },
      { jwt, user }
    );
    await page.goto('/');
    await expect(page.getByTestId('loading-screen')).not.toBeVisible({ timeout: 10000 });
  });

  test('E2E-001: ログインからマップ表示までの流れ', async ({ page }) => {
    // ログイン済み状態でマップが表示されることを確認
    await page.waitForSelector('.leaflet-container');
    await expect(page.getByRole('button', { name: '地図' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'タイムライン' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'マイページ' })).toBeVisible();
  });

  test('E2E-002: 投稿作成から表示までの流れ', async ({ page }) => {
    // 1. マップをダブルクリックして投稿フォームを開く
    const mapContainer = page.locator('.leaflet-container');
    await mapContainer.waitFor();
    const box = await mapContainer.boundingBox();
    if (box) {
      await page.mouse.dblclick(box.x + box.width / 2, box.y + box.height / 2);
    } else {
      await mapContainer.dblclick();
    }

    // 2. 投稿フォーム入力
    await page.waitForSelector('[data-testid="new-post-form"]');
    await page.fill('[data-testid="post-title"]', 'Integration Test Post');
    await page.fill('[data-testid="post-description"]', 'This is a test post for integration.');
    await page.click('[data-testid="genre-select"]');
    await page.getByRole('option').first().click();
    await page.click('[data-testid="submit-post"]');

    // 3. 投稿完了メッセージ確認
    await expect(page.getByText(/投稿しました|投稿が作成されました/)).toBeVisible();

    // 4. マップ上にピンが表示されることを確認 (少し待機が必要な場合あり)
    await expect(page.locator('.leaflet-marker-icon')).toBeVisible({ timeout: 10000 });
  });

  test('E2E-003: リアクションの即時反映', async ({ page, request }) => {
    // 事前に投稿を作成しておく (UI操作をスキップしてAPIで高速化)
    const { jwt } = await createUser(request, `reactor-helper-${Math.random()}`, 'user');
    const postRes = await request.post('/api/posts', {
      headers: { Authorization: `Bearer ${jwt}` },
      data: {
        title: 'Reaction Test',
        description: 'React to me',
        latitude: 33.58,
        longitude: 133.53,
        genre: (global as any).E2E_GENRE_NAME || 'food',
        images: [],
      },
    });
    expect(postRes.status()).toBe(201);

    // リロードして新しい投稿を表示
    await page.reload();
    await page.waitForSelector('.leaflet-container');

    // ピンをクリックして詳細を開く
    await page.locator('.leaflet-marker-icon').first().click();
    await page.waitForSelector('[data-testid="post-detail"]');

    // リアクションボタンをクリック
    const reactionBtn = page.locator('[data-testid="reaction-button"]');
    const countEl = page.locator('[data-testid="reaction-count"]');
    const initialCount = await countEl.textContent();

    await reactionBtn.click();
    await expect(reactionBtn).toHaveClass(/reacted/); // 状態変化を確認

    // カウントアップの確認
    // 注: 初期値が0の場合もあるため、数値変換して比較
    const newCount = await countEl.textContent();
    expect(Number(newCount)).toBeGreaterThan(Number(initialCount));
  });

  test('E2E-004: 通報送信から管理画面での確認', async ({ page, request, browser }) => {
    // 1. 一般ユーザーで投稿を作成
    const { jwt: posterJwt } = await createUser(request, `poster-${Math.random()}`, 'user');
    const postRes = await request.post('/api/posts', {
      headers: { Authorization: `Bearer ${posterJwt}` },
      data: {
        title: 'Report Target Post',
        description: 'This post will be reported.',
        latitude: 33.59,
        longitude: 133.52,
        genre: (global as any).E2E_GENRE_NAME || 'food',
        images: [],
      },
    });
    const postData = await postRes.json();
    const postId = postData.postId;

    // 2. 別のユーザー（通報者）でログインして通報
    // 現在のページコンテキストは beforeEach で作られたユーザー(e2e-int-user)を使用
    // まずマップから対象の投稿を探して詳細表示 -> 通報ボタン -> 送信
    // 時間短縮のため、APIで直接通報を作成することも可能だが、E2EなのでUIを通したい
    // しかし、マップ上の特定のピンを探すのは不安定になりがちなので、ここは「APIで通報作成 -> 管理画面で確認」の流れにする
    const { jwt: reporterJwt } = await createUser(request, `reporter-${Math.random()}`, 'user');
    await request.post('/api/report', {
      headers: { Authorization: `Bearer ${reporterJwt}` },
      data: { postId: postId, reason: 'Integration Test Report' },
    });

    // 3. 管理者ユーザーでログイン (新しいコンテキストを使用)
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    const { jwt: adminJwt, user: adminUser } = await createUser(request, `admin-${Math.random()}`, 'admin');

    // localStorageに管理者情報をセット
    await adminPage.addInitScript(
      (data) => {
        localStorage.setItem('kojanmap_jwt', data.jwt);
        localStorage.setItem('kojanmap_user', JSON.stringify(data.user));
      },
      { jwt: adminJwt, user: adminUser }
    );

    // 管理画面（通報一覧）にアクセス
    await adminPage.goto('/admin/reports'); // URLは実装に合わせて調整

    // UIが表示されるまで待機 (管理者ダッシュボードなど)
    // ここでは、API経由でデータが取得され、リストに表示されていることを確認
    // "Integration Test Report" というテキストを含む行があるか
    await expect(adminPage.getByText('Integration Test Report')).toBeVisible({ timeout: 10000 });

    await adminContext.close();
  });

  test('E2E-005: 事業者申請から承認までの流れ', async ({ page, request, browser }) => {
    // 1. 一般ユーザーが事業者申請 (APIで実行)
    const { jwt: applicantJwt } = await createUser(request, `applicant-${Math.random()}`, 'user');
    await request.post('/api/business/application', {
      headers: { Authorization: `Bearer ${applicantJwt}` },
      data: {
        businessName: 'Integration Biz',
        address: 'Test Address',
        phone: '090-0000-0000',
        description: 'Test Business Application',
      },
    });

    // 2. 管理者でログインして承認
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    const { jwt: adminJwt, user: adminUser } = await createUser(request, `admin-biz-${Math.random()}`, 'admin');

    await adminPage.addInitScript(
      (data) => {
        localStorage.setItem('kojanmap_jwt', data.jwt);
        localStorage.setItem('kojanmap_user', JSON.stringify(data.user));
      },
      { jwt: adminJwt, user: adminUser }
    );

    await adminPage.goto('/admin/applications'); // 事業者申請一覧

    // 申請が表示されているか確認
    const row = adminPage.getByText('Integration Biz');
    await expect(row).toBeVisible();

    // 承認ボタンをクリック (行の中にあると仮定)
    // 実際のDOM構造に依存するため、テキストベースで探す
    // 例: "Integration Biz" の親要素(行)の中にある "承認" ボタン
    const approveBtn = adminPage.locator('tr', { has: row }).getByRole('button', { name: /承認|Approve/ });
    await approveBtn.click();

    // 承認完了の確認 (トーストや状態変化)
    await expect(adminPage.getByText(/承認しました|Approved/)).toBeVisible();

    await adminContext.close();
  });

  test('E2E-006: APIエラー時のエラー表示', async ({ page }) => {
    // APIリクエストをモックして500エラーを返す
    await page.route('**/api/posts', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' }),
        });
      } else {
        await route.continue();
      }
    });

    // 投稿操作を実行
    const mapContainer = page.locator('.leaflet-container');
    await mapContainer.waitFor();
    const box = await mapContainer.boundingBox();
    if (box) {
      await page.mouse.dblclick(box.x + box.width / 2, box.y + box.height / 2);
    } else {
      await mapContainer.dblclick();
    }

    await page.waitForSelector('[data-testid="new-post-form"]');
    await page.fill('[data-testid="post-title"]', 'Error Test Post');
    await page.fill('[data-testid="post-description"]', 'This should fail.');
    await page.click('[data-testid="genre-select"]');
    await page.getByRole('option').first().click();
    await page.click('[data-testid="submit-post"]');

    // エラーメッセージ（トーストなど）の表示を確認
    await expect(page.getByText(/エラー|失敗|Internal Server Error/)).toBeVisible();
  });

  test('E2E-007: ネットワーク遅延時のローディング表示', async ({ page }) => {
    // APIレスポンスを3秒遅延させる
    await page.route('**/api/posts', async (route) => {
      if (route.request().method() === 'GET') {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        await route.continue();
      } else {
        await route.continue();
      }
    });

    // ページをリロードして投稿取得をトリガー
    await page.reload();

    // ローディング表示（スピナーなど）が表示されることを確認
    // "loading-screen" は初期ロード用なので、データ取得用のローディングインジケータを確認
    // 実装依存だが、汎用的なloading-screenが再表示されるか、またはスケルトンなど
    // ここでは初期ロードのloading-screenが出ることを期待
    await expect(page.getByTestId('loading-screen')).toBeVisible();
    await expect(page.getByTestId('loading-screen')).not.toBeVisible({ timeout: 10000 });
  });

  // 以下のテストはE2Eレベルではコストが高いため、基本動作確認のみとするか、スキップのまま理由を明記する

  test.skip('E2E-008: 大量データ時のパフォーマンス', async () => {
    // 大量データのセットアップが必要
    // ユニットテストやパフォーマンステストでカバー推奨
  });

  test.skip('E2E-009: 同時アクセス時のデータ整合性', async () => {
    // 複数ブラウザ/コンテキストの並列操作が必要
  });

  test.skip('E2E-010: CSRFトークン検証', async () => {
    // セキュリティテストとして実施推奨
  });
});
