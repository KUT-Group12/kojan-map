import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ReportScreen } from '../components/ReportScreen';
import { toast } from 'sonner';

// fetchのモック設定
const fetchMock = jest.fn() as jest.Mock;

beforeAll(() => {
  globalThis.fetch = fetchMock;
});

beforeEach(() => {
  jest.clearAllMocks();
  window.fetch = fetchMock; // ← この行を追加
  fetchMock.mockReset();
});

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('ReportScreen コンポーネント', () => {
  const defaultProps = {
    postId: 101,
    userId: 'user-789',
    isReporting: false,
    setIsReporting: jest.fn(),
    onReportComplete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.mockReset();
  });

  test('正常に入力して送信すると、正しいAPI(POST)が呼ばれ完了処理が行われること', async () => {
    // 成功レスポンスを定義
    fetchMock.mockResolvedValueOnce({ ok: true } as Response);

    render(<ReportScreen {...defaultProps} isReporting={true} />);

    const textarea = screen.getByPlaceholderText('理由を入力');
    fireEvent.change(textarea, { target: { value: 'スパム投稿です' } });

    // 送信ボタンクリック
    const submitButton = screen.getByRole('button', { name: '送信' });
    fireEvent.click(submitButton);

    // 【修正ポイント1】
    // クリック直後は Loader2 アイコンが表示されるため、name 指定なしで disabled かどうかをチェック
    // もしくは data-slot="button" 等で特定する
    expect(submitButton).toBeDisabled();

    // 【修正ポイント2】
    // 非同期処理とそれに伴うステート更新（setReason等）を waitFor で包む
    // これにより act(...) の警告も解消されます
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/posts/report',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            postId: 101,
            reporterId: 'user-789',
            reportReason: 'スパム投稿です',
          }),
        })
      );
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('通報を受け付けました'));
      expect(defaultProps.setIsReporting).toHaveBeenCalledWith(false);
      expect(defaultProps.onReportComplete).toHaveBeenCalled();
    });
  });

  test('APIエラー時にエラーメッセージが表示されること', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false } as Response);

    render(<ReportScreen {...defaultProps} isReporting={true} />);

    fireEvent.change(screen.getByPlaceholderText('理由を入力'), { target: { value: 'test' } });
    fireEvent.click(screen.getByRole('button', { name: '送信' }));

    // エラー後のステート更新を待つ
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('エラーが発生しました。再度お試しください。');
    });

    // エラー後はボタンが「送信」に戻っているはず
    expect(screen.getByRole('button', { name: '送信' })).not.toBeDisabled();
  });
});
