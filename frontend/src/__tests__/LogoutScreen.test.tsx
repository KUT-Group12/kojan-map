import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LogoutScreen } from '../components/LogoutScreen';
import { User } from '../types';
import { toast } from 'sonner';

// fetch のグローバルモック
vi.stubEnv('VITE_API_URL', 'http://localhost:8080');

// toast のモック
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('LogoutScreen', () => {
  const mockUser: User = {
    googleId: 'test-google-id',
    gmail: 'test@gmail.com',
    role: 'general',
    registrationDate: new Date().toISOString(),
    fromName: 'テスト太郎',
  };

  const mockOnLogout = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const getFetchMock = () => globalThis.fetch as any;

  it('ユーザー名とメールアドレスが正しく表示されていること', () => {
    render(<LogoutScreen user={mockUser} onLogout={mockOnLogout} onBack={mockOnBack} />);

    expect(screen.getByText(/テスト太郎様/)).toBeInTheDocument();
    expect(screen.getByText(mockUser.gmail)).toBeInTheDocument();
  });

  it('ログアウトボタンをクリックするとAPIが呼ばれ、成功時に onLogout が実行されること', async () => {
    getFetchMock().mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'logged out' }),
    });

    render(<LogoutScreen user={mockUser} onLogout={mockOnLogout} onBack={mockOnBack} />);

    const logoutButton = screen.getByRole('button', { name: 'ログアウトする' });
    fireEvent.click(logoutButton);

    // ローディング表示の確認
    expect(screen.getByText('ログアウト中...')).toBeInTheDocument();
    expect(logoutButton).toBeDisabled();

    await waitFor(() => {
      // API呼び出しの検証
      expect(getFetchMock()).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/logout'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ sessionId: mockUser.googleId }),
        })
      );
      expect(toast.success).toHaveBeenCalledWith('ログアウトしました');
      expect(mockOnLogout).toHaveBeenCalled();
    });
  });

  it('APIエラーが発生しても、最終的に onLogout が実行されること', async () => {
    // サーバーエラーをシミュレート
    getFetchMock().mockResolvedValue({ ok: false });

    render(<LogoutScreen user={mockUser} onLogout={mockOnLogout} onBack={mockOnBack} />);

    const logoutButton = screen.getByRole('button', { name: 'ログアウトする' });
    fireEvent.click(logoutButton);

    await waitFor(() => {
      // エラー時もフロント側はログアウトさせる仕様の確認
      expect(mockOnLogout).toHaveBeenCalled();
    });
  });

  it('戻るボタンをクリックすると onBack が呼ばれること', () => {
    render(<LogoutScreen user={mockUser} onLogout={mockOnLogout} onBack={mockOnBack} />);

    const backButton = screen.getByRole('button', { name: /戻る/ });
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });

  it('ビジネス会員の場合、特有の注意事項が表示されること', () => {
    const businessUser: User = { ...mockUser, role: 'business' };
    render(<LogoutScreen user={businessUser} onLogout={mockOnLogout} onBack={mockOnBack} />);

    expect(screen.getByText('ビジネス会員')).toBeInTheDocument();
    expect(screen.getByText('事業者情報とアイコン')).toBeInTheDocument();
  });
});
