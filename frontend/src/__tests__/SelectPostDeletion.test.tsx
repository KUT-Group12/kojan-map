<<<<<<< HEAD
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
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId: mockPostId }),
        })
      );
=======
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
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
>>>>>>> main
      expect(toast.success).toHaveBeenCalledWith('投稿を削除しました');
      expect(mockOnDelete).toHaveBeenCalledWith(mockPostId);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

<<<<<<< HEAD
  it('APIエラー時に適切なエラーメッセージが表示されること', async () => {
    (global.fetch as any).mockResolvedValueOnce({ ok: false });
    await renderComponent();

    fireEvent.click(screen.getByRole('button', { name: '削除' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('削除中にエラーが発生しました');
      expect(mockOnDelete).not.toHaveBeenCalled();
=======
  test('APIエラー時にエラーメッセージが表示され、ボタンが再活性化すること', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false } as Response);

    render(
      <SelectPostDeletion postId={mockPostId} onDelete={mockOnDelete} onClose={mockOnClose} />
    );

    fireEvent.click(screen.getByRole('button', { name: /削除/i }));

    await waitFor(() => {
      expect(screen.queryByText('削除中...')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /削除/i })).not.toBeDisabled();
>>>>>>> main
    });
  });
});
