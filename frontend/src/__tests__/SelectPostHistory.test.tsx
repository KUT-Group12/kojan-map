import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('SelectPostHistory', () => {
  const mockUser = { id: 'google-123', name: 'テストユーザー' } as any;
  const mockOnPinClick = vi.fn();
  const TEST_API_URL = 'http://test-api.com';

  const mockPosts = [
    {
      postId: 1,
      title: 'テスト投稿1',
      description: '説明1',
      genre: 'other',
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      postId: 2,
      title: 'テスト投稿2',
      description: '説明2',
      genre: 'other',
      createdAt: '2024-01-02T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv('VITE_API_URL', TEST_API_URL);
    global.fetch = vi.fn();
  });

  // コンポーネントを動的にインポートするヘルパー
  const renderComponent = async () => {
    const { SelectPostHistory } = await import('../components/SelectPostHistory');
    return render(<SelectPostHistory user={mockUser} onPinClick={mockOnPinClick} />);
  };

  it('読み込み中にローディングアイコンが表示されること', async () => {
    // レスポンスを未完了にする
    (global.fetch as any).mockReturnValue(new Promise(() => {}));

    await renderComponent();

    // role="img" ではなく、クラス名や DOM 構造で検索
    const loader = document.querySelector('.animate-spin');
    expect(loader).toBeInTheDocument();
    expect(loader?.nodeName).toBe('svg');
  });

  it('投稿がない場合にメッセージが表示されること', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ posts: [] }),
    });

    await renderComponent();

    await waitFor(() => {
      expect(screen.getByText('まだ投稿がありません')).toBeInTheDocument();
    });
  });

  it('APIから取得した投稿履歴が正しく表示されること', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ posts: mockPosts }),
    });

    await renderComponent();

    await waitFor(() => {
      // URLが環境変数のもの（http://test-api.com）であることを確認
      expect(global.fetch).toHaveBeenCalledWith(
        `${TEST_API_URL}/api/posts/history?googleId=${mockUser.id}`
      );
      // 投稿タイトルが表示されているか
      expect(screen.getByText('テスト投稿1')).toBeInTheDocument();
      expect(screen.getByText('テスト投稿2')).toBeInTheDocument();
    });
  });

  it('APIエラー時にローディングが終了すること', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Fetch error'));

    await renderComponent();

    await waitFor(() => {
      // ローディングアイコンが消えていることを確認
      expect(document.querySelector('.animate-spin')).not.toBeInTheDocument();
    });
  });
});
