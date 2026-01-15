import { render, screen, fireEvent } from '@testing-library/react';
import { LogoutScreen } from '../components/LogoutScreen'; // パスは適宜調整してください
import { MOCK_BUSINESS_USER, MOCK_GENERAL_USER } from '../lib/mockData';

describe('LogoutScreen コンポーネント', () => {
  const mockOnLogout = jest.fn();
  const mockOnBack = jest.fn();

  const businessUser = {
    ...MOCK_BUSINESS_USER,
    email: 'business@example.com',
  };

  const generalUser = {
    ...MOCK_GENERAL_USER,
    email: 'general@example.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('ビジネス会員の情報と注意事項が正しく表示されること', () => {
    render(
      <LogoutScreen 
        user={businessUser} 
        onLogout={mockOnLogout} 
        onBack={mockOnBack} 
      />
    );

    // メールアドレスと会員区分の表示確認
    expect(screen.getByText('business@example.com')).toBeInTheDocument();
    expect(screen.getByText('ビジネス会員')).toBeInTheDocument();

    // ビジネス会員専用の保持データ案内が表示されているか
    expect(screen.getByText('事業者情報とアイコン')).toBeInTheDocument();
  });

  test('一般会員の場合、事業者向けの案内が表示されないこと', () => {
    render(
      <LogoutScreen 
        user={generalUser} 
        onLogout={mockOnLogout} 
        onBack={mockOnBack} 
      />
    );

    expect(screen.getByText('一般会員')).toBeInTheDocument();
    expect(screen.getByText('general@example.com')).toBeInTheDocument();

    // ビジネス会員専用の案内が「存在しない」ことを確認
    expect(screen.queryByText('事業者情報とアイコン')).not.toBeInTheDocument();
  });

  test('ログアウトボタンをクリックすると onLogout コールバックが呼ばれること', () => {
    render(
      <LogoutScreen 
        user={generalUser} 
        onLogout={mockOnLogout} 
        onBack={mockOnBack} 
      />
    );

    const logoutButton = screen.getByRole('button', { name: /ログアウトする/i });
    fireEvent.click(logoutButton);

    expect(mockOnLogout).toHaveBeenCalledTimes(1);
  });

  test('共通の保持データ案内が表示されていること', () => {
    render(
      <LogoutScreen 
        user={generalUser} 
        onLogout={mockOnLogout} 
        onBack={mockOnBack} 
      />
    );

    expect(screen.getByText('すべての投稿とピン情報')).toBeInTheDocument();
    expect(screen.getByText('リアクション履歴')).toBeInTheDocument();
  });
});