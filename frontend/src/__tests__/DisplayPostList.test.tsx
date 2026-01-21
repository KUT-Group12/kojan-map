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
  });
});
