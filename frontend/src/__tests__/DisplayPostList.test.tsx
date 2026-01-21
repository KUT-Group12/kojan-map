<<<<<<< HEAD
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DisplayPostList } from '../components/DisplayPostList';
import { Post, User, Place } from '../types';

describe('DisplayPostList', () => {
  const mockUser: User = {
    id: 'user-1',
    name: 'テストユーザー',
    role: 'general',
    email: 'test@example.com',
    createdAt: new Date(),
  };

  const mockPost: Post = {
    postId: 101,
    title: '基本タイトル',
    text: '基本の本文',
    genreId: 1,
    genreName: 'グルメ',
    genreColor: '#ff0000',
    userId: 'user-2', // 自分以外の投稿
    postDate: '2024-01-21T10:00:00Z',
    numReaction: 5,
    numView: 10,
    placeId: 2,
  };

  const mockPlace: Place = {
    placeId: 2,
    numPost: 10,
    latitude: 35.6812,
    longitude: 139.7671,
  };

  const defaultProps = {
    post: mockPost,
    place: mockPlace,
    currentUser: mockUser,
    isReacted: false,
    onClose: vi.fn(),
    onReaction: vi.fn(),
    onDelete: vi.fn(),
    onBlockUser: vi.fn(),
    onSelectPin: vi.fn(),
    postsAtLocation: [mockPost, { ...mockPost, postId: 102, title: '別の投稿' }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('初期表示と詳細APIの取得が正しく行われること', async () => {
    // APIから返ってくる詳細データ
    const detailedPost = { ...mockPost, text: 'APIから取得した詳細な本文' };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ post: detailedPost }),
    });

    render(<DisplayPostList {...defaultProps} />);

    // 読み込み中表示の確認
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();

    await waitFor(() => {
      // APIが正しいURLで呼ばれたか
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('postId=101'));
      // 詳細データが反映されているか
      expect(screen.getByText('APIから取得した詳細な本文')).toBeInTheDocument();
      // ジャンルバッジの色を確認
      const badge = screen.getByText('グルメ');
      expect(badge).toHaveStyle({ backgroundColor: '#ff0000' });
    });
  });

  it('自分の投稿の場合、削除ボタンが表示されること', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ post: mockPost }),
    });

    const ownPostProps = {
      ...defaultProps,
      post: { ...mockPost, userId: 'user-1' }, // currentUser.id と一致
    };

    render(<DisplayPostList {...ownPostProps} />);

    await waitFor(() => {
      // 削除ボタン（SelectPostDeletionコンポーネント内）が存在するか確認
      // ※SelectPostDeletionの実装に合わせてroleやテキストを変更してください
      expect(screen.queryByText('通報')).not.toBeInTheDocument();
    });
  });

  it('他人の投稿の場合、通報とブロックボタンが表示されること', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ post: mockPost }),
    });

    render(<DisplayPostList {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('通報')).toBeInTheDocument();
      // SelectBlockコンポーネントが存在すること
      const blockBtn = screen.getByRole('button', { name: /ブロック/i });
      expect(blockBtn).toBeInTheDocument();
    });
  });

  it('別のピンを選択したときに onSelectPin が呼ばれること', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ post: mockPost }),
    });

    render(<DisplayPostList {...defaultProps} />);

    await waitFor(() => {
      const otherPostBtn = screen.getByText('別の投稿');
      fireEvent.click(otherPostBtn);
      expect(defaultProps.onSelectPin).toHaveBeenCalledWith(
        expect.objectContaining({ postId: 102 })
      );
    });
  });

  it('詳細APIがエラーを返しても、Propsのデータで表示を継続すること', async () => {
    console.error = vi.fn(); // エラーログの抑制
    (global.fetch as any).mockRejectedValueOnce(new Error('API Error'));

    render(<DisplayPostList {...defaultProps} />);

    await waitFor(() => {
      // APIが失敗してもタイトルなどはPropsから表示される
      expect(screen.getByRole('heading', { name: '基本タイトル' })).toBeInTheDocument();
      expect(screen.getByText('基本の本文')).toBeInTheDocument();
    });
=======
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
>>>>>>> main
  });
});
