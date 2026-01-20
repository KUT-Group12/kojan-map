import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SelectPostDeletion } from '../components/SelectPostDeletion';
import { toast } from 'sonner';

// fetchのモック設定
const fetchMock = jest.fn() as jest.Mock;

// toastのモック
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('SelectPostDeletion コンポーネント', () => {
  const mockPostId = 123;
  const mockOnDelete = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    window.fetch = fetchMock;
    fetchMock.mockReset();
    // デフォルトで confirm は true を返すように設定
    jest.spyOn(window, 'confirm').mockImplementation(() => true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('初期状態で削除ボタンが表示されること', () => {
    render(
      <SelectPostDeletion postId={mockPostId} onDelete={mockOnDelete} onClose={mockOnClose} />
    );
    expect(screen.getByRole('button', { name: /削除/i })).toBeInTheDocument();
  });

  test('確認ダイアログで「キャンセル」を押した場合、削除処理が実行されないこと', () => {
    (window.confirm as jest.Mock).mockReturnValue(false);

    render(
      <SelectPostDeletion postId={mockPostId} onDelete={mockOnDelete} onClose={mockOnClose} />
    );

    fireEvent.click(screen.getByRole('button', { name: /削除/i }));

    expect(window.confirm).toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(mockOnDelete).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('正常に削除（PUTリクエスト）が成功した場合、コールバックが呼ばれること', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'post anonymized' }),
    } as Response);

    render(
      <SelectPostDeletion postId={mockPostId} onDelete={mockOnDelete} onClose={mockOnClose} />
    );

    fireEvent.click(screen.getByRole('button', { name: /削除/i }));

    // ローディング表示の確認
    expect(screen.getByText('削除中...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();

    // APIリクエストの検証
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/posts/anonymize',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ postId: mockPostId }),
        })
      );
    });

    // 成功後の処理検証
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('投稿を削除しました');
      expect(mockOnDelete).toHaveBeenCalledWith(mockPostId);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  test('APIエラー時にエラーメッセージが表示され、ボタンが再活性化すること', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false } as Response);

    render(
      <SelectPostDeletion postId={mockPostId} onDelete={mockOnDelete} onClose={mockOnClose} />
    );

    fireEvent.click(screen.getByRole('button', { name: /削除/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('削除中にエラーが発生しました');
    });

    // ローディングが終了していることを確認
    expect(screen.queryByText('削除中...')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /削除/i })).not.toBeDisabled();
  });
});
