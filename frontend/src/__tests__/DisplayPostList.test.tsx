import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DisplayPostList } from '../components/DisplayPostList';

// fetchのモック
const fetchMock = jest.fn() as jest.Mock;

describe('DisplayPostList コンポーネント', () => {
  const mockPost = {
    postId: 1, // コンポーネント側が id を期待している場合は id に変更
    id: 1, // 両方含めておくと安全です
    userId: 'user-A',
    title: 'メインの投稿タイトル',
    text: '初期のテキスト',
    genreId: 0,
    postDate: '2024-01-20T10:00:00Z',
    numReaction: 5,
    numView: 100,
  };

  const mockPlace = { latitude: 33.6, longitude: 133.6, name: 'テスト地点' };
  const mockUser = { googleId: 'user-current', role: 'general', id: 'user-current' };

  const mockOnClose = jest.fn();
  const mockOnReaction = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnSelectPin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    window.fetch = fetchMock;
    // デフォルトの成功レスポンス
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ post: mockPost }),
    });
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

    expect(screen.getByText(/読み込み中/)).toBeInTheDocument();
  });

  test('詳細データを取得後、最新のテキストと閲覧数が表示されること', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        post: { ...mockPost, text: 'APIから取得した詳細な説明文', numView: 100 },
      }),
    });

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

    await waitFor(() => {
      expect(screen.getByText('APIから取得した詳細な説明文')).toBeInTheDocument();
    });

    // 「100」と「閲覧」が別々の要素に分かれている可能性があるため正規表現で検証
    expect(screen.getByText(/100/)).toBeInTheDocument();
    expect(screen.getByText(/閲覧/)).toBeInTheDocument();
  });

  test('自分の投稿の場合、削除ボタンが表示されること', async () => {
    // 投稿者ID(userId)をログインユーザー(googleId)と一致させる
    const ownUser = { googleId: 'user-A', role: 'general', id: 'user-A' };

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
      // lucide-reactのアイコンなどは aria-label や role="button" で取得
      const deleteBtn =
        screen.getByRole('button', { name: /削除/i }) || screen.queryByTestId('delete-button');
      expect(deleteBtn).toBeInTheDocument();
    });
  });

  test('他人の投稿の場合、通報ボタンが表示されること', async () => {
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

    await waitFor(() => {
      expect(screen.getByText(/通報/)).toBeInTheDocument();
    });
  });

  test('同じ場所の他の投稿をクリックすると onSelectPin が呼ばれること', async () => {
    const postsAtLocation = [
      mockPost,
      { postId: 2, id: 2, title: '別の投稿', numReaction: 2, userId: 'user-B' },
    ];

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

    // リストがレンダリングされるのを待つ
    const otherPostItem = await screen.findByText('別の投稿');
    fireEvent.click(otherPostItem);

    expect(mockOnSelectPin).toHaveBeenCalled();
  });
});
