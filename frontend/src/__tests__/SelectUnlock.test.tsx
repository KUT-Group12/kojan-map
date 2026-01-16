import { render, screen, fireEvent } from '@testing-library/react';
import { SelectUnlock } from '../components/SelectUnlock';
import { User } from '../types';

describe('SelectUnlock コンポーネント', () => {
  // User 型のすべての必須プロパティを満たすように定義
  const mockUser: User = {
    id: 'user-master-id', // 追加
    name: 'テストユーザー',
    email: 'test@example.com',
    role: 'general',
    blockedUsers: ['user-123', 'user-456'],
    createdAt: new Date(), // 追加
  };

  const mockOnUpdateUser = jest.fn();
  const targetUserId = 'user-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('「ブロック解除」ボタンが正しくレンダリングされていること', () => {
    render(<SelectUnlock userId={targetUserId} user={mockUser} onUpdateUser={mockOnUpdateUser} />);

    expect(screen.getByRole('button', { name: /ブロック解除/i })).toBeInTheDocument();
  });

  test('クリックすると、対象のIDが除外された状態で onUpdateUser が呼ばれること', () => {
    render(<SelectUnlock userId={targetUserId} user={mockUser} onUpdateUser={mockOnUpdateUser} />);

    const button = screen.getByRole('button', { name: /ブロック解除/i });
    fireEvent.click(button);

    // ロジックの検証: 'user-123' が消えて 'user-456' だけ残っているか
    expect(mockOnUpdateUser).toHaveBeenCalledWith({
      ...mockUser,
      blockedUsers: ['user-456'],
    });
  });

  test('blockedUsers が未定義 (undefined) の場合でもエラーにならず動作すること', () => {
    const userWithoutBlocked: User = {
      ...mockUser,
      blockedUsers: undefined,
    };

    render(
      <SelectUnlock
        userId={targetUserId}
        user={userWithoutBlocked}
        onUpdateUser={mockOnUpdateUser}
      />
    );

    const button = screen.getByRole('button', { name: /ブロック解除/i });
    fireEvent.click(button);

    // 空配列からフィルタリングされるので、結果も空配列になる
    expect(mockOnUpdateUser).toHaveBeenCalledWith({
      ...userWithoutBlocked,
      blockedUsers: [],
    });
  });
});
