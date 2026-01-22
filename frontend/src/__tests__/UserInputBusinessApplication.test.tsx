import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserInputBusinessApplication } from '../components/UserInputBusinessApplication';
import { User } from '../types';
import { toast } from 'sonner';

// モックの設定
vi.stubGlobal('fetch', vi.fn());
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));
vi.mock('../lib/auth', () => ({
  getStoredJWT: () => 'mock-token',
}));

describe('UserInputBusinessApplication', () => {
  const mockUser: User = {
    googleId: 'test-google-id',
    gmail: 'test@gmail.com',
    role: 'general',
    registrationDate: '2024-01-01',
    fromName: 'テストユーザー',
  };

  const mockOnUpdateUser = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const getFetchMock = () => globalThis.fetch as any;

  it('バリデーションエラー：不適切な電話番号でエラーが表示されること', async () => {
    const user = userEvent.setup();
    render(
      <UserInputBusinessApplication
        user={mockUser}
        onUpdateUser={mockOnUpdateUser}
        onCancel={mockOnCancel}
      />
    );

    // 入力（電話番号が短い）
    await user.type(screen.getByPlaceholderText('店舗名'), 'テスト店舗');
    await user.type(screen.getByPlaceholderText('電話番号'), '123'); // 不正
    await user.type(screen.getByPlaceholderText('住所'), '東京都...');

    await user.click(screen.getByRole('button', { name: '申請する' }));

    expect(toast.error).toHaveBeenCalledWith('すべての項目を正しく入力してください');
    expect(getFetchMock()).not.toHaveBeenCalled();
  });

  it('申請成功：APIが呼ばれ、成功通知が出てフォームが閉じること', async () => {
    const user = userEvent.setup();
    getFetchMock().mockResolvedValueOnce({ ok: true });

    render(
      <UserInputBusinessApplication
        user={mockUser}
        onUpdateUser={mockOnUpdateUser}
        onCancel={mockOnCancel}
      />
    );

    // 正しい入力
    await user.type(screen.getByPlaceholderText('店舗名'), '美味しいパン屋');
    await user.type(screen.getByPlaceholderText('店舗名（カナ）'), 'オイシイパンヤ');
    await user.type(screen.getByPlaceholderText('郵便番号 (例: 7800000)'), '7800000');
    await user.type(screen.getByPlaceholderText('電話番号'), '09012345678');
    await user.type(screen.getByPlaceholderText('住所'), '東京都千代田区1-1');

    await user.click(screen.getByRole('button', { name: '申請する' }));

    // API呼び出しの確認
    await waitFor(() => {
      expect(getFetchMock()).toHaveBeenCalledWith(
        'http://localhost:8080/api/business/application',
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(getFetchMock()).toHaveBeenCalledTimes(1);
    });

    // 成功後の挙動
    expect(toast.success).toHaveBeenCalled();
    expect(mockOnUpdateUser).toHaveBeenCalled();
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('送信中は入力フィールドとボタンが非活性（disabled）になること', async () => {
    // 意図的にレスポンスを遅延させる
    getFetchMock().mockReturnValueOnce(
      new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 100))
    );

    render(
      <UserInputBusinessApplication
        user={mockUser}
        onUpdateUser={mockOnUpdateUser}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByRole('button', { name: '申請する' });
    fireEvent.change(screen.getByPlaceholderText('店舗名'), {
      target: { value: '美味しいパン屋' },
    });
    fireEvent.change(screen.getByPlaceholderText('店舗名（カナ）'), {
      target: { value: 'オイシイパンヤ' },
    });
    fireEvent.change(screen.getByPlaceholderText('郵便番号 (例: 7800000)'), {
      target: { value: '7800000' },
    });
    fireEvent.change(screen.getByPlaceholderText('電話番号'), { target: { value: '09012345678' } });
    fireEvent.change(screen.getByPlaceholderText('住所'), {
      target: { value: '東京都千代田区1-1' },
    });

    fireEvent.click(submitButton);

    // ローディング中
    expect(submitButton).toBeDisabled();
    expect(screen.getByPlaceholderText('店舗名')).toBeDisabled();
    // ローディングアイコンが表示されているか（LucideのLoader2）
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('キャンセルボタンを押すと onCancel が呼ばれること', () => {
    render(
      <UserInputBusinessApplication
        user={mockUser}
        onUpdateUser={mockOnUpdateUser}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'キャンセル' }));
    expect(mockOnCancel).toHaveBeenCalled();
  });
});
