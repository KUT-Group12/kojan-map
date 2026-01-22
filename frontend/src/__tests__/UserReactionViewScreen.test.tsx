import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserReactionViewScreen } from '../components/UserReactionViewScreen';
import { User, Post } from '../types';

// fetch のモック
vi.stubGlobal('fetch', vi.fn());

// Mock getStoredJWT
vi.mock('../lib/auth', () => ({
  getStoredJWT: vi.fn(() => 'mock-token'),
}));

describe('UserReactionViewScreen', () => {
  const mockUser: User = {
    googleId: 'user-123',
    gmail: 'test@example.com',
    role: 'general',
    registrationDate: '2024-01-01',
    fromName: 'テストユーザー',
  };

  const mockPosts: Post[] = [
    {
      postId: 1,
      title: 'テスト投稿',
      text: 'これはテストの本文です。',
      genreName: 'カフェ',
      genreColor: '#ff0000',
      businessName: 'テスト店舗',
      numReaction: 10,
      userId: 'business-1',
    } as Post,
  ];

  const mockOnPinClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const getFetchMock = () => globalThis.fetch as any;

  it('初期レンダリング時にローディングが表示され、APIが呼ばれること', async () => {
    getFetchMock().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ posts: [] }),
    });

    render(<UserReactionViewScreen user={mockUser} onPinClick={mockOnPinClick} />);

    // ローディングアイコンの確認
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();

    await waitFor(() => {
      expect(getFetchMock()).toHaveBeenCalledWith(
        expect.stringContaining(`/api/reactions/list?googleId=${mockUser.googleId}`),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token',
          }),
        })
      );
    });
  });

  it('リアクションした投稿が正しく表示されること', async () => {
    getFetchMock().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ posts: mockPosts }),
    });

    render(<UserReactionViewScreen user={mockUser} onPinClick={mockOnPinClick} />);

    // APIから取得した内容の表示確認
    const title = await screen.findByText('テスト投稿');
    expect(title).toBeInTheDocument();
    expect(screen.getByText('カフェ')).toBeInTheDocument();
    expect(screen.getByText('テスト店舗')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();

    // ジャンルバッジの色がAPIの指定通りか確認
    const badge = screen.getByText('カフェ');
    expect(badge).toHaveStyle({ backgroundColor: '#ff0000' });
  });

  it('投稿カードをクリックすると onPinClick が呼ばれること', async () => {
    getFetchMock().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ posts: mockPosts }),
    });

    render(<UserReactionViewScreen user={mockUser} onPinClick={mockOnPinClick} />);

    const card = await screen.findByText('テスト投稿');
    fireEvent.click(card.closest('.cursor-pointer')!);

    expect(mockOnPinClick).toHaveBeenCalledWith(mockPosts[0]);
  });

  it('リアクションがない場合にメッセージが表示されること', async () => {
    getFetchMock().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ posts: [] }),
    });

    render(<UserReactionViewScreen user={mockUser} onPinClick={mockOnPinClick} />);

    const emptyMessage = await screen.findByText('まだリアクションがありません');
    expect(emptyMessage).toBeInTheDocument();
  });

  it('コンポーネントがアンマウントされた際、AbortControllerが呼ばれること', async () => {
    const abortSpy = vi.spyOn(AbortController.prototype, 'abort');

    getFetchMock().mockImplementationOnce(() => new Promise(() => {})); // 完了しないPromise

    const { unmount } = render(
      <UserReactionViewScreen user={mockUser} onPinClick={mockOnPinClick} />
    );

    unmount();
    expect(abortSpy).toHaveBeenCalled();
  });
});
