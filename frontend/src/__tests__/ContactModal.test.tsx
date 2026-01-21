import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from 'sonner';

// 1. コンポーネントのインポートをトップレベルから消す（後で動的インポートするため）
// import { ContactModal } from './ContactModal';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('ContactModal', () => {
  const mockUser = {
    /* ...既存のデータ... */
  } as any;
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.resetModules(); // モジュールのキャッシュをクリア
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('正常に送信ができること', async () => {
    // 2. 環境変数をセット
    vi.stubEnv('VITE_API_URL', 'http://test-api.com');

    // 3. 環境変数がセットされた後にコンポーネントを動的にインポート
    const { ContactModal } = await import('../components/ContactModal');

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: '送信完了' }),
    });

    render(<ContactModal user={mockUser} onClose={mockOnClose} />);

    fireEvent.change(screen.getByLabelText(/件名/), { target: { value: '質問です' } });
    fireEvent.change(screen.getByLabelText(/メッセージ/), { target: { value: '内容です' } });
    fireEvent.click(screen.getByRole('button', { name: '送信する' }));

    await waitFor(() => {
      // これで期待通りのURLになります
      expect(global.fetch).toHaveBeenCalledWith(
        'http://test-api.com/api/contact/validate',
        expect.objectContaining({
          method: 'POST',
          // headers も実際のコードに合わせて追加
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });
  });
});
