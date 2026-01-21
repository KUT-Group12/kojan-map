import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminUserManagement, { AdminUser } from '../components/AdminUserManagement';

describe('AdminUserManagement', () => {
  const mockUsers: AdminUser[] = [
    {
      googleId: 'user-1',
      fromName: '一般ユーザー',
      gmail: 'user1@example.com',
      role: 'general',
      registrationDate: '2024-01-01',
      postCount: 5,
    },
    {
      googleId: 'user-2',
      fromName: 'ビジネスユーザー',
      gmail: 'user2@example.com',
      role: 'business',
      registrationDate: '2024-01-02',
      postCount: 10,
    },
    {
      googleId: 'user-3',
      fromName: '管理者ユーザー',
      gmail: 'user3@example.com',
      role: 'admin',
      registrationDate: '2024-01-03',
      postCount: 0,
    },
  ];

  const mockOnDeleteAccount = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // window.confirm のモック化（デフォルトで true を返す）
    vi.stubGlobal(
      'confirm',
      vi.fn(() => true)
    );
  });

  it('ユーザー一覧が正しくレンダリングされること', () => {
    render(<AdminUserManagement users={mockUsers} onDeleteAccount={mockOnDeleteAccount} />);

    // 各ユーザーの名前が表示されているか
    expect(screen.getByText('一般ユーザー')).toBeInTheDocument();
    expect(screen.getByText('ビジネスユーザー')).toBeInTheDocument();
    expect(screen.getByText('管理者ユーザー')).toBeInTheDocument();

    // ロールバッジの確認
    expect(screen.getByText('一般')).toBeInTheDocument();
    expect(screen.getByText('事業者')).toBeInTheDocument();
    expect(screen.getByText('管理者')).toBeInTheDocument();

    // 投稿数の確認
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('削除ボタンをクリックした際、確認ダイアログでOKを押すと onDeleteAccount が呼ばれること', () => {
    render(<AdminUserManagement users={mockUsers} onDeleteAccount={mockOnDeleteAccount} />);

    // 2番目のユーザー（ビジネスユーザー）の削除ボタンをクリック
    const deleteButtons = screen.getAllByRole('button', { name: /削除/ });
    fireEvent.click(deleteButtons[1]);

    // 確認ダイアログが表示されたか
    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('ビジネスユーザー'));

    // 削除関数が正しいIDで呼ばれたか
    expect(mockOnDeleteAccount).toHaveBeenCalledWith('user-2');
  });

  it('確認ダイアログでキャンセルを押すと onDeleteAccount が呼ばれないこと', () => {
    // confirm が false を返すように設定
    vi.mocked(window.confirm).mockReturnValue(false);

    render(<AdminUserManagement users={mockUsers} onDeleteAccount={mockOnDeleteAccount} />);

    const deleteButtons = screen.getAllByRole('button', { name: /削除/ });
    fireEvent.click(deleteButtons[0]);

    expect(mockOnDeleteAccount).not.toHaveBeenCalled();
  });

  it('ユーザーが0人の場合、空のメッセージが表示されること', () => {
    render(<AdminUserManagement users={[]} onDeleteAccount={mockOnDeleteAccount} />);
    expect(screen.getByText('該当するユーザーが見つかりません。')).toBeInTheDocument();
  });
});
