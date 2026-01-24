import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteAccountScreen } from '../components/DeleteAccountScreen';
import { User, Business } from '../types';
import { toast } from 'sonner';

// import.meta.env のモック
vi.stubEnv('VITE_API_URL', 'http://localhost:8080');

// toast のモック
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock getStoredJWT
vi.mock('../lib/auth', () => ({
  getStoredJWT: vi.fn(() => 'mock-token'),
}));

describe('DeleteAccountScreen', () => {
  const mockUser: User = {
    googleId: 'test-user-id',
    gmail: 'test@gmail.com',
    role: 'user',
    registrationDate: new Date().toISOString(),
    fromName: 'テストユーザー',
  };

  const mockOnBack = vi.fn();
  const mockOnDeleteAccount = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
    // window.confirm をモック (デフォルトで true を返す)
    vi.stubGlobal(
      'confirm',
      vi.fn(() => true)
    );
  });

  const getFetchMock = () => globalThis.fetch as any;

  it('初期状態で削除ボタンが無効化されていること', () => {
    render(
      <DeleteAccountScreen
        user={mockUser}
        onBack={mockOnBack}
        onDeleteAccount={mockOnDeleteAccount}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /アカウントを削除する/ });
    expect(deleteButton).toBeDisabled();
  });

  it('すべてのチェックボックスをオンにするとボタンが有効化されること', async () => {
    render(
      <DeleteAccountScreen
        user={mockUser}
        onBack={mockOnBack}
        onDeleteAccount={mockOnDeleteAccount}
      />
    );

    const check1 = screen.getByLabelText(/すべてのデータが完全に削除されること/);
    const check2 = screen.getByLabelText(/操作は取り消すことができないこと/);
    const check3 = screen.getByLabelText(/投稿したすべてのピンが削除されること/);

    // チェックを入れる
    fireEvent.click(check1);
    fireEvent.click(check2);
    fireEvent.click(check3);

    const deleteButton = screen.getByRole('button', { name: /アカウントを削除する/ });
    expect(deleteButton).toBeEnabled();
  });

  it('削除キャンセル（confirmでいいえ）を選択した場合、APIが呼ばれないこと', async () => {
    // confirm でキャンセルを選択
    (globalThis.confirm as any).mockReturnValue(false);

    render(
      <DeleteAccountScreen
        user={mockUser}
        onBack={mockOnBack}
        onDeleteAccount={mockOnDeleteAccount}
      />
    );

    // チェックを入れてボタンを有効化
    fireEvent.click(screen.getByLabelText(/すべてのデータが完全に削除されること/));
    fireEvent.click(screen.getByLabelText(/操作は取り消すことができないこと/));
    fireEvent.click(screen.getByLabelText(/投稿したすべてのピンが削除されること/));

    const deleteButton = screen.getByRole('button', { name: /アカウントを削除する/ });
    fireEvent.click(deleteButton);

    expect(getFetchMock()).not.toHaveBeenCalled();
    expect(mockOnDeleteAccount).not.toHaveBeenCalled();
  });

  it('API送信に成功したとき、成功メッセージを表示して onDeleteAccount を呼ぶこと', async () => {
    getFetchMock().mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'user deleted' }),
    });

    render(
      <DeleteAccountScreen
        user={mockUser}
        onBack={mockOnBack}
        onDeleteAccount={mockOnDeleteAccount}
      />
    );

    // 準備: チェックを入れる
    fireEvent.click(screen.getByLabelText(/すべてのデータが完全に削除されること/));
    fireEvent.click(screen.getByLabelText(/操作は取り消すことができないこと/));
    fireEvent.click(screen.getByLabelText(/投稿したすべてのピンが削除されること/));

    // 退会理由を入力
    fireEvent.change(screen.getByPlaceholderText(/退会理由をご記入ください/), {
      target: { value: '使わなくなったため' },
    });

    const deleteButton = screen.getByRole('button', { name: /アカウントを削除する/ });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      // API呼び出しの検証 (PUT メソッドであること)
      expect(getFetchMock()).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/withdrawal'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({
            googleId: mockUser.googleId,
            reason: '使わなくなったため',
          }),
        })
      );
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('ありがとうございました'));
      expect(mockOnDeleteAccount).toHaveBeenCalled();
    });
  });

  it('APIエラー時にエラートーストを表示し、削除ボタンを再有効化すること', async () => {
    getFetchMock().mockResolvedValue({ ok: false });

    render(
      <DeleteAccountScreen
        user={mockUser}
        onBack={mockOnBack}
        onDeleteAccount={mockOnDeleteAccount}
      />
    );

    fireEvent.click(screen.getByLabelText(/すべてのデータが完全に削除されること/));
    fireEvent.click(screen.getByLabelText(/操作は取り消すことができないこと/));
    fireEvent.click(screen.getByLabelText(/投稿したすべてのピンが削除されること/));

    fireEvent.click(screen.getByRole('button', { name: /アカウントを削除する/ }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
      const deleteButton = screen.getByRole('button', { name: /アカウントを削除する/ });
      expect(deleteButton).toBeEnabled(); // ローディングが終わって再度押せるようになっているか
    });
  });
});
