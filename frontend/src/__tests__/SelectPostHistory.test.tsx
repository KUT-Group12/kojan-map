import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SelectPostHistory } from '../components/SelectPostHistory';
import { User, Post } from '../types';

// fetch のモック
vi.stubGlobal('fetch', vi.fn());

// 子コンポーネント SelectPostDeletion のモック（複雑な挙動を単純化するため）
vi.mock('../components/SelectPostDeletion', () => ({
  SelectPostDeletion: ({ onDelete, postId }: any) => (
    <button onClick={() => onDelete(postId)}>模擬削除ボタン</button>
  ),
}));

describe('SelectPostHistory', () => {
  const mockUser: User = {
    googleId: 'test-user-id',
    gmail: 'test@gmail.com',
    role: 'general',
    registrationDate: new Date().toISOString(),
    fromName: 'テストユーザー',
  };

  const mockPosts: Post[] = [
    {
      postId: 1,
      title: '投稿1',
      text: '本文1',
      userId: 'test-user-id',
      postDate: '2024-01-20T10:00:00Z',
      numReaction: 0,
      numView: 5,
      genreId: 1,
      genreName: 'グルメ',
      genreColor: '#ff0000',
      placeId: 1,
    },
    {
      postId: 2,
      title: '投稿2',
      text: '本文2',
      userId: 'test-user-id',
      postDate: '2024-01-21T10:00:00Z',
      numReaction: 3,
      numView: 10,
      genreId: 2,
      genreName: '観光',
      genreColor: '#00ff00',
      placeId: 2,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const getFetchMock = () => globalThis.fetch as any;

  it('初期表示でローディングが表示され、APIから取得後にデータが表示されること', async () => {
    // APIレスポンスをシミュレート
    getFetchMock().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ posts: mockPosts }),
    });

    render(<SelectPostHistory user={mockUser} onPinClick={vi.fn()} />);

    // ローディングアイコンの確認
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();

    // データ表示後の確認
    await waitFor(() => {
      expect(screen.getByText('投稿1')).toBeInTheDocument();
      expect(screen.getByText('投稿2')).toBeInTheDocument();
    });

    // 正しいAPIパスで呼ばれたか確認
    expect(getFetchMock()).toHaveBeenCalledWith(
      expect.stringContaining(`/api/posts/history?googleId=${mockUser.googleId}`)
    );
  });

  it('投稿が空の場合、メッセージが表示されること', async () => {
    getFetchMock().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ posts: [] }),
    });

    render(<SelectPostHistory user={mockUser} onPinClick={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('まだ投稿がありません')).toBeInTheDocument();
    });
  });

  it('削除ボタン（onDelete）が呼ばれると、リストから該当する投稿が消えること', async () => {
    getFetchMock().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ posts: mockPosts }),
    });

    render(<SelectPostHistory user={mockUser} onPinClick={vi.fn()} />);

    // データの表示を待つ
    await waitFor(() => {
      expect(screen.getByText('投稿1')).toBeInTheDocument();
    });

    // 「投稿1」の模擬削除ボタンをクリック
    const deleteButtons = screen.getAllByText('模擬削除ボタン');
    deleteButtons[0].click(); // 最初の投稿を削除

    // リストから消えていることを確認
    await waitFor(() => {
      expect(screen.queryByText('投稿1')).not.toBeInTheDocument();
      expect(screen.getByText('投稿2')).toBeInTheDocument(); // 2つ目は残っている
    });
  });

  it('APIエラー時にローディングが終了し、コンソールにエラーが出ること', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    getFetchMock().mockResolvedValueOnce({ ok: false });

    render(<SelectPostHistory user={mockUser} onPinClick={vi.fn()} />);

    await waitFor(() => {
      expect(document.querySelector('.animate-spin')).not.toBeInTheDocument();
      expect(consoleSpy).toHaveBeenCalledWith('Fetch history error:', expect.any(Error));
    });
    consoleSpy.mockRestore();
  });
});
