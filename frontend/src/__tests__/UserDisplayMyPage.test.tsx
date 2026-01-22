import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserDisplayMyPage } from '../components/UserDisplayMyPage';
import { User, Post } from '../types';

// 子コンポーネントのモック
vi.mock('../components/SelectPostHistory', () => ({
  SelectPostHistory: () => <div data-testid="post-history">投稿履歴コンポーネント</div>,
}));
vi.mock('../components/UserReactionViewScreen', () => ({
  UserReactionViewScreen: () => <div data-testid="reaction-view">リアクションコンポーネント</div>,
}));
vi.mock('../components/SelectUserSetting', () => ({
  SelectUserSetting: () => <div data-testid="user-setting">設定コンポーネント</div>,
}));
vi.mock('../components/UserInputBusinessApplication', () => ({
  UserInputBusinessApplication: ({ onCancel }: any) => (
    <div data-testid="business-form">
      事業者申請フォーム
      <button onClick={onCancel}>キャンセル</button>
    </div>
  ),
}));

describe('UserDisplayMyPage', () => {
  const mockUser: User = {
    googleId: 'test-user-id',
    gmail: 'test@gmail.com',
    role: 'general',
    registrationDate: '2024-01-01T00:00:00Z',
    fromName: 'テストユーザー',
  };

  const mockPosts: Post[] = [{ postId: 1, title: '投稿1' } as Post];

  const mockReactedPosts: Post[] = [{ postId: 2, title: 'リアクション1' } as Post];

  const defaultProps = {
    user: mockUser,
    posts: mockPosts,
    reactedPosts: mockReactedPosts,
    onPinClick: vi.fn(),
    onUpdateUser: vi.fn(),
    onNavigateToDeleteAccount: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ユーザーの基本情報が正しく表示されていること', () => {
    render(<UserDisplayMyPage {...defaultProps} />);

    expect(screen.getByText(mockUser.gmail)).toBeInTheDocument();
    // 2024-01-01 が「2024年1月1日」として表示されるか
    expect(screen.getByText(/2024年1月1日/)).toBeInTheDocument();
    expect(screen.getByText('一般')).toBeInTheDocument();
  });

  it('事業者登録申請ボタンを押すとフォームが表示され、キャンセルで戻ること', () => {
    render(<UserDisplayMyPage {...defaultProps} />);

    const applyButton = screen.getByRole('button', { name: /事業者登録を申請/ });

    // フォーム表示
    fireEvent.click(applyButton);
    expect(screen.getByTestId('business-form')).toBeInTheDocument();
    expect(applyButton).not.toBeInTheDocument();

    // キャンセル
    fireEvent.click(screen.getByRole('button', { name: 'キャンセル' }));
    expect(screen.queryByTestId('business-form')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /事業者登録を申請/ })).toBeInTheDocument();
  });

  it('タブに投稿数とリアクション数が正しく反映されていること', () => {
    render(<UserDisplayMyPage {...defaultProps} />);

    expect(screen.getByRole('tab', { name: `投稿履歴 (${mockPosts.length})` })).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: `リアクション (${mockReactedPosts.length})` })
    ).toBeInTheDocument();
  });
});
