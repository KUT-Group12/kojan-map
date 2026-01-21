import { render, screen, fireEvent, waitFor } from '@testing-library/react';
<<<<<<< HEAD
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
=======
import { UserDisplayMyPage } from '../components/UserDisplayMyPage';
import userEvent from '@testing-library/user-event';

// 子コンポーネントのモック化（依存関係を切り離して単体テストを容易にする）
jest.mock('../components/SelectPostHistory', () => ({
  SelectPostHistory: () => <div data-testid="post-history">投稿履歴コンポーネント</div>,
}));
jest.mock('../components/UserReactionViewScreen', () => ({
  UserReactionViewScreen: () => <div data-testid="reaction-view">リアクションコンポーネント</div>,
}));
jest.mock('../components/SelectUserSetting', () => ({
  SelectUserSetting: () => <div data-testid="user-setting">設定コンポーネント</div>,
}));
jest.mock('../components/UserInputBusinessApplication', () => ({
  UserInputBusinessApplication: ({ onCancel }: any) => (
>>>>>>> main
    <div data-testid="business-app">
      事業者申請フォーム
      <button onClick={onCancel}>キャンセル</button>
    </div>
  ),
}));

<<<<<<< HEAD
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
=======
describe('UserDisplayMyPage コンポーネント', () => {
  const mockUser = {
    googleId: 'user-123',
    gmail: 'test@example.com',
    registrationDate: '2024-01-01T00:00:00Z',
    role: 'general',
  };

  const mockProps = {
    user: mockUser as any,
    posts: [{}, {}] as any, // 2件
    reactedPosts: [{}] as any, // 1件
    onPinClick: jest.fn(),
    onUpdateUser: jest.fn(),
    onNavigateToDeleteAccount: jest.fn(),
  };

  test('ユーザー情報が正しく表示されること', () => {
    render(<UserDisplayMyPage {...mockProps} />);

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('2024年1月1日')).toBeInTheDocument();
    expect(screen.getByText('一般')).toBeInTheDocument();
  });

  test('タブを切り替えると表示されるコンポーネントが変わること', async () => {
    const user = userEvent.setup(); // ユーザー操作のセットアップ
    render(<UserDisplayMyPage {...mockProps} />);

    // 初期表示の確認
    expect(screen.getByTestId('post-history')).toBeInTheDocument();

    // 1. リアクションタブをクリック (user.click を使用)
    const reactionTab = screen.getByRole('tab', { name: /リアクション/ });
    await user.click(reactionTab);

    // DOMの更新を待つ
    await waitFor(
      () => {
        expect(screen.getByTestId('reaction-view')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    // 2. 設定タブをクリック
    const settingsTab = screen.getByRole('tab', { name: /設定/ });
    await user.click(settingsTab);

    await waitFor(() => {
      expect(screen.getByTestId('user-setting')).toBeInTheDocument();
    });
  });

  test('事業者登録申請ボタンを押すとフォームが表示され、キャンセルで戻ること', () => {
    render(<UserDisplayMyPage {...mockProps} />);

    const regButton = screen.getByRole('button', { name: /事業者登録を申請/ });
    fireEvent.click(regButton);

    // フォームが表示される
    expect(screen.getByTestId('business-app')).toBeInTheDocument();
    expect(regButton).not.toBeInTheDocument();

    // キャンセルボタン（モック内）をクリック
    fireEvent.click(screen.getByText('キャンセル'));

    // 元のボタンが表示される
    expect(screen.getByRole('button', { name: /事業者登録を申請/ })).toBeInTheDocument();
  });

  test('タブのラベルに件数が正しく反映されていること', () => {
    render(<UserDisplayMyPage {...mockProps} />);

    expect(screen.getByText(/投稿履歴 \(2\)/)).toBeInTheDocument();
    expect(screen.getByText(/リアクション \(1\)/)).toBeInTheDocument();
>>>>>>> main
  });
});
