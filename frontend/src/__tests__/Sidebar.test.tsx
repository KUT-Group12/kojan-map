import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Sidebar } from '../components/Sidebar';
import { Post, User } from '../types';

describe('Sidebar', () => {
  const mockUser: User = {
    googleId: 'u1',
    role: 'general',
    fromName: 'Test User',
    gmail: 'test@example.com',
    registrationDate: new Date().toISOString(),
  };

  const mockPosts: Post[] = [
    {
      postId: 101,
      title: '検索で見つかる投稿',
      text: '美味しいランチでした',
      genreId: 1,
      genreName: 'グルメ',
      genreColor: '#ff0000',
      postDate: new Date().toISOString(),
      numReaction: 10,
      numView: 50,
      userId: 'user-a',
      placeId: 1,
    },
  ];

  const mockOnFilterChange = vi.fn();
  const mockOnPinClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // タイマーをモックせず、実際の時間経過を利用する
  });

  it('キーワード入力時にデバウンスを経てAPIが呼ばれ、検索結果が表示されること', async () => {
    // APIレスポンスをモック
    global.fetch = vi.fn().mockResolvedValue({
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

    // fireEvent.change で即時入力
    fireEvent.change(input, { target: { value: 'カフェ' } });

    // findByText はデフォルトで 1000ms 待機するため、500ms のデバウンスを吸収できる
    // 念のため timeout を指定して確実に待つ
    const postTitle = await screen.findByText('検索で見つかる投稿', {}, { timeout: 2000 });

    expect(postTitle).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalled();
  });

  it('検索実行中にローディングアイコンが表示されること', async () => {
    // APIが少し遅れて返る状況をシミュレート
    global.fetch = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ posts: mockPosts }),
              }),
            100
          )
        )
    );

    render(
      <Sidebar
        user={mockUser}
        posts={[]}
        onFilterChange={mockOnFilterChange}
        onPinClick={mockOnPinClick}
      />
    );

    const input = screen.getByPlaceholderText('キーワードで検索...');
    fireEvent.change(input, { target: { value: 'a' } });

    // デバウンス時間後、かつ API 完了前のタイミングで Loader2 が出ているか
    await waitFor(
      () => {
        // 500msデバウンス後、フェッチが開始されるとアイコンが出る
        // Loader2 (lucide-react) は animate-spin クラスを持つ
        expect(document.querySelector('.animate-spin')).toBeInTheDocument();
      },
      { timeout: 1500 }
    );
  });

  it('検索結果が空の場合、適切なメッセージが表示されること', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ posts: [] }),
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
    fireEvent.change(input, { target: { value: '該当なし' } });

    // メッセージが出るまで待つ
    const emptyMsg = await screen.findByText(
      '該当する投稿が見つかりませんでした',
      {},
      { timeout: 2000 }
    );
    expect(emptyMsg).toBeInTheDocument();
  });
});
