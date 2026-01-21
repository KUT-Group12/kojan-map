import { render, screen, waitFor } from '@testing-library/react';
<<<<<<< HEAD
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
=======
import { SelectPostHistory } from '../components/SelectPostHistory';

// fetchのモック設定
const fetchMock = jest.fn() as jest.Mock;

describe('SelectPostHistory コンポーネント', () => {
  const mockUser = { googleId: 'test-user-123', role: 'general' };
  const mockOnPinClick = jest.fn();

  const mockPostsResponse = {
    posts: [
      {
        postId: 1,
        title: '投稿1',
        text: '本文1',
        genreId: 0,
        numReaction: 5,
        postDate: '2024-01-20T10:00:00Z',
      },
      {
        postId: 2,
        title: '投稿2',
        text: '本文2',
        genreId: 1,
        numReaction: 2,
        postDate: '2024-01-21T10:00:00Z',
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    window.fetch = fetchMock;
    fetchMock.mockReset();
  });

  test('初期ロード中にローディングアイコンが表示されること', () => {
    // 解決しないプロミスを返してロード状態を維持
    fetchMock.mockReturnValue(new Promise(() => {}));

    render(<SelectPostHistory user={mockUser as any} onPinClick={mockOnPinClick} />);

    // LucideのLoader2（animate-spin）を探す
    const loader = document.querySelector('.animate-spin');
    expect(loader).toBeInTheDocument();
  });

  test('APIからデータを取得し、投稿リストが表示されること', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPostsResponse,
    } as Response);

    render(<SelectPostHistory user={mockUser as any} onPinClick={mockOnPinClick} />);

    // 正しいURLでfetchが呼ばれたか確認
    expect(fetchMock).toHaveBeenCalledWith(`/api/posts/history?googleId=${mockUser.googleId}`);

    // データが表示されるのを待機
    await waitFor(() => {
      expect(screen.getByText('投稿1')).toBeInTheDocument();
      expect(screen.getByText('投稿2')).toBeInTheDocument();
    });
  });

  test('投稿が0件の場合、「まだ投稿がありません」と表示されること', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ posts: [] }),
    } as Response);

    render(<SelectPostHistory user={mockUser as any} onPinClick={mockOnPinClick} />);
>>>>>>> main

    await waitFor(() => {
      expect(screen.getByText('まだ投稿がありません')).toBeInTheDocument();
    });
  });

<<<<<<< HEAD
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
=======
  test('APIエラー時にローディングが終了し、空の状態（またはエラー表示）になること', async () => {
    // console.error を一時的に抑制
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    fetchMock.mockRejectedValueOnce(new Error('Fetch failed'));

    render(<SelectPostHistory user={mockUser as any} onPinClick={mockOnPinClick} />);

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument(); // ローダーが消える
      expect(screen.getByText('まだ投稿がありません')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
>>>>>>> main
  });
});
