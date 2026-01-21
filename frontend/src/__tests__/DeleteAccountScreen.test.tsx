import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from 'sonner';

// 外部ライブラリのモック
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('DeleteAccountScreen', () => {
  const mockUser = {
    id: 'google-id-123',
    email: 'test@example.com',
    role: 'user',
  } as any;

  const mockOnBack = vi.fn();
  const mockOnDeleteAccount = vi.fn();

  beforeEach(() => {
    vi.resetModules(); // モジュールキャッシュをクリア
    vi.clearAllMocks();
    vi.stubEnv('VITE_API_URL', 'http://test-api.com');
    global.fetch = vi.fn();
    // window.confirm をモック化（デフォルトでOKを返す）
    window.confirm = vi.fn(() => true);
  });

  // コンポーネントを動的にインポートするヘルパー
  const renderComponent = async () => {
    const { DeleteAccountScreen } = await import('../components/DeleteAccountScreen');
    return render(
      <DeleteAccountScreen
        user={mockUser}
        onBack={mockOnBack}
        onDeleteAccount={mockOnDeleteAccount}
      />
    );
  };

  it('チェックボックスがすべてオンでないと、削除ボタンが有効にならないこと', async () => {
    await renderComponent();
    const deleteButton = screen.getByRole('button', { name: /アカウントを削除する/ });

    // 初期状態は無効
    expect(deleteButton).toBeDisabled();

    // 2つだけチェック
    fireEvent.click(screen.getByLabelText(/完全に削除されることを理解しました/));
    fireEvent.click(screen.getByLabelText(/取り消すことができないことを理解しました/));
    expect(deleteButton).toBeDisabled();

    // 3つ目チェック
    fireEvent.click(screen.getByLabelText(/すべてのピンが削除されることを理解しました/));
    
    // 全チェックで有効化
    expect(deleteButton).not.toBeDisabled();
  });

  it('削除が正常に完了し、APIが正しいパラメータで呼ばれること', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'user deleted' }),
    });

    await renderComponent();

    // バリデーションを通す
    fireEvent.click(screen.getByLabelText(/完全に削除されることを理解しました/));
    fireEvent.click(screen.getByLabelText(/取り消すことができないことを理解しました/));
    fireEvent.click(screen.getByLabelText(/すべてのピンが削除されることを理解しました/));
    
    // 退会理由を入力
    const reasonInput = screen.getByPlaceholderText(/退会理由をご記入ください/);
    fireEvent.change(reasonInput, { target: { value: 'サービスが不要になったため' } });

    // 削除ボタンクリック
    fireEvent.click(screen.getByRole('button', { name: /アカウントを削除する/ }));

    await waitFor(() => {
      // API呼び出しの確認
      expect(global.fetch).toHaveBeenCalledWith(
        'http://test-api.com/api/auth/withdrawal',
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            googleId: 'google-id-123',
            reason: 'サービスが不要になったため',
          }),
        })
      );
      // 成功通知とコールバックの確認
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('削除しました'));
      expect(mockOnDeleteAccount).toHaveBeenCalled();
    });
  });

  it('APIエラー時にトーストが表示され、処理状態が解除されること', async () => {
    (global.fetch as any).mockResolvedValueOnce({ ok: false });

    await renderComponent();

    // 全チェック
    fireEvent.click(screen.getByLabelText(/完全に削除されることを理解しました/));
    fireEvent.click(screen.getByLabelText(/取り消すことができないことを理解しました/));
    fireEvent.click(screen.getByLabelText(/すべてのピンが削除されることを理解しました/));

    fireEvent.click(screen.getByRole('button', { name: /アカウントを削除する/ }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('エラーが発生しました'));
    });

    // 削除中表示が消えて、ボタンが再度クリック可能（disabledでない）ことを確認
    expect(screen.queryByText('削除処理中...')).not.toBeInTheDocument();
  });

  it('window.confirmでキャンセルした場合は何もしないこと', async () => {
    window.confirm = vi.fn(() => false); // キャンセルを選択
    await renderComponent();

    fireEvent.click(screen.getByLabelText(/完全に削除されることを理解しました/));
    fireEvent.click(screen.getByLabelText(/取り消すことができないことを理解しました/));
    fireEvent.click(screen.getByLabelText(/すべてのピンが削除されることを理解しました/));

    fireEvent.click(screen.getByRole('button', { name: /アカウントを削除する/ }));

    expect(global.fetch).not.toHaveBeenCalled();
    expect(mockOnDeleteAccount).not.toHaveBeenCalled();
  });
});