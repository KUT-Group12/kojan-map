import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// モックデータと型の準備
const mockUser = { id: 'user-1', name: 'テストユーザー', role: 'user' } as any;
const mockPlace = { latitude: 35.1234, longitude: 135.5678 } as any;
const mockPost = {
  postId: 101,
  title: 'テスト投稿タイトル',
  text: '基本の本文',
  genreId: 1,
  userId: 'user-2', // 他人の投稿
  postDate: '2024-01-21T10:00:00Z',
  numReaction: 5,
  numView: 10,
  placeId: 1,
} as any;

describe('DisplayPostList', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv('VITE_API_URL', 'http://test-api.com');
    global.fetch = vi.fn();
    // スクロール関数のモック
    Element.prototype.scrollTo = vi.fn() as any;
  });

  const renderComponent = async (props = {}) => {
    const { DisplayPostList } = await import('../components/DisplayPostList');
    return render(
      <DisplayPostList
        post={mockPost}
        place={mockPlace}
        currentUser={mockUser}
        isReacted={false}
        onClose={vi.fn()}
        onReaction={vi.fn()}
        onDelete={vi.fn()}
        {...props}
      />
    );
  };

  it('初期表示と詳細APIの取得が正しく行われること', async () => {
    // APIレスポンスのモック
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        post: { ...mockPost, text: 'APIから取得した詳細な本文' },
      }),
    });

    await renderComponent();

    // ローディング表示が出ることを確認
    expect(screen.getByText('詳細を読み込み中...')).toBeInTheDocument();

    // APIが呼ばれたか確認
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/posts/detail?postId=101')
    );

    // API取得後のデータが表示されるか確認
    await waitFor(() => {
      expect(screen.getByText('APIから取得した詳細な本文')).toBeInTheDocument();
      expect(screen.queryByText('詳細を読み込み中...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('テスト投稿タイトル')).toBeInTheDocument();
    expect(screen.getByText(/35.1234/)).toBeInTheDocument();
  });

  it('自分の投稿の場合、削除ボタンが表示されること', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ post: mockPost }),
    });

    // 自分の投稿にする
    const ownPost = { ...mockPost, userId: mockUser.id };
    await renderComponent({ post: ownPost });

    // SelectPostDeletion コンポーネントがレンダリングされているか
    // (コンポーネント内のテキストや役割で確認)
    await waitFor(() => {
      // 実際の実装に合わせて修正してください（例: ゴミ箱アイコンや「削除」テキスト）
      expect(screen.getByRole('button', { name: /削除/i })).toBeInTheDocument();
    });
  });

  it('他人の投稿の場合、通報とブロックボタンが表示されること', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ post: mockPost }),
    });

    const onBlockUser = vi.fn();
    await renderComponent({ onBlockUser });

    await waitFor(() => {
      // 通報ボタン（ReportScreen内）の存在確認
      expect(screen.getByText(/通報/i)).toBeInTheDocument();
      // ブロックボタン（SelectBlock内）の存在確認
      expect(screen.getByText(/ブロック/i)).toBeInTheDocument();
    });
  });

  it('別のピンを選択したときに onSelectPin が呼ばれること', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ post: mockPost }),
    });

    const onSelectPin = vi.fn();
    const postsAtLocation = [mockPost, { ...mockPost, postId: 102, title: '隣の投稿' }];

    await renderComponent({ postsAtLocation, onSelectPin });

    await waitFor(() => {
      const otherPost = screen.getByText('隣の投稿');
      fireEvent.click(otherPost);
      expect(onSelectPin).toHaveBeenCalledWith(postsAtLocation[1]);
    });
  });
});
