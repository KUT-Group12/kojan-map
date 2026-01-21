import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
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
    // FakeTimers は使わない設定にする（または各テストで制御する）
  });

  it('キーワード入力時にデバウンスを経て正しくAPIが呼ばれること', async () => {
    // 1. fetch のモック（即座に解決するようにする）
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ posts: mockPosts }),
    });
    global.fetch = mockFetch;

    render(
      <Sidebar
        user={mockUser}
        posts={[]}
        onFilterChange={mockOnFilterChange}
        onPinClick={mockOnPinClick}
      />
    );

    const input = screen.getByPlaceholderText('キーワードで検索...');

    // 2. fireEvent で入力（userEvent.type より高速で安定）
    fireEvent.change(input, { target: { value: 'カフェ' } });

    // 3. 500msのデバウンス + 通信時間を待つ
    // waitFor のタイムアウトを少し長めにするか、findBy を使う
    // findBy はデフォルトで 1000ms 待つので、500ms のデバウンスには最適です
    const postTitle = await screen.findByText('投稿1', {}, { timeout: 2000 });

    expect(postTitle).toBeInTheDocument();
    expect(mockFetch).toHaveBeenCalled();
  });
});
