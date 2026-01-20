import { render, screen, waitFor } from '@testing-library/react';
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

    await waitFor(() => {
      expect(screen.getByText('まだ投稿がありません')).toBeInTheDocument();
    });
  });

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
  });
});
