import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SelectBlock } from '../components/SelectBlock';
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

describe('SelectBlock コンポーネント', () => {
  const mockUserId = 'target-user-456';
  const mockBlockerId = 'my-user-123';
  const mockOnBlockUser = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    window.fetch = fetchMock;
    fetchMock.mockReset();
    // デフォルトで confirm は true (OK) を返すように設定
    jest.spyOn(window, 'confirm').mockImplementation(() => true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('初期状態でブロックボタンが表示されていること', () => {
    render(
      <SelectBlock
        userId={mockUserId}
        blockerId={mockBlockerId}
        onBlockUser={mockOnBlockUser}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByRole('button', { name: 'ブロック' })).toBeInTheDocument();
  });

  test('確認ダイアログで「キャンセル」を押した場合、APIが呼ばれないこと', () => {
    (window.confirm as jest.Mock).mockReturnValue(false);

    render(
      <SelectBlock
        userId={mockUserId}
        blockerId={mockBlockerId}
        onBlockUser={mockOnBlockUser}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'ブロック' }));

    expect(window.confirm).toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(mockOnBlockUser).not.toHaveBeenCalled();
  });

  test('正常にブロック（POSTリクエスト）が成功した場合、コールバックが呼ばれること', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
    } as Response);

    render(
      <SelectBlock
        userId={mockUserId}
        blockerId={mockBlockerId}
        onBlockUser={mockOnBlockUser}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'ブロック' }));

    // ローディング表示（処理中）の確認
    expect(screen.getByText('処理中')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();

    // APIリクエストの検証
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/users/block',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: mockUserId,
            blockerId: mockBlockerId,
          }),
        })
      );
    });

    // 成功後のトーストとコールバックの検証
    expect(toast.success).toHaveBeenCalledWith('ユーザーをブロックしました');
    expect(mockOnBlockUser).toHaveBeenCalledWith(mockUserId);
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('APIエラー時にエラー通知が表示され、ボタンが再度活性化すること', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false } as Response);

    render(
      <SelectBlock
        userId={mockUserId}
        blockerId={mockBlockerId}
        onBlockUser={mockOnBlockUser}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'ブロック' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('エラーが発生しました。再度お試しください。');
    });

    // ローディングが終了し、ボタンが復帰していること
    expect(screen.queryByText('処理中')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ブロック' })).not.toBeDisabled();
  });
});
