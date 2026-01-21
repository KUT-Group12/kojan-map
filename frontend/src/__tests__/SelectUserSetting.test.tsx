import { render, screen, fireEvent } from '@testing-library/react';
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
    render(
      <SelectUserSetting
        user={mockUser}
        onUpdateUser={mockOnUpdateUser}
        onNavigateToDeleteAccount={mockOnNavigateToDeleteAccount}
      />
    );

    // モックしたコンポーネントが表示されているか確認
    expect(screen.getByTestId('mock-block-view')).toBeInTheDocument();
    expect(screen.getByText('Block View for テストユーザー')).toBeInTheDocument();
  });

  it('退会設定セクションが表示され、警告文が含まれていること', () => {
    render(
      <SelectUserSetting
        user={mockUser}
        onUpdateUser={mockOnUpdateUser}
        onNavigateToDeleteAccount={mockOnNavigateToDeleteAccount}
      />
    );

    expect(screen.getByText('退会')).toBeInTheDocument();
    expect(
      screen.getByText(/アカウントを削除すると、すべての投稿とデータが完全に削除されます/)
    ).toBeInTheDocument();
  });

  it('「アカウント削除画面へ」ボタンをクリックするとナビゲーション関数が呼ばれること', () => {
    render(
      <SelectUserSetting
        user={mockUser}
        onUpdateUser={mockOnUpdateUser}
        onNavigateToDeleteAccount={mockOnNavigateToDeleteAccount}
      />
    );

    const deleteBtn = screen.getByRole('button', { name: /アカウント削除画面へ/ });
    fireEvent.click(deleteBtn);

    // props で渡された関数が実行されたか確認
    expect(mockOnNavigateToDeleteAccount).toHaveBeenCalledTimes(1);
  });
});
