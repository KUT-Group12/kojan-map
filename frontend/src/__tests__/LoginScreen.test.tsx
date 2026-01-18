import { render, screen, fireEvent } from '@testing-library/react';
import { LogoutScreen } from '../components/LogoutScreen'; // パスは適宜調整してください

describe('LogoutScreen コンポーネント', () => {
  const mockOnLogout = jest.fn();
  const mockOnBack = jest.fn();

  const businessUser = {
    name: '田中 太郎',
    email: 'business@example.com',
    role: 'business' as const,
  };

  const generalUser = {
    name: '佐藤 次郎',
    email: 'general@example.com',
    role: 'general' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('ユーザー情報とロールが正しく表示されること（ビジネス会員）', () => {
    render(<LogoutScreen user={businessUser} onLogout={mockOnLogout} onBack={mockOnBack} />);

    expect(screen.getByText('田中 太郎 様')).toBeInTheDocument();
    expect(screen.getByText('ビジネス会員')).toBeInTheDocument();
    expect(screen.getByText('business@example.com')).toBeInTheDocument();
    // ビジネス会員専用の表示確認
    expect(screen.getByText('事業者情報とアイコン')).toBeInTheDocument();
  });

  test('一般会員の場合、事業者情報の案内が表示されないこと', () => {
    render(<LogoutScreen user={generalUser} onLogout={mockOnLogout} onBack={mockOnBack} />);

    expect(screen.getByText('一般会員')).toBeInTheDocument();
    expect(screen.queryByText('事業者情報とアイコン')).not.toBeInTheDocument();
  });

  test('ログアウトボタンをクリックすると onLogout が呼ばれること', () => {
    render(<LogoutScreen user={generalUser} onLogout={mockOnLogout} onBack={mockOnBack} />);

    const logoutButton = screen.getByRole('button', { name: /ログアウトする/i });
    fireEvent.click(logoutButton);

    expect(mockOnLogout).toHaveBeenCalledTimes(1);
  });

  test('戻るボタンをクリックすると onBack が呼ばれること', () => {
    render(<LogoutScreen user={generalUser} onLogout={mockOnLogout} onBack={mockOnBack} />);

    const backButton = screen.getByRole('button', { name: /戻る/i });
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });
});
