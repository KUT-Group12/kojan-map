import { render, screen, fireEvent } from '@testing-library/react';
import { SelectUserSetting } from '../components/SelectUserSetting';
import { User } from '../types';

// 子コンポーネントをモック化
jest.mock('../components/UserBlockViewScreen', () => ({
  UserBlockViewScreen: ({ user }: any) => (
    <div data-testid="user-block-view">ブロックユーザー数: {user.blockedUsers?.length || 0}</div>
  ),
}));

jest.mock('../components/DisplayUserSetting', () => ({
  DisplayUserSetting: ({ title, children }: any) => (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  ),
}));

describe('SelectUserSetting コンポーネント', () => {
  const mockUser: User = {
    id: 'user-1',
    name: '田中 太郎',
    email: 'tanaka@example.com',
    role: 'general',
    blockedUsers: ['blocked-1', 'blocked-2'],
    createdAt: new Date(),
  };

  const mockOnUpdateUser = jest.fn();
  const mockOnNavigateToDeleteAccount = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('ブロック設定画面（子コンポーネント）が表示され、Propsが渡されていること', () => {
    render(
      <SelectUserSetting
        user={mockUser}
        onUpdateUser={mockOnUpdateUser}
        onNavigateToDeleteAccount={mockOnNavigateToDeleteAccount}
      />
    );

    // モック化したコンポーネントが表示されているか
    expect(screen.getByTestId('user-block-view')).toBeInTheDocument();
    // ユーザー情報が正しく渡されているか確認（ブロック数などで判定）
    expect(screen.getByText('ブロックユーザー数: 2')).toBeInTheDocument();
  });

  test('退会設定セクションが表示されていること', () => {
    render(
      <SelectUserSetting
        user={mockUser}
        onUpdateUser={mockOnUpdateUser}
        onNavigateToDeleteAccount={mockOnNavigateToDeleteAccount}
      />
    );

    expect(screen.getByText('退会')).toBeInTheDocument();
    expect(screen.getByText(/アカウントを削除すると/i)).toBeInTheDocument();
  });

  test('「アカウント削除画面へ」ボタンをクリックすると、遷移関数が呼ばれること', () => {
    render(
      <SelectUserSetting
        user={mockUser}
        onUpdateUser={mockOnUpdateUser}
        onNavigateToDeleteAccount={mockOnNavigateToDeleteAccount}
      />
    );

    const deleteNavButton = screen.getByRole('button', { name: /アカウント削除画面へ/i });
    fireEvent.click(deleteNavButton);

    expect(mockOnNavigateToDeleteAccount).toHaveBeenCalledTimes(1);
  });
});
