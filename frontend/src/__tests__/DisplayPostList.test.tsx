import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DisplayPostList } from '../components/DisplayPostList';

// fetchのモック
const fetchMock = jest.fn() as jest.Mock;

describe('DisplayPostList コンポーネント', () => {
  const mockPost = {
    postId: 1,
    userId: 'user-A',
    title: 'メインの投稿タイトル',
    text: '初期のテキスト',
    genreId: 0,
    postDate: '2024-01-20T10:00:00Z',
    numReaction: 5,
    numView: 100,
  };

  const mockPlace = { latitude: 33.6, longitude: 133.6 };
  const mockUser = { googleId: 'user-current', role: 'general' };

  const mockOnClose = jest.fn();
  const mockOnReaction = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    window.fetch = fetchMock;
    fetchMock.mockReset();
  });

  test('初期ロード中に「詳細を読み込み中...」が表示されること', () => {
    // 解決しないPromiseを返してロード状態を維持
    fetchMock.mockReturnValue(new Promise(() => {}));

    render(
      <DisplayPostList
        post={mockPost as any}
        place={mockPlace as any}
        currentUser={mockUser as any}
        isReacted={false}
        onClose={mockOnClose}
        onReaction={mockOnReaction}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('詳細を読み込み中...')).toBeInTheDocument();
  });

  test('詳細データを取得後、最新のテキストと閲覧数が表示されること', async () => {
    // 詳細APIのレスポンスをモック
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        post: { ...mockPost, text: 'APIから取得した詳細な説明文' },
      }),
    } as Response);

    render(
      <DisplayPostList
        post={mockPost as any}
        place={mockPlace as any}
        currentUser={mockUser as any}
        isReacted={false}
        onClose={mockOnClose}
        onReaction={mockOnReaction}
        onDelete={mockOnDelete}
      />
    );

    // API取得後のテキストが表示されるまで待機
    await waitFor(() => {
      expect(screen.getByText('APIから取得した詳細な説明文')).toBeInTheDocument();
    });

    expect(screen.getByText(/100 閲覧/)).toBeInTheDocument();
  });

  test('自分の投稿の場合、削除ボタンが表示されること', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ post: mockPost }) });

    // 投稿者とログインユーザーを同じにする
    const ownUser = { googleId: 'user-A', role: 'general' };

    render(
      <DisplayPostList
        post={mockPost as any}
        place={mockPlace as any}
        currentUser={ownUser as any}
        isReacted={false}
        onClose={mockOnClose}
        onReaction={mockOnReaction}
        onDelete={mockOnDelete}
      />
    );

    await waitFor(() => {
      // 削除ボタン（SelectPostDeletionコンポーネント内）が存在するか
      // SelectPostDeletionがButtonを使っている前提
      expect(screen.getByRole('button', { name: /削除|ゴミ箱/i })).toBeInTheDocument();
    });
  });

  test('他人の投稿の場合、通報ボタンが表示されること', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ post: mockPost }) });

    render(
      <DisplayPostList
        post={mockPost as any}
        place={mockPlace as any}
        currentUser={mockUser as any} // user-current
        isReacted={false}
        onClose={mockOnClose}
        onReaction={mockOnReaction}
        onDelete={mockOnDelete}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('通報')).toBeInTheDocument();
    });
  });

  test('同じ場所の他の投稿をクリックすると onSelectPin が呼ばれること', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ post: mockPost }) });

    const postsAtLocation = [mockPost, { postId: 2, title: '別の投稿', numReaction: 2 }];
    const mockOnSelectPin = jest.fn();

    render(
      <DisplayPostList
        post={mockPost as any}
        place={mockPlace as any}
        currentUser={mockUser as any}
        isReacted={false}
        onClose={mockOnClose}
        onReaction={mockOnReaction}
        onDelete={mockOnDelete}
        postsAtLocation={postsAtLocation as any}
        onSelectPin={mockOnSelectPin}
      />
    );

    await waitFor(() => {
      const otherPostItem = screen.getByText('別の投稿');
      fireEvent.click(otherPostItem);
    });

    expect(mockOnSelectPin).toHaveBeenCalledWith(expect.objectContaining({ postId: 2 }));
  });
});
