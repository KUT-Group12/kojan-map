import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from 'sonner';

// sonnerのモック
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
  },
}));

describe('LogoutScreen', () => {
  const mockUser = {
    id: 'google-12345',
    name: 'テスト太郎',
    email: 'test@example.com',
    role: 'user',
  } as any;

  const mockOnLogout = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv('VITE_API_URL', 'http://test-api.com');
    global.fetch = vi.fn();
  });

  const renderComponent = async () => {
    const { LogoutScreen } = await import('../components/LogoutScreen');
    return render(<LogoutScreen user={mockUser} onLogout={mockOnLogout} onBack={mockOnBack} />);
  };

  it('ユーザー情報と会員区分（一般会員）が正しく表示されること', async () => {
    await renderComponent();

    expect(screen.getByText('テスト太郎様')).toBeInTheDocument();
    expect(screen.getByText('一般会員')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('ビジネス会員の場合、表示が「ビジネス会員」に切り替わり、追加の注意事項が出ること', async () => {
    const businessUser = { ...mockUser, role: 'business' };
    const { LogoutScreen } = await import('../components/LogoutScreen');
    render(<LogoutScreen user={businessUser} onLogout={mockOnLogout} onBack={mockOnBack} />);

    expect(screen.getByText('ビジネス会員')).toBeInTheDocument();
    expect(screen.getByText('事業者情報とアイコン')).toBeInTheDocument();
  });

  it('ログアウトボタンをクリックするとAPIが呼ばれ、成功時にログアウト処理が実行されること', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'success' }),
    });

    await renderComponent();

    const logoutButton = screen.getByRole('button', { name: 'ログアウトする' });
    fireEvent.click(logoutButton);

    // 送信中の状態確認
    expect(screen.getByText('ログアウト中...')).toBeInTheDocument();

    await waitFor(() => {
      // API呼び出しの確認（sessionIdにuser.idが含まれているか）
      expect(global.fetch).toHaveBeenCalledWith(
        'http://test-api.com/api/auth/logout',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ sessionId: 'google-12345' }),
        })
      );
      expect(toast.success).toHaveBeenCalledWith('ログアウトしました');
      expect(mockOnLogout).toHaveBeenCalled();
    });
  });

  it('APIエラー（通信失敗）が起きても、強制的にフロント側はログアウト処理を実行すること', async () => {
    // 500エラーなどをシミュレート
    (global.fetch as any).mockRejectedValueOnce(new Error('Network Error'));

    await renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'ログアウトする' }));

    await waitFor(() => {
      // 通信が失敗しても、catchブロック内の onLogout() が呼ばれるはず
      expect(mockOnLogout).toHaveBeenCalled();
    });
  });

  it('戻るボタンをクリックすると onBack が呼ばれること', async () => {
    await renderComponent();

    const backButton = screen.getByRole('button', { name: /戻る/ });
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });
});
