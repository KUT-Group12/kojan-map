import { render, screen, fireEvent, waitFor } from '@testing-library/react';
<<<<<<< HEAD
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from 'sonner';

// 1. 外部依存モジュールのモック化
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('SelectBlock', () => {
  const mockUserId = 'target-user-123';
  const mockBlockerId = 'my-user-456';
  const mockOnBlockUser = vi.fn();
  const mockOnClose = vi.fn();
  const TEST_API_URL = 'http://test-api.com';

  beforeEach(() => {
    // モジュールのキャッシュをリセットし、環境変数が確実に反映されるようにする
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv('VITE_API_URL', TEST_API_URL);

    // fetchのモック化
    global.fetch = vi.fn();

    // window.confirm のモック（デフォルトで「OK」を返す設定）
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
  });

  /**
   * コンポーネントを動的にインポートしてレンダリングするヘルパー関数
   * 環境変数を読み込んでいるトップレベルの変数をテストごとに初期化するために必要
   */
  const renderComponent = async () => {
    const { SelectBlock } = await import('../components/SelectBlock');
    return render(
=======
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
>>>>>>> main
      <SelectBlock
        userId={mockUserId}
        blockerId={mockBlockerId}
        onBlockUser={mockOnBlockUser}
        onClose={mockOnClose}
      />
    );
<<<<<<< HEAD
  };

  it('ブロックボタンをクリックした際、確認ダイアログが表示されること', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm');
    await renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'ブロック' }));

    expect(confirmSpy).toHaveBeenCalledWith(
      expect.stringContaining('このユーザーをブロックしますか？')
    );
  });

  it('確認ダイアログでキャンセルを選択した場合、APIは呼ばれないこと', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false); // キャンセルを選択
    await renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'ブロック' }));

    expect(global.fetch).not.toHaveBeenCalled();
    expect(mockOnBlockUser).not.toHaveBeenCalled();
  });

  it('ブロックが成功したとき、正しいキー名でAPIが呼ばれ通知が表示されること', async () => {
    (global.fetch as any).mockResolvedValueOnce({ ok: true });
    await renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'ブロック' }));

    // 処理中のUI（Loader2）が表示されていることを確認
    expect(screen.getByText('処理中')).toBeInTheDocument();

    await waitFor(() => {
      // API呼び出しのURLとペイロードを検証
      expect(global.fetch).toHaveBeenCalledWith(
        `${TEST_API_URL}/api/users/block`,
=======
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
>>>>>>> main
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: mockUserId,
            blockerId: mockBlockerId,
          }),
        })
      );
<<<<<<< HEAD
      expect(toast.success).toHaveBeenCalledWith('ユーザーをブロックしました');
      expect(mockOnBlockUser).toHaveBeenCalledWith(mockUserId);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('APIエラー時にトースト通知が表示されること', async () => {
    (global.fetch as any).mockResolvedValueOnce({ ok: false });
    await renderComponent();
=======
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
>>>>>>> main

    fireEvent.click(screen.getByRole('button', { name: 'ブロック' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('エラーが発生しました。再度お試しください。');
<<<<<<< HEAD
      expect(mockOnBlockUser).not.toHaveBeenCalled();
    });
=======
    });

    // ローディングが終了し、ボタンが復帰していること
    expect(screen.queryByText('処理中')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ブロック' })).not.toBeDisabled();
>>>>>>> main
  });
});
