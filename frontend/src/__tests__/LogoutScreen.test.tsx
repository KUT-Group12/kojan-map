import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LogoutScreen } from '../components/LogoutScreen';
import { toast } from 'sonner';

// fetchのモック
if (typeof window.fetch === 'undefined') {
  window.fetch = jest.fn();
}
const fetchMock = window.fetch as jest.Mock;

// toastのモック
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('LogoutScreen コンポーネント', () => {
  const mockUser = {
    googleId: 'user-999',
    fromName: '高知 太郎',
    gmail: 'taro@example.com',
    role: 'general',
  };
  const mockOnLogout = jest.fn();
  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.mockReset();
  });

  test('ユーザー情報が正しく表示されていること', () => {
    render(<LogoutScreen user={mockUser as any} onLogout={mockOnLogout} onBack={mockOnBack} />);

    expect(screen.getByText('高知 太郎様')).toBeInTheDocument();
    expect(screen.getByText('taro@example.com')).toBeInTheDocument();
    expect(screen.getByText('一般会員')).toBeInTheDocument();
  });

  test('ログアウト実行時に正しいAPI(PUT)が呼ばれ、onLogoutが実行されること', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as Response);

    render(<LogoutScreen user={mockUser as any} onLogout={mockOnLogout} onBack={mockOnBack} />);

    const logoutButton = screen.getByRole('button', { name: 'ログアウトする' });
    fireEvent.click(logoutButton);

    // ローディング状態の確認
    expect(logoutButton).toBeDisabled();
    expect(screen.getByText('ログアウト中...')).toBeInTheDocument();

    await waitFor(() => {
      // APIリクエストの検証
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/auth/logout',
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: 'user-999' }),
        })
      );
    });

    expect(toast.success).toHaveBeenCalledWith('ログアウトしました');
    expect(mockOnLogout).toHaveBeenCalled();
  });

  test('APIがエラーを返しても、ユーザーの利便性のために onLogout が呼ばれること', async () => {
    // APIがエラー（500等）を返す設定
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    render(<LogoutScreen user={mockUser as any} onLogout={mockOnLogout} onBack={mockOnBack} />);

    fireEvent.click(screen.getByRole('button', { name: 'ログアウトする' }));

    await waitFor(() => {
      // 失敗しても最終的に onLogout が呼ばれる仕様を検証
      expect(mockOnLogout).toHaveBeenCalled();
    });
  });

  test('ビジネスユーザーの場合、ビジネス会員と表示され専用の注意事項が出ること', () => {
    const businessUser = { ...mockUser, role: 'business' };
    render(<LogoutScreen user={businessUser as any} onLogout={mockOnLogout} onBack={mockOnBack} />);

    expect(screen.getByText('ビジネス会員')).toBeInTheDocument();
    expect(screen.getByText('事業者情報とアイコン')).toBeInTheDocument();
  });

  test('戻るボタンをクリックすると onBack が呼ばれること', () => {
    render(<LogoutScreen user={mockUser as any} onLogout={mockOnLogout} onBack={mockOnBack} />);

    fireEvent.click(screen.getByRole('button', { name: /戻る/ }));
    expect(mockOnBack).toHaveBeenCalled();
  });
});
