import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Sidebar } from '../components/Sidebar';

// fetchのモック
const fetchMock = jest.fn() as jest.Mock;

describe('Sidebar コンポーネント', () => {
  const mockUser = { googleId: 'user-1', role: 'general' };
  const mockPosts = [
    {
      postId: 1,
      title: '投稿1',
      text: '内容1',
      genreId: 0,
      postDate: new Date().toISOString(),
      numReaction: 5,
    },
  ];
  const mockOnFilterChange = jest.fn();
  const mockOnPinClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    window.fetch = fetchMock;
    fetchMock.mockReset();
    jest.useFakeTimers(); // デバウンス(setTimeout)制御用
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('初期表示で投稿リストが表示されること', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ posts: mockPosts }),
    } as Response);

    render(
      <Sidebar
        user={mockUser as any}
        posts={mockPosts as any}
        onFilterChange={mockOnFilterChange}
        onPinClick={mockOnPinClick}
      />
    );

    // デバウンス待機
    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(screen.getByText('投稿1')).toBeInTheDocument();
    });
  });

  test('キーワード入力時に正しい検索APIが呼ばれること', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ posts: [] }),
    } as Response);

    render(
      <Sidebar
        user={mockUser as any}
        posts={mockPosts as any}
        onFilterChange={mockOnFilterChange}
        onPinClick={mockOnPinClick}
      />
    );

    const searchInput = screen.getByPlaceholderText('キーワードで検索...');
    fireEvent.change(searchInput, { target: { value: '高知' } });

    // 500ms進める
    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/posts/search?keyword=%E9%AB%98%E7%9F%A5')
      );
    });
  });

  test('事業者の場合、検索フォームが表示されないこと', () => {
    const businessUser = { ...mockUser, role: 'business' };
    render(
      <Sidebar
        user={businessUser as any}
        posts={mockPosts as any}
        onFilterChange={mockOnFilterChange}
        onPinClick={mockOnPinClick}
      />
    );

    expect(screen.queryByPlaceholderText('キーワードで検索...')).not.toBeInTheDocument();
  });

  test('投稿をクリックすると onPinClick が呼ばれること', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ posts: mockPosts }),
    } as Response);

    render(
      <Sidebar
        user={mockUser as any}
        posts={mockPosts as any}
        onFilterChange={mockOnFilterChange}
        onPinClick={mockOnPinClick}
      />
    );

    act(() => {
      jest.advanceTimersByTime(500);
    });

    const postButton = await screen.findByText('投稿1');
    fireEvent.click(postButton);

    expect(mockOnPinClick).toHaveBeenCalledWith(expect.objectContaining({ postId: 1 }));
  });

  test('検索結果が空の場合にメッセージが表示されること', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ posts: [] }),
    } as Response);

    render(
      <Sidebar
        user={mockUser as any}
        posts={[]}
        onFilterChange={mockOnFilterChange}
        onPinClick={mockOnPinClick}
      />
    );

    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(screen.getByText('該当する投稿が見つかりませんでした')).toBeInTheDocument();
    });
  });
});
