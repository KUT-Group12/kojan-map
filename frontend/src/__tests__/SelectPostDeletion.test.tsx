import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from 'sonner';

// sonnerのモック
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));
vi.mock('../lib/auth', () => ({
  getStoredJWT: () => 'mock-token',
}));

describe('SelectPostDeletion', () => {
  const mockPostId = 12345;
  const mockOnDelete = vi.fn();
  const mockOnClose = vi.fn();
  const TEST_API_URL = 'http://test-api.com';

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv('VITE_API_URL', TEST_API_URL);

    global.fetch = vi.fn();

    // window.confirm のモック（デフォルトは「OK」）
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
  });

  const renderComponent = async () => {
    const { SelectPostDeletion } = await import('../components/SelectPostDeletion');
    return render(
      <SelectPostDeletion postId={mockPostId} onDelete={mockOnDelete} onClose={mockOnClose} />
    );
  };

  it('削除ボタンをクリックした際、確認ダイアログが表示されること', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm');
    await renderComponent();

    fireEvent.click(screen.getByRole('button', { name: '削除' }));

    expect(confirmSpy).toHaveBeenCalledWith('この投稿を削除してもよろしいですか？');
  });

  it('確認ダイアログでキャンセルを選択した場合、何も実行されないこと', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    await renderComponent();

    fireEvent.click(screen.getByRole('button', { name: '削除' }));

    expect(global.fetch).not.toHaveBeenCalled();
    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it('削除が成功したとき、PUTメソッドで正しいURLとボディが送信されること', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'post anonymized' }),
    });
    await renderComponent();

    fireEvent.click(screen.getByRole('button', { name: '削除' }));

    // ローディング表示の確認
    expect(screen.getByText('削除中...')).toBeInTheDocument();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${TEST_API_URL}/api/posts/anonymize`,
        expect.objectContaining({
          method: 'PUT', // 仕様に合わせたメソッド
        })
      );
      expect(toast.success).toHaveBeenCalledWith('投稿を削除しました');
      expect(mockOnDelete).toHaveBeenCalledWith(mockPostId);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('APIエラー時に適切なエラーメッセージが表示されること', async () => {
    (global.fetch as any).mockResolvedValueOnce({ ok: false });
    await renderComponent();

    fireEvent.click(screen.getByRole('button', { name: '削除' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('削除中にエラーが発生しました');
      expect(mockOnDelete).not.toHaveBeenCalled();
    });
  });
});
