// src/__tests__/AdminUserManagement.test.tsx
import { render, screen, fireEvent, within } from '@testing-library/react';
import AdminUserManagement, { AdminUser } from '../components/AdminUserManagement';

describe('AdminUserManagement', () => {
  const mockDeleteAccount = jest.fn();

  const users: AdminUser[] = [
    {
      googleId: 'user1',
      fromName: '山田 太郎',
      gmail: 'taro@example.com',
      role: 'general',
      registrationDate: '2026-01-01',
      postCount: 5,
    },
    {
      googleId: 'user2',
      fromName: '事業者A',
      gmail: 'bizA@example.com',
      role: 'business',
      registrationDate: '2026-01-02',
      postCount: 10,
    },
    {
      googleId: 'admin1',
      fromName: '管理者B',
      gmail: 'adminB@example.com',
      role: 'admin',
      registrationDate: '2026-01-03',
      postCount: 0,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ユーザー一覧が表示される', () => {
    render(<AdminUserManagement users={users} onDeleteAccount={mockDeleteAccount} />);

    // 山田 太郎 (一般) の確認
    const user1Card = screen
      .getByText('山田 太郎')
      .closest('.border-slate-200.rounded-lg') as HTMLElement;
    if (!user1Card) throw new Error('User1 card not found');

    const { getByText: getByText1 } = within(user1Card);
    expect(getByText1('一般')).toBeInTheDocument();
    expect(getByText1(/投稿数:/)).toBeInTheDocument();
    expect(getByText1('5')).toBeInTheDocument();
    expect(getByText1(/登録日: 2026-01-01/)).toBeInTheDocument();

    // 事業者A の確認
    const user2Card = screen
      .getByText('事業者A')
      .closest('.border-slate-200.rounded-lg') as HTMLElement;
    if (!user2Card) throw new Error('User2 card not found');
    const { getByText: getByText2 } = within(user2Card);
    expect(getByText2('事業者')).toBeInTheDocument();
    expect(getByText2('10')).toBeInTheDocument();

    // 管理者B の確認
    const user3Card = screen
      .getByText('管理者B')
      .closest('.border-slate-200.rounded-lg') as HTMLElement;
    if (!user3Card) throw new Error('User3 card not found');
    const { getByText: getByText3 } = within(user3Card);
    expect(getByText3('管理者')).toBeInTheDocument();
    expect(getByText3('0')).toBeInTheDocument();
  });

  it('削除ボタンをクリックすると confirm が表示され OK なら onDeleteAccount が呼ばれる', () => {
    render(<AdminUserManagement users={users} onDeleteAccount={mockDeleteAccount} />);

    // window.confirm をモック
    const confirmSpy = jest.spyOn(window, 'confirm').mockImplementation(() => true);

    const deleteButtons = screen.getAllByText('削除');
    fireEvent.click(deleteButtons[0]);

    expect(confirmSpy).toHaveBeenCalledWith(
      '山田 太郎 さんのアカウントを削除してもよろしいですか？'
    );
    expect(mockDeleteAccount).toHaveBeenCalledWith('user1');

    confirmSpy.mockRestore();
  });

  it('confirm でキャンセルした場合は onDeleteAccount が呼ばれない', () => {
    render(<AdminUserManagement users={users} onDeleteAccount={mockDeleteAccount} />);

    jest.spyOn(window, 'confirm').mockImplementation(() => false);

    const deleteButtons = screen.getAllByText('削除');
    fireEvent.click(deleteButtons[0]);

    expect(mockDeleteAccount).not.toHaveBeenCalled();
  });

  it('ユーザーがいない場合は「該当するユーザーが見つかりません」が表示される', () => {
    render(<AdminUserManagement users={[]} onDeleteAccount={mockDeleteAccount} />);

    expect(screen.getByText('該当するユーザーが見つかりません。')).toBeInTheDocument();
  });
});
