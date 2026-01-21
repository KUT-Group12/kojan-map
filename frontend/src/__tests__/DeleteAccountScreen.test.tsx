import { render, screen, fireEvent, waitFor } from '@testing-library/react';
<<<<<<< HEAD
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
=======
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
>>>>>>> main
        onBack={mockOnBack}
        onDeleteAccount={mockOnDeleteAccount}
      />
    );
<<<<<<< HEAD
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
=======

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
>>>>>>> main
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
<<<<<<< HEAD
            googleId: 'google-id-123',
=======
            googleId: 'google-123',
>>>>>>> main
            reason: 'サービスが不要になったため',
          }),
        })
      );
<<<<<<< HEAD
      // 成功通知とコールバックの確認
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('削除しました'));
=======
      // fetch完了後に実行されるアサーションもwaitFor内に含める (CodeRabbitAI指摘対応)
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining('アカウントを削除しました')
      );
>>>>>>> main
      expect(mockOnDeleteAccount).toHaveBeenCalled();
    });
  });

<<<<<<< HEAD
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
=======
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
>>>>>>> main
});
