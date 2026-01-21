import { render, screen, fireEvent } from '@testing-library/react';
<<<<<<< HEAD
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SelectUserSetting } from '../components/SelectUserSetting';

// 子コンポーネント UserBlockViewScreen のモック
// SelectUserSetting 自体のテストに集中するため、複雑な子コンポーネントはモック化します
vi.mock('../components/UserBlockViewScreen', () => ({
  UserBlockViewScreen: ({ user }: any) => (
    <div data-testid="mock-block-view">Block View for {user.name}</div>
  ),
}));

describe('SelectUserSetting', () => {
  const mockUser = {
    id: 'user-123',
    name: 'テストユーザー',
    role: 'user',
  } as any;
  const mockOnUpdateUser = vi.fn();
  const mockOnNavigateToDeleteAccount = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ブロックリスト画面（子コンポーネント）が正しくレンダリングされること', () => {
=======
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
>>>>>>> main
    render(
      <SelectUserSetting
        user={mockUser}
        onUpdateUser={mockOnUpdateUser}
        onNavigateToDeleteAccount={mockOnNavigateToDeleteAccount}
      />
    );

<<<<<<< HEAD
    // モックしたコンポーネントが表示されているか確認
    expect(screen.getByTestId('mock-block-view')).toBeInTheDocument();
    expect(screen.getByText('Block View for テストユーザー')).toBeInTheDocument();
  });

  it('退会設定セクションが表示され、警告文が含まれていること', () => {
=======
    // モック化したコンポーネントが表示されているか
    expect(screen.getByTestId('user-block-view')).toBeInTheDocument();
    // ユーザー情報が正しく渡されているか確認（ブロック数などで判定）
    expect(screen.getByText('ブロックユーザー数: 2')).toBeInTheDocument();
  });

  test('退会設定セクションが表示されていること', () => {
>>>>>>> main
    render(
      <SelectUserSetting
        user={mockUser}
        onUpdateUser={mockOnUpdateUser}
        onNavigateToDeleteAccount={mockOnNavigateToDeleteAccount}
      />
    );

    expect(screen.getByText('退会')).toBeInTheDocument();
<<<<<<< HEAD
    expect(
      screen.getByText(/アカウントを削除すると、すべての投稿とデータが完全に削除されます/)
    ).toBeInTheDocument();
  });

  it('「アカウント削除画面へ」ボタンをクリックするとナビゲーション関数が呼ばれること', () => {
=======
    expect(screen.getByText(/アカウントを削除すると/i)).toBeInTheDocument();
  });

  test('「アカウント削除画面へ」ボタンをクリックすると、遷移関数が呼ばれること', () => {
>>>>>>> main
    render(
      <SelectUserSetting
        user={mockUser}
        onUpdateUser={mockOnUpdateUser}
        onNavigateToDeleteAccount={mockOnNavigateToDeleteAccount}
      />
    );

<<<<<<< HEAD
    const deleteBtn = screen.getByRole('button', { name: /アカウント削除画面へ/ });
    fireEvent.click(deleteBtn);

    // props で渡された関数が実行されたか確認
=======
    const deleteNavButton = screen.getByRole('button', { name: /アカウント削除画面へ/i });
    fireEvent.click(deleteNavButton);

>>>>>>> main
    expect(mockOnNavigateToDeleteAccount).toHaveBeenCalledTimes(1);
  });
});
