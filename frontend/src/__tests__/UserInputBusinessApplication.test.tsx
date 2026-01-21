<<<<<<< HEAD
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserInputBusinessApplication } from '../components/UserInputBusinessApplication';
import { toast } from 'sonner';

// sonner のモック
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('UserInputBusinessApplication', () => {
  const mockUser = { id: 'user-123', name: 'テストユーザー' } as any;
  const mockOnUpdateUser = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // fetch のモック化
    global.fetch = vi.fn();
  });

  it('フォームの初期項目が正しく表示されていること', () => {
    render(
      <UserInputBusinessApplication
        user={mockUser}
=======
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserInputBusinessApplication } from '../components/UserInputBusinessApplication';
import { toast } from 'sonner';

// fetchのモック設定
const fetchMock = jest.fn() as jest.Mock;

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('UserInputBusinessApplication コンポーネント', () => {
  const mockUser = { googleId: 'google-123' };
  const mockOnUpdateUser = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    window.fetch = fetchMock;
    fetchMock.mockReset(); // fetchの履歴をリセット
  });

  test('正常に入力して申請すると API が呼ばれること', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true } as Response);

    render(
      <UserInputBusinessApplication
        user={mockUser as any}
>>>>>>> main
        onUpdateUser={mockOnUpdateUser}
        onCancel={mockOnCancel}
      />
    );

<<<<<<< HEAD
    expect(screen.getByPlaceholderText('店舗名')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('電話番号')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('住所')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '申請する' })).toBeInTheDocument();
  });

  it('不完全な入力で「申請する」を押すとバリデーションエラーになること', async () => {
    const user = userEvent.setup();
    render(
      <UserInputBusinessApplication
        user={mockUser}
        onUpdateUser={mockOnUpdateUser}
        onCancel={mockOnCancel}
      />
    );

    // 何も入力せずに申請
    await user.click(screen.getByRole('button', { name: '申請する' }));

    expect(toast.error).toHaveBeenCalledWith('すべての項目を正しく入力してください');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('正しい入力で申請すると API が呼ばれ、成功時にフォームが閉じること', async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(
      <UserInputBusinessApplication
        user={mockUser}
        onUpdateUser={mockOnUpdateUser}
        onCancel={mockOnCancel}
      />
    );

    // 入力
    await user.type(screen.getByPlaceholderText('店舗名'), 'テスト店舗');
    await user.type(screen.getByPlaceholderText('電話番号'), '09012345678');
    await user.type(screen.getByPlaceholderText('住所'), '東京都渋谷区1-1-1');

    // 申請
    await user.click(screen.getByRole('button', { name: '申請する' }));

    // API呼び出しの検証
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/business/apply'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            businessName: 'テスト店舗',
            phone: '09012345678',
            address: '東京都渋谷区1-1-1',
            userId: mockUser.id,
          }),
        })
      );
    });

    // 成功後の処理検証
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('申請を送信しました'));
    expect(mockOnUpdateUser).toHaveBeenCalled();
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('APIがエラーを返した場合、エラーメッセージを表示すること', async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
    });

    render(
      <UserInputBusinessApplication
        user={mockUser}
        onUpdateUser={mockOnUpdateUser}
        onCancel={mockOnCancel}
      />
    );

    await user.type(screen.getByPlaceholderText('店舗名'), 'テスト店舗');
    await user.type(screen.getByPlaceholderText('電話番号'), '09012345678');
    await user.type(screen.getByPlaceholderText('住所'), '住所');

    await user.click(screen.getByRole('button', { name: '申請する' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('通信エラーが発生しました。再度お試しください。');
    });
    // 失敗時はフォームを閉じない
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  it('キャンセルボタンを押すと onCancel が呼ばれること', async () => {
    const user = userEvent.setup();
    render(
      <UserInputBusinessApplication
        user={mockUser}
        onUpdateUser={mockOnUpdateUser}
        onCancel={mockOnCancel}
      />
    );

    await user.click(screen.getByRole('button', { name: 'キャンセル' }));
    expect(mockOnCancel).toHaveBeenCalled();
=======
    // 1. 各フィールドに入力
    // inputを特定して値を変更。changeイベントを確実に発火させる
    fireEvent.change(screen.getByPlaceholderText('店舗名'), {
      target: { value: 'カフェ・テスト' },
    });
    fireEvent.change(screen.getByPlaceholderText('電話番号'), { target: { value: '09012345678' } });
    fireEvent.change(screen.getByPlaceholderText('住所'), { target: { value: '高知県香美市' } });

    // 2. 申請ボタンをクリック
    const submitButton = screen.getByRole('button', { name: '申請する' });
    fireEvent.click(submitButton);

    // 3. fetchが呼ばれるのを待機
    await waitFor(
      () => {
        expect(fetchMock).toHaveBeenCalledTimes(1);
      },
      { timeout: 2000 }
    ); // 少し長めに待機

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/business/apply',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"businessName":"カフェ・テスト"'),
      })
    );
>>>>>>> main
  });
});
