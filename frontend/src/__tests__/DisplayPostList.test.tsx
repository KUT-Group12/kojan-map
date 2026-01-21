import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DisplayPostList } from '../components/DisplayPostList';
import { User, Post, Place } from '../types';

// fetchのグローバルモック
vi.stubGlobal('fetch', vi.fn());

describe('DisplayPostList', () => {
  const mockUser: User = {
    googleId: 'my-google-id',
    gmail: 'test@gmail.com',
    role: 'user',
    registrationDate: new Date().toISOString(),
    fromName: '自分自身の名前',
  };

  const mockPlace: Place = {
    placeId: 1,
    latitude: 35.681236,
    longitude: 139.767125,
    isBusiness: false,
  };

  const mockPost: Post = {
    postId: 100,
    title: 'テスト投稿タイトル',
    text: 'これはテストの本文です。',
    genreId: 1,
    genreName: 'グルメ',
    genreColor: '#FF0000',
    userId: 'other-user-id', // デフォルトは他人の投稿
    postDate: new Date().toISOString(),
    numReaction: 5,
    numView: 10,
    placeId: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // API詳細取得のレスポンスをデフォルトで設定
    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ post: mockPost }),
    });
  });

  it('自分の投稿の場合、削除コンポーネントが表示され、通報ボタンが表示されないこと', async () => {
    // 自分の投稿にするために userId を一致させる
    const myPost = { ...mockPost, userId: mockUser.googleId };

    render(
      <DisplayPostList
        post={myPost}
        place={mockPlace}
        currentUser={mockUser}
        isReacted={false}
        onClose={vi.fn()}
        onReaction={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    // 1. 自分の投稿なので「通報」ボタンは存在しないことを確認
    expect(screen.queryByText('通報')).not.toBeInTheDocument();

    // 2. 削除用コンポーネント（SelectPostDeletion）が表示されていることを確認
    // コンポーネント内でゴミ箱アイコンや特定のテキストがあるか、
    // または data-testid などで判定します。
    // ここでは SelectPostDeletion がレンダリングするであろう要素を探します。
    const deleteTrigger =
      screen.queryByRole('button', { name: /削除/i }) || document.querySelector('.lucide-trash2');
    expect(deleteTrigger).toBeInTheDocument();
  });

  it('他人の投稿の場合、通報ボタンが表示され、削除ボタンが表示されないこと', async () => {
    // 他人の投稿 (userId が異なる)
    const othersPost = { ...mockPost, userId: 'someone-else' };

    render(
      <DisplayPostList
        post={othersPost}
        place={mockPlace}
        currentUser={mockUser}
        isReacted={false}
        onClose={vi.fn()}
        onReaction={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    // 1. 他人の投稿なので「通報」ボタンが表示されていることを確認
    expect(screen.getByText('通報')).toBeInTheDocument();

    // 2. 削除ボタンは表示されないことを確認
    const deleteTrigger =
      screen.queryByRole('button', { name: /削除/i }) || document.querySelector('.lucide-trash2');
    expect(deleteTrigger).not.toBeInTheDocument();
  });

  it('通報ボタンをクリックすると、通報画面(ReportScreen)が表示されること', async () => {
    const othersPost = { ...mockPost, userId: 'someone-else' };

    render(
      <DisplayPostList
        post={othersPost}
        place={mockPlace}
        currentUser={mockUser}
        isReacted={false}
        onClose={vi.fn()}
        onReaction={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    // 1. 最初にある「通報」という名前のボタンを取得してクリック
    const reportButton = screen.getByRole('button', { name: '通報' });
    fireEvent.click(reportButton);

    // 2. クリック後、ReportScreenに含まれる特有のテキストが表示されたか確認
    // 「通報理由：」というテキストを正規表現で厳密に指定するか、getAllByTextで要素数をチェックします
    // ここではエラーログに出ていた「通報理由：」をターゲットにします
    expect(screen.getByText(/通報理由：/)).toBeInTheDocument();
  });
});
