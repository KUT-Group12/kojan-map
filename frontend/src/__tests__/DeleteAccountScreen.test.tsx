import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeleteAccountScreen } from '../components/DeleteAccountScreen';
import { toast } from 'sonner';

// fetchのモック
const fetchMock = jest.fn() as jest.Mock;

// toastのモック
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('DeleteAccountScreen コンポーネント', () => {
  const mockUser = { googleId: 'google-123', gmail: 'test@example.com', role: 'general' };
  const mockOnBack = jest.fn();
  const mockOnDeleteAccount = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.mockReset();
    window.fetch = fetchMock;
    // window.confirm をモック化して true を返すように設定
    window.confirm = jest.fn(() => true);
  });

  test('初期状態では削除ボタンが非活性であること', () => {
    render(
      <DeleteAccountScreen
        user={mockUser as any}
        onBack={mockOnBack}
        onDeleteAccount={mockOnDeleteAccount}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /アカウントを削除する/i });
    expect(deleteButton).toBeDisabled();
  });

  test('3つのチェックボックスすべてにチェックを入れるとボタンが活性化すること', () => {
    render(
      <DeleteAccountScreen
        user={mockUser as any}
        onBack={mockOnBack}
        onDeleteAccount={mockOnDeleteAccount}
      />
    );

    const check1 = screen.getByLabelText(/すべてのデータが完全に削除されることを理解しました/i);
    const check2 = screen.getByLabelText(/この操作は取り消すことができないことを理解しました/i);
    const check3 = screen.getByLabelText(/投稿したすべてのピンが削除されることを理解しました/i);
    const deleteButton = screen.getByRole('button', { name: /アカウントを削除する/i });

    // チェックを入れる
    fireEvent.click(check1);
    fireEvent.click(check2);
    fireEvent.click(check3);

    expect(deleteButton).not.toBeDisabled();
  });

  test('削除実行時に正しいAPI(PUT)が呼ばれ、完了後に onDeleteAccount が呼ばれること', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'user deleted' }),
    } as Response);

    render(
      <DeleteAccountScreen
        user={mockUser as any}
        onBack={mockOnBack}
        onDeleteAccount={mockOnDeleteAccount}
      />
    );

    // 全てにチェック
    fireEvent.click(screen.getByLabelText(/すべてのデータが完全に削除されることを理解しました/i));
    fireEvent.click(screen.getByLabelText(/この操作は取り消すことができないことを理解しました/i));
    fireEvent.click(screen.getByLabelText(/投稿したすべてのピンが削除されることを理解しました/i));

    // 退会理由を入力
    const reasonTextarea = screen.getByPlaceholderText(/退会理由をご記入ください/i);
    fireEvent.change(reasonTextarea, { target: { value: 'サービスが不要になったため' } });

    // 削除ボタンクリック
    const deleteButton = screen.getByRole('button', { name: /アカウントを削除する/i });
    fireEvent.click(deleteButton);

    // confirmダイアログが表示されたか
    expect(window.confirm).toHaveBeenCalled();

    await waitFor(() => {
      // APIリクエストの検証
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/auth/withdrawal',
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            googleId: 'google-123',
            reason: 'サービスが不要になったため',
          }),
        })
      );
      // fetch完了後に実行されるアサーションもwaitFor内に含める (CodeRabbitAI指摘対応)
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('アカウントを削除しました'));
      expect(mockOnDeleteAccount).toHaveBeenCalled();
    });
  });

  test('window.confirmでキャンセルを選択した場合、APIは呼ばれないこと', () => {
    window.confirm = jest.fn(() => false); // キャンセルをシミュレート

    render(
      <DeleteAccountScreen
        user={mockUser as any}
        onBack={mockOnBack}
        onDeleteAccount={mockOnDeleteAccount}
      />
    );

    // 全てにチェック（ボタンを活性化させるため）
    fireEvent.click(screen.getByLabelText(/すべてのデータが完全に削除されることを理解しました/i));
    fireEvent.click(screen.getByLabelText(/この操作は取り消すことができないことを理解しました/i));
    fireEvent.click(screen.getByLabelText(/投稿したすべてのピンが削除されることを理解しました/i));

    fireEvent.click(screen.getByRole('button', { name: /アカウントを削除する/i }));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(mockOnDeleteAccount).not.toHaveBeenCalled();
  });

  test('戻るボタンをクリックすると onBack が呼ばれること', () => {
    render(
      <DeleteAccountScreen
        user={mockUser as any}
        onBack={mockOnBack}
        onDeleteAccount={mockOnDeleteAccount}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /マイページに戻る/i }));
    expect(mockOnBack).toHaveBeenCalled();
  });
});
