import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserDisplayMyPage } from '../components/UserDisplayMyPage';
import { User, Pin } from '../types';
import { toast } from 'sonner';
import { MOCK_GENERAL_USER, mockPins } from '../lib/mockData';

// toast のモック
jest.mock('sonner', () => ({
  toast: { success: jest.fn() },
}));

// 【重要】パスを ../components/... に修正
jest.mock('../components/SelectPostHistory', () => ({
  SelectPostHistory: () => <div data-testid="post-history">投稿履歴セクション</div>,
}));

jest.mock('../components/UserReactionViewScreen', () => ({
  UserReactionViewScreen: () => <div data-testid="reaction-view">リアクションセクション</div>,
}));

jest.mock('../components/SelectUserSetting', () => ({
  SelectUserSetting: () => <div data-testid="user-settings">設定セクション</div>,
}));

jest.mock('../components/UserInputBusinessApplication', () => ({
  UserInputBusinessApplication: ({ onUpdateUser }: any) => (
    <button onClick={() => onUpdateUser({})}>申請を送信</button>
  ),
}));

describe('UserDisplayMyPage コンポーネント', () => {
  const mockUser: User = {
    ...MOCK_GENERAL_USER,
    name: '田中 太郎',
    email: 'tanaka@example.com',
    blockedUsers: [],
  };

  const testPins: Pin[] = [mockPins[0]];

  const defaultProps = {
    user: mockUser,
    pins: testPins,
    reactedPins: [],
    onPinClick: jest.fn(),
    onDeletePin: jest.fn(),
    onUpdateUser: jest.fn(),
    onNavigateToDeleteAccount: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('ユーザーの基本情報が表示されること', () => {
    render(<UserDisplayMyPage {...defaultProps} />);
    expect(screen.getByText('tanaka@example.com')).toBeInTheDocument();
    expect(screen.getByText('2025年1月1日')).toBeInTheDocument();
  });

  test('タブを切り替えるとコンテンツが切り替わること', async () => {
    const user = userEvent.setup(); 
    render(<UserDisplayMyPage {...defaultProps} />);
    
    // 1. 初期状態：投稿履歴が表示されていること
    expect(screen.getByTestId('post-history')).toBeInTheDocument();
    
    // 2. リアクションタブをクリック
    const reactionTab = screen.getByRole('tab', { name: /リアクション/ });
    await user.click(reactionTab); 
  
    // Radix Tabs の切り替えを待機
    await waitFor(() => {
      expect(screen.getByTestId('reaction-view')).toBeInTheDocument();
    });
    
    // 3. 設定タブをクリック
    const settingsTab = screen.getByRole('tab', { name: /設定/ });
    await user.click(settingsTab);
  
    await waitFor(() => {
      expect(screen.getByTestId('user-settings')).toBeInTheDocument();
    });
  });

  test('事業者登録申請フォームの表示と送信が動作すること', async () => {
    const user = userEvent.setup();
    render(<UserDisplayMyPage {...defaultProps} />);

    const applyButton = screen.getByRole('button', { name: /事業者登録を申請/ });
    await user.click(applyButton);

    const submitButton = screen.getByText('申請を送信');
    await user.click(submitButton);

    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('申請を送信しました'));
    expect(screen.getByRole('button', { name: /事業者登録を申請/ })).toBeInTheDocument();
  });
});