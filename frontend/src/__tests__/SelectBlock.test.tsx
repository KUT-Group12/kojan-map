import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from 'sonner';

// 1. 外部依存モジュールのモック化
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));
vi.mock('../lib/auth', () => ({
  getStoredJWT: () => 'mock-token',
}));

// テスト用APIベースURL
const TEST_API_URL = process.env.VITE_API_URL || 'http://127.0.0.1:8080';

describe('SelectBlock', () => {
  let confirmSpy: ReturnType<typeof vi.spyOn>;
  const mockUserId = 'target-user-123';
  const mockBlockerId = 'my-user-456';
  const mockOnBlockUser = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    // モジュールのキャッシュをリセットし、環境変数が確実に反映されるようにする
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv('VITE_API_URL', TEST_API_URL);

    // fetchのモック化
    global.fetch = vi.fn();

    // window.confirm のモック（デフォルトで「OK」を返す設定）
    confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => true);
  });

  /**
   * コンポーネントを動的にインポートしてレンダリングするヘルパー関数
   * 環境変数を読み込んでいるトップレベルの変数をテストごとに初期化するために必要
   */
  const renderComponent = async () => {
    const { SelectBlock } = await import('../components/SelectBlock');
    return render(
      <SelectBlock userId={mockUserId} onBlockUser={mockOnBlockUser} onClose={mockOnClose} />
    );
  };

  it('ブロックボタンをクリックした際、確認ダイアログが表示されること', async () => {
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

    // ボタン内に「処理中」テキストが含まれていることを検証
    const blockButton = screen.getByRole('button', { name: /処理中|ブロック/ });
    expect(blockButton).toBeDisabled();
    expect(blockButton).toHaveTextContent('処理中');
    // Loader2アイコンも同時に存在することを確認
    expect(blockButton.querySelector('svg.animate-spin')).toBeInTheDocument();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/users\/block$/),
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(toast.success).toHaveBeenCalledWith('ユーザーをブロックしました');
      expect(mockOnBlockUser).toHaveBeenCalledWith(mockUserId);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('APIエラー時にトースト通知が表示されること', async () => {
    (global.fetch as any).mockResolvedValueOnce({ ok: false });
    await renderComponent();
    fireEvent.click(screen.getByRole('button', { name: 'ブロック' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('エラーが発生しました。再度お試しください。');
      expect(mockOnBlockUser).not.toHaveBeenCalled();
    });
  });
});
