import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserReactionViewScreen } from '../components/UserReactionViewScreen';

// モックデータ
const mockUser = { id: 'google-123', name: 'Test User' } as any;

const mockPosts = [
  {
    postId: 'post-1',
    title: 'テスト投稿1',
    text: 'これはテスト投稿の内容です',
    genreId: 1, // GENRE_MAP に対応するID
    userId: 'user-A',
    numReaction: 10,
  },
  {
    postId: 'post-2',
    title: 'テスト投稿2',
    text: '2つ目の投稿内容',
    genreId: 2,
    userId: 'user-B',
    numReaction: 5,
  },
];

describe('UserReactionViewScreen', () => {
  const mockOnPinClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('データ取得中にローディングアイコンが表示されること', () => {
    // fetchを未完了（Pending）状態で止める
    (global.fetch as any).mockReturnValue(new Promise(() => {}));

    render(<UserReactionViewScreen user={mockUser} onPinClick={mockOnPinClick} />);

    // Loader2 (lucide-react) は SVG に `animate-spin` クラスを持つ
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('リアクションした投稿が正常に表示されること', async () => {
    // 成功レスポンスのモック
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ posts: mockPosts }),
    });

    render(<UserReactionViewScreen user={mockUser} onPinClick={mockOnPinClick} />);

    // タイトルが表示されるまで待機
    await waitFor(() => {
      expect(screen.getByText('テスト投稿1')).toBeInTheDocument();
      expect(screen.getByText('テスト投稿2')).toBeInTheDocument();
    });

    // 投稿者IDやリアクション数も確認
    expect(screen.getByText('投稿者ID: user-A')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('データが空の場合にメッセージが表示されること', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ posts: [] }),
    });

    render(<UserReactionViewScreen user={mockUser} onPinClick={mockOnPinClick} />);

    await waitFor(() => {
      expect(screen.getByText('まだリアクションがありません')).toBeInTheDocument();
    });
  });

  it('カードをクリックした時に onPinClick が呼ばれること', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ posts: mockPosts }),
    });

    render(<UserReactionViewScreen user={mockUser} onPinClick={mockOnPinClick} />);

    // カードの出現を待つ
    const card = await screen.findByText('テスト投稿1');
    fireEvent.click(card.closest('.cursor-pointer')!);

    expect(mockOnPinClick).toHaveBeenCalledWith(mockPosts[0]);
  });

  it('APIエラー時にログを出力し、ローディングが終了すること', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (global.fetch as any).mockRejectedValueOnce(new Error('API Error'));

    render(<UserReactionViewScreen user={mockUser} onPinClick={mockOnPinClick} />);

    // ローディングが終わり、データがない状態になることを確認
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument(); // Loaderが消えたか
      expect(screen.getByText('まだリアクションがありません')).toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
