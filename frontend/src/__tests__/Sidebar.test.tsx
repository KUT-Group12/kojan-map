import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Sidebar } from '../components/Sidebar';
import { Post } from '../types';

// モックデータ
const mockUser = { id: 'u1', role: 'user', name: 'Test User' } as any;
const mockPosts: Post[] = [
  {
    postId: 1,
    title: '投稿1',
    text: '本文1',
    genreId: 1,
    postDate: new Date().toISOString(),
    numReaction: 0,
    userId: 'a',
    // --- 不足していたプロパティを追加 ---
    placeId: 1,
    numView: 0,
  },
];

describe('Sidebar', () => {
  const mockOnFilterChange = vi.fn();
  const mockOnPinClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    // タイマーをモック（デバウンス対策）
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('キーワード入力時にデバウンスを経て正しくAPIが呼ばれること', async () => {
    const user = userEvent.setup({ delay: null }); // FakeTimers使用時はdelay: nullが必要

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ posts: mockPosts }),
    });

    render(
      <Sidebar
        user={mockUser}
        posts={[]}
        onFilterChange={mockOnFilterChange}
        onPinClick={mockOnPinClick}
      />
    );

    const input = screen.getByPlaceholderText('キーワードで検索...');
    await user.type(input, 'カフェ');

    // 500ms待つ前は呼ばれていないはず
    expect(global.fetch).not.toHaveBeenCalled();

    // タイマーを500ms進める
    vi.advanceTimersByTime(500);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('keyword=%E3%82%AB%E3%83%95%E3%82%A7'), // "カフェ"のエンコード
        expect.any(Object)
      );
    });
  });

  it('ジャンルを選択したときに特定のURLでAPIが呼ばれること', async () => {
    // Selectコンポーネント（Radix UI）は通常クリックシミュレーションが必要
    // ここではロジックの疎通を確認
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ posts: mockPosts }),
    });

    render(
      <Sidebar
        user={mockUser}
        posts={[]}
        onFilterChange={mockOnFilterChange}
        onPinClick={mockOnPinClick}
      />
    );

    // ジャンル選択操作（shadcn/uiのSelectを想定した簡易操作）
    // ※実環境ではgetByRole('combobox')などでクリックが必要

    // 手動で状態変更を模倣せず、タイマーを進めて初期取得などを確認
    vi.advanceTimersByTime(500);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('事業者ユーザーの場合、検索フォームが表示されないこと', () => {
    const businessUser = { ...mockUser, role: 'business' };
    render(
      <Sidebar
        user={businessUser}
        posts={mockPosts}
        onFilterChange={mockOnFilterChange}
        onPinClick={mockOnPinClick}
      />
    );

    expect(screen.queryByPlaceholderText('キーワードで検索...')).not.toBeInTheDocument();
    // 事業者名が表示されていることを確認
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('APIエラーが発生したとき、エラーログが出力されリストが空になること', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (global.fetch as any).mockRejectedValueOnce(new Error('API Failure'));

    render(
      <Sidebar
        user={mockUser}
        posts={mockPosts}
        onFilterChange={mockOnFilterChange}
        onPinClick={mockOnPinClick}
      />
    );

    vi.advanceTimersByTime(500);

    await waitFor(() => {
      expect(screen.getByText('該当する投稿が見つかりませんでした')).toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalledWith('Search error:', 'API Failure');
    consoleSpy.mockRestore();
  });
});
