import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UserDisplayMyPage } from '../components/UserDisplayMyPage';

// 子コンポーネントのモック化
vi.mock('../components/SelectPostHistory', () => ({
  SelectPostHistory: () => <div data-testid="post-history">投稿履歴一覧</div>,
}));
vi.mock('../components/UserReactionViewScreen', () => ({
  UserReactionViewScreen: () => <div data-testid="reaction-view">リアクション一覧</div>,
}));
vi.mock('../components/SelectUserSetting', () => ({
  SelectUserSetting: () => <div data-testid="user-setting">設定画面</div>,
}));
vi.mock('../components/UserInputBusinessApplication', () => ({
  UserInputBusinessApplication: ({ onCancel }: { onCancel: () => void }) => (
    <div data-testid="business-app">
      事業者申請フォーム
      <button onClick={onCancel}>キャンセル</button>
    </div>
  ),
}));

describe('UserDisplayMyPage', () => {
  const mockUser = {
    id: 'u-123',
    email: 'test@example.com',
    createdAt: '2024-01-01T00:00:00Z',
    role: 'user',
  } as any;

  const defaultProps = {
    user: mockUser,
    posts: [{}, {}] as any,
    reactedPosts: [{}, {}, {}] as any,
    onPinClick: vi.fn(),
    onUpdateUser: vi.fn(),
    onNavigateToDeleteAccount: vi.fn(),
  };

  it('基本情報（メールアドレス、登録日）が正しく表示されること', () => {
    render(<UserDisplayMyPage {...defaultProps} />);

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    // 2024年1月1日が日本語形式で表示されているか
    expect(screen.getByText(/2024年1月1日/)).toBeInTheDocument();
  });

  it('「事業者登録を申請」ボタンを押すと申請フォームが表示されること', async () => {
    render(<UserDisplayMyPage {...defaultProps} />);

    const applyButton = screen.getByRole('button', { name: /事業者登録を申請/ });
    fireEvent.click(applyButton);

    // フォームが表示されることを確認
    expect(screen.getByTestId('business-app')).toBeInTheDocument();

    // キャンセルボタンで戻ることを確認
    const cancelButton = screen.getByRole('button', { name: /キャンセル/ });
    fireEvent.click(cancelButton);

    expect(screen.queryByTestId('business-app')).not.toBeInTheDocument();
  });
});
