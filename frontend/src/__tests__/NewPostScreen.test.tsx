import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { User, Genre } from '../types';

// fetch のモック
vi.stubGlobal('fetch', vi.fn());

vi.mock('../lib/auth', () => ({
  getStoredJWT: () => 'mock-token',
}));

// UIコンポーネント（shadcn/ui）の中には jsdom で動きにくいものがあるため必要に応じて調整
// ※ Dialog は radix-ui を使用しているため、Portal 関連のエラーが出る場合はモックが必要な場合があります。

vi.mock('../components/figma/ImageWithFallback', () => ({
  // 注意：名前付きエクスポート(export function)の場合はこのように返します
  ImageWithFallback: (props: any) => (
    <img src={props.src} alt={props.alt} data-testid="preview-img" />
  ),
}));

describe('NewPostScreen', () => {
  const mockUser: User = {
    googleId: 'user-123',
    fromName: '高知 太郎',
    gmail: 'kochi@example.com',
    role: 'general',
    registrationDate: '2024-01-01',
  };

  const mockGenres: Genre[] = [
    { genreId: 1, genreName: 'food', color: '#ff0000' },
    { genreId: 2, genreName: 'scene', color: '#00ff00' },
  ];

  const mockOnClose = vi.fn();
  const mockOnCreate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('フォームの初期項目が正しく表示されること', async () => {
    const { NewPostScreen } = await import('../components/NewPostScreen');
    render(
      <NewPostScreen
        user={mockUser}
        genres={mockGenres}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
        initialLatitude={33.6}
        initialLongitude={133.7}
      />
    );

    expect(screen.getByLabelText(/タイトル/)).toBeInTheDocument();
    expect(screen.getByLabelText(/説明/)).toBeInTheDocument();
    expect(screen.getByDisplayValue('33.6')).toBeInTheDocument();
    expect(screen.getByDisplayValue('133.7')).toBeInTheDocument();
  });

  it('タイトルが未入力の場合、バリデーションで止まること', async () => {
    const { NewPostScreen } = await import('../components/NewPostScreen');
    render(
      <NewPostScreen
        user={mockUser}
        genres={mockGenres}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
      />
    );

    const submitButton = screen.getByRole('button', { name: '投稿する' });
    fireEvent.click(submitButton);

    // fetch が呼ばれていないことを確認
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('正しい入力で投稿ボタンを押すと、APIが呼ばれ onCreate が実行されること', async () => {
    const { NewPostScreen } = await import('../components/NewPostScreen');
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ postId: 999 }),
    });

    render(
      <NewPostScreen
        user={mockUser}
        genres={mockGenres}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
      />
    );

    // 入力操作
    fireEvent.change(screen.getByLabelText(/タイトル/), { target: { value: '美味しいカツオ' } });
    fireEvent.change(screen.getByLabelText(/説明/), {
      target: { value: 'ひろめ市場で食べました' },
    });

    const submitButton = screen.getByRole('button', { name: '投稿する' });
    fireEvent.submit(screen.getByTestId('new-post-form'));

    await waitFor(() => {
      // APIに正しいパラメータが送られたか
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/posts'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"title":"美味しいカツオ"'),
        })
      );
      // 親コンポーネントへの通知が飛んだか
      expect(mockOnCreate).toHaveBeenCalled();
      // モーダルが閉じたか
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('事業者ユーザーの場合、事業者名が表示されること', async () => {
    const { NewPostScreen } = await import('../components/NewPostScreen');
    const businessUser: User = { ...mockUser, role: 'business' };
    const businessData = { businessId: 1, businessName: 'たっすいコーヒー店' };

    render(
      <NewPostScreen
        user={businessUser}
        businessData={businessData as any}
        genres={mockGenres}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
      />
    );

    expect(
      screen.getByText(/事業者名「たっすいコーヒー店」として投稿されます/)
    ).toBeInTheDocument();
  });
});
