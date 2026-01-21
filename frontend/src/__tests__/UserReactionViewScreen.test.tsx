import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { UserReactionViewScreen } from '../components/UserReactionViewScreen';

// fetchのモック
const fetchMock = jest.fn() as jest.Mock;

describe('UserReactionViewScreen コンポーネント', () => {
  const mockUser = { googleId: 'my-id', role: 'general' };
  const mockOnPinClick = jest.fn();

  const mockPosts = [
    {
      postId: 101,
      userId: 'user-other',
      title: 'リアクションした投稿1',
      text: '本文1',
      genreId: 0,
      numReaction: 15,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    window.fetch = fetchMock;
    fetchMock.mockReset();
  });

  test('ロード中にローディングスピナーが表示されること', () => {
    fetchMock.mockReturnValue(new Promise(() => {})); // 完了しないPromise

    render(<UserReactionViewScreen user={mockUser as any} onPinClick={mockOnPinClick} />);

    // animate-spin クラスを持つ Loader2 を探す
    const loader = document.querySelector('.animate-spin');
    expect(loader).toBeInTheDocument();
  });

  test('APIから取得したデータが正しく表示されること', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ posts: mockPosts }),
    } as Response);

    render(<UserReactionViewScreen user={mockUser as any} onPinClick={mockOnPinClick} />);

    // fetchのURLとエンコードを確認
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/reactions/list?googleId=my-id'),
      expect.any(Object)
    );

    await waitFor(() => {
      expect(screen.getByText('リアクションした投稿1')).toBeInTheDocument();
      expect(screen.getByText('投稿者ID: user-other')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
    });
  });

  test('投稿が0件の場合、「まだリアクションがありません」と表示されること', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ posts: [] }),
    } as Response);

    render(<UserReactionViewScreen user={mockUser as any} onPinClick={mockOnPinClick} />);

    await waitFor(() => {
      expect(screen.getByText('まだリアクションがありません')).toBeInTheDocument();
    });
  });

  test('カードをクリックすると onPinClick が呼ばれること', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ posts: mockPosts }),
    } as Response);

    render(<UserReactionViewScreen user={mockUser as any} onPinClick={mockOnPinClick} />);

    await waitFor(() => {
      const card = screen.getByText('リアクションした投稿1').closest('.cursor-pointer');
      if (card) fireEvent.click(card);
    });

    expect(mockOnPinClick).toHaveBeenCalledWith(mockPosts[0]);
  });

  test('APIエラー時にエラーログが出力され、ローディングが終了すること', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    fetchMock.mockRejectedValueOnce(new Error('API Error'));

    render(<UserReactionViewScreen user={mockUser as any} onPinClick={mockOnPinClick} />);

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument(); // ローダー消去
      expect(screen.getByText('まだリアクションがありません')).toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
