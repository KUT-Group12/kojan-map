import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Sidebar } from '../components/Sidebar';
import { Post } from '../types';

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
    vi.useFakeTimers(); // タイマーを擬似化
  });

  afterEach(() => {
    vi.useRealTimers(); // 実タイマーに戻す
  });

  it('キーワード入力時にデバウンスを経て正しくAPIが呼ばれること', async () => {
    // FakeTimers環境下では userEvent.setup({ advanceTimers: vi.advanceTimersByTime }) を推奨
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

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

    // 500ms進める。これで useEffect 内の fetchFilteredPosts が発火する
    // await をつけることで、発火した非同期処理（Promise）の完了まで待つ
    await vi.advanceTimersByTimeAsync(500);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('keyword=%E3%82%AB%E3%83%95%E3%82%A7'),
        expect.any(Object)
      );
    });

    expect(screen.getByText('投稿1')).toBeInTheDocument();
  });

  it('APIエラーが発生したとき、リストが空になること', async () => {
    // console.error を一時的に抑制
    vi.spyOn(console, 'error').mockImplementation(() => {});
    (global.fetch as any).mockRejectedValueOnce(new Error('API Failure'));

    render(
      <Sidebar
        user={mockUser}
        posts={mockPosts}
        onFilterChange={mockOnFilterChange}
        onPinClick={mockOnPinClick}
      />
    );

    await vi.advanceTimersByTimeAsync(500);

    await waitFor(() => {
      expect(screen.getByText('該当する投稿が見つかりませんでした')).toBeInTheDocument();
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
  });
});
