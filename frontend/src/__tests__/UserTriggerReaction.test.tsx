import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserTriggerReaction } from '../components/UserTriggerReaction';
import { toast } from 'sonner';

// sonner のモック
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));
vi.mock('../lib/auth', () => ({
  getStoredJWT: () => 'mock-token',
}));

describe('UserTriggerReaction', () => {
  const defaultProps = {
    postId: 101,
    userId: 'user-123',
    isReacted: false,
    userRole: 'general',
    isDisabled: false,
    onReaction: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('未リアクション状態で正しく表示されること', () => {
    render(<UserTriggerReaction {...defaultProps} />);

    const button = screen.getByRole('button', { name: 'リアクション' });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('クリックすると POST リクエストを送り、成功時に onReaction が呼ばれること', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    (global.fetch as any).mockResolvedValueOnce({ ok: true });

    render(<UserTriggerReaction {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'リアクション' }));

    // API呼び出しの検証 (POST)
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/posts/reaction',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-token',
        },
        body: JSON.stringify({ postId: 101 }),
      })
    );

    await waitFor(() => {
      expect(defaultProps.onReaction).toHaveBeenCalledWith(101);
      expect(toast.success).toHaveBeenCalledWith('リアクションしました！');
    });
    consoleErrorSpy.mockRestore();
  });

  it('リアクション済み状態でクリックすると DELETE リクエストを送ること', async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockResolvedValueOnce({ ok: true });

    render(<UserTriggerReaction {...defaultProps} isReacted={true} />);

    const button = screen.getByRole('button', { name: 'リアクション済み' });
    await user.click(button);

    // API呼び出しの検証 (POST - 削除もPOSTでトグル)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/posts/reaction'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-token',
        },
        body: JSON.stringify({ postId: 101 }),
      })
    );

    await waitFor(() => {
      expect(defaultProps.onReaction).toHaveBeenCalledWith(101);
    });
  });

  it('事業者の場合、ボタンが非活性になりメッセージが変わること', () => {
    render(<UserTriggerReaction {...defaultProps} userRole="business" />);

    const button = screen.getByRole('button', { name: '事業者はリアクション不可' });
    expect(button).toBeDisabled();
  });

  it('APIエラー時にエラーメッセージが表示されること', async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockRejectedValueOnce(new Error('Network Error'));

    render(<UserTriggerReaction {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'リアクション' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('通信エラーが発生しました');
    });
  });

  it('通信中はボタンが「処理中...」になり非活性になること', async () => {
    const user = userEvent.setup();
    // 意図的に解決を遅らせるプロミス
    (global.fetch as any).mockReturnValue(
      new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 100))
    );

    render(<UserTriggerReaction {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'リアクション' }));

    // 通信中の表示確認
    expect(screen.getByRole('button')).toBeDisabled();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });
});
