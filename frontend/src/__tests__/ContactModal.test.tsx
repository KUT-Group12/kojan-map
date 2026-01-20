import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContactModal } from '../components/ContactModal';
import { toast } from 'sonner';

// fetchのモック
if (typeof window.fetch === 'undefined') {
  window.fetch = jest.fn();
}
const fetchMock = window.fetch as jest.Mock;

// toastのモック
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('ContactModal コンポーネント', () => {
  const mockUser = { googleId: 'user-123', gmail: 'test@example.com' };
  const mockOnClose = jest.fn();
  // console.error を一時的に隠すための spy
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.mockReset();
    // 各テストごとに console.error をモック化
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test('バリデーション：空の状態で送信するとエラーが表示されること', async () => {
    render(<ContactModal user={mockUser as any} onClose={mockOnClose} />);

    // 💡 修正ポイント:
    // required属性がついている場合、fireEvent.click(button) では submit が発火しない場合があります。
    // そのため、直接フォームの submit イベントを発火させます。
    const form = screen.getByRole('dialog').querySelector('form');
    if (form) {
      fireEvent.submit(form);
    }

    expect(toast.error).toHaveBeenCalledWith('件名とメッセージを入力してください');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('正常に入力して送信すると、APIが呼ばれ onClose が実行されること', async () => {
    // APIの成功レスポンスをモック
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: '送信完了' }),
    } as Response);

    render(<ContactModal user={mockUser as any} onClose={mockOnClose} />);

    // 入力操作
    fireEvent.change(screen.getByLabelText(/件名/), { target: { value: '不具合報告' } });
    fireEvent.change(screen.getByLabelText(/メッセージ/), {
      target: { value: 'ボタンが反応しません。' },
    });

    // 送信
    const submitButton = screen.getByRole('button', { name: '送信する' });
    fireEvent.click(submitButton);

    // 送信中の状態（ボタンが非活性）を確認
    expect(submitButton).toBeDisabled();
    expect(screen.getByText('送信中...')).toBeInTheDocument();

    await waitFor(() => {
      // APIリクエストの検証
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/contact/validate',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: '不具合報告',
            text: 'ボタンが反応しません。',
          }),
        })
      );
    });

    // 成功時の処理を検証
    expect(toast.success).toHaveBeenCalledWith('送信完了');
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('APIエラー時にトーストが表示され、入力が維持されること', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network error'));

    render(<ContactModal user={mockUser as any} onClose={mockOnClose} />);

    fireEvent.change(screen.getByLabelText(/件名/), { target: { value: '質問' } });
    fireEvent.change(screen.getByLabelText(/メッセージ/), { target: { value: 'テスト' } });

    // 送信
    const form = screen.getByRole('dialog').querySelector('form');
    if (form) fireEvent.submit(form);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('エラーが発生しました'));
    });

    // ここで console.error が呼ばれますが、beforeEach でモック化しているため
    // テスト結果のログには表示されず、検証だけが可能です。
    expect(consoleSpy).toHaveBeenCalled();
  });

  test('キャンセルボタンを押すと onClose が呼ばれること', () => {
    render(<ContactModal user={mockUser as any} onClose={mockOnClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'キャンセル' }));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
