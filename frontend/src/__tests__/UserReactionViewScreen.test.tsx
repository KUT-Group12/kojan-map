import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserReactionViewScreen } from '../components/UserReactionViewScreen';
import { Post, User } from '../types';

describe('UserReactionViewScreen', () => {
  const mockUser: User = {
    id: 'google-123',
    name: 'テストユーザー',
    role: 'general', // または 'general' (型定義に合わせてください)
    email: 'test@example.com',
    // --- 不足していたプロパティを追加 ---
    createdAt: new Date(),
  };

  const mockPosts = [
    {
      postId: 101,
      title: 'テスト投稿',
      text: 'リアクションした内容です',
      numReaction: 5,
      genreName: 'グルメ',
      genreColor: '#ff0000',
      businessName: 'カフェ・テスト',
      userId: 'business-1',
    },
  ];

  const mockOnPinClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('マウント時に正しいURLでAPIを取得し、投稿一覧を表示すること', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ posts: mockPosts }),
    });

    render(<UserReactionViewScreen user={mockUser} onPinClick={mockOnPinClick} />);

    // ローディング表示の確認
    const loader = document.querySelector('.animate-spin');
    expect(loader).toBeInTheDocument();

    await waitFor(() => {
      // API呼び出しの検証（エンコードされたIDが含まれているか）
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`googleId=${encodeURIComponent(mockUser.id)}`),
        expect.any(Object)
      );
      // コンテンツの表示確認
      expect(screen.getByText('テスト投稿')).toBeInTheDocument();
      expect(screen.getByText('グルメ')).toBeInTheDocument();
      expect(screen.getByText('カフェ・テスト')).toBeInTheDocument();
    });
  });

  it('DBから取得したジャンル色がBadgeに適用されていること', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ posts: mockPosts }),
    });

    render(<UserReactionViewScreen user={mockUser} onPinClick={mockOnPinClick} />);

    await waitFor(() => {
      const badge = screen.getByText('グルメ');
      // style属性に直接色が指定されているか確認
      expect(badge).toHaveStyle({ backgroundColor: '#ff0000' });
    });
  });

  it('投稿カードをクリックしたとき、onPinClickが呼ばれること', async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ posts: mockPosts }),
    });

    render(<UserReactionViewScreen user={mockUser} onPinClick={mockOnPinClick} />);

    await waitFor(() => {
      const card = screen.getByText('テスト投稿').closest('.cursor-pointer');
      if (!card) throw new Error('Card not found');
      user.click(card);
    });

    await waitFor(() => {
      expect(mockOnPinClick).toHaveBeenCalledWith(expect.objectContaining({ postId: 101 }));
    });
  });

  it('リアクション履歴が空の場合、メッセージを表示すること', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ posts: [] }),
    });

    render(<UserReactionViewScreen user={mockUser} onPinClick={mockOnPinClick} />);

    await waitFor(() => {
      expect(screen.getByText('まだリアクションがありません')).toBeInTheDocument();
    });
  });

  it('APIエラー時にログを出力し、ローディングが終了すること', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (global.fetch as any).mockRejectedValueOnce(new Error('Fetch Failed'));

    render(<UserReactionViewScreen user={mockUser} onPinClick={mockOnPinClick} />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Fetch error:', expect.any(Error));
      // ローディングが消えていることを確認
      expect(document.querySelector('.animate-spin')).not.toBeInTheDocument();
    });
    consoleSpy.mockRestore();
  });
});
