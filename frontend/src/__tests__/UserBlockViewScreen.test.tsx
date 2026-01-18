import { render, screen } from '@testing-library/react';
import { UserBlockViewScreen } from '../components/UserBlockViewScreen';
import { User } from '../types';

// 子コンポーネントをモック化
jest.mock('../components/DisplayUserSetting', () => ({
  DisplayUserSetting: ({ title, children }: any) => (
    <div data-testid="setting-container">
      <h3>{title}</h3>
      {children}
    </div>
  ),
}));

jest.mock('../components/SelectUnlock', () => ({
  SelectUnlock: ({ userId }: any) => <button data-testid={`unlock-button-${userId}`}>解除</button>,
}));

describe('UserBlockViewScreen コンポーネント', () => {
  const baseUser: User = {
    id: 'my-id',
    name: '自分',
    email: 'me@example.com',
    role: 'general',
    createdAt: new Date(),
    blockedUsers: [],
  };

  const mockOnUpdateUser = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('ブロックユーザーがいない場合にメッセージが表示されること', () => {
    render(<UserBlockViewScreen user={baseUser} onUpdateUser={mockOnUpdateUser} />);

    expect(screen.getByText('ブロックしたユーザーはいません')).toBeInTheDocument();
  });

  test('ブロックユーザーがいる場合にリストが表示されること', () => {
    const userWithBlocks: User = {
      ...baseUser,
      blockedUsers: ['user-A', 'user-B'],
    };

    render(<UserBlockViewScreen user={userWithBlocks} onUpdateUser={mockOnUpdateUser} />);

    // 各ユーザーIDが表示されているか
    expect(screen.getByText(/ユーザーID: user-A/i)).toBeInTheDocument();
    expect(screen.getByText(/ユーザーID: user-B/i)).toBeInTheDocument();

    // それぞれの解除ボタンがレンダリングされているか
    expect(screen.getByTestId('unlock-button-user-A')).toBeInTheDocument();
    expect(screen.getByTestId('unlock-button-user-B')).toBeInTheDocument();
  });

  test('blockedUsers が undefined の場合でもクラッシュせずメッセージが表示されること', () => {
    const userUndefinedBlocks: User = {
      ...baseUser,
      blockedUsers: undefined,
    };

    render(<UserBlockViewScreen user={userUndefinedBlocks} onUpdateUser={mockOnUpdateUser} />);

    expect(screen.getByText('ブロックしたユーザーはいません')).toBeInTheDocument();
  });
});
