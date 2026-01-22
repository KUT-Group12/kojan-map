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

// Mock getStoredJWT
vi.mock('../lib/auth', () => ({
  getStoredJWT: vi.fn(() => 'mock-token'),
}));

describe('SelectUnlock', () => {
  const mockTargetUserId = 'blocked-user-999';
  const mockCurrentUser = {
    id: 'my-id-123',
    name: '自分',
    blockedUsers: ['blocked-user-999', 'other-user-000'],
  } as any;
  const mockOnUpdateUser = vi.fn();
  const TEST_API_URL = 'http://test-api.com';

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv('VITE_API_URL', TEST_API_URL);
    global.fetch = vi.fn();
  });

  const renderComponent = async () => {
    const { SelectUnlock } = await import('../components/SelectUnlock');
    return render(
      <SelectUnlock
        userId={mockTargetUserId}
        user={mockCurrentUser}
        onUpdateUser={mockOnUpdateUser}
      />
    );
  };

  it('ブロック解除ボタンをクリックすると、正しいDELETEリクエストが送信されること', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'block removed' }),
    });

    await renderComponent();

    const button = screen.getByRole('button', { name: 'ブロック解除' });
    fireEvent.click(button);

    // 処理中のUI確認
    expect(screen.getByText('処理中')).toBeInTheDocument();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${TEST_API_URL}/api/users/block`,
        expect.objectContaining({
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer mock-token',
          },
          body: JSON.stringify({
            userId: mockTargetUserId,
            blockerId: mockCurrentUser.id,
          }),
        })
      );
    });
  });

  it('ブロック解除成功時、状態が更新されトーストが表示されること', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'success' }),
    });

    await renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'ブロック解除' }));

    await waitFor(() => {
      // onUpdateUserが、ターゲットIDを除いたリストで呼ばれているか確認
      expect(mockOnUpdateUser).toHaveBeenCalledWith(
        expect.objectContaining({
          blockedUsers: ['other-user-000'], // target-user-999が消えている
        })
      );
      expect(toast.success).toHaveBeenCalledWith('ブロックを解除しました');
    });
  });

  it('APIエラー時にエラー通知が表示されること', async () => {
    (global.fetch as any).mockResolvedValueOnce({ ok: false });

    await renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'ブロック解除' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('エラーが発生しました。再度お試しください。');
      expect(mockOnUpdateUser).not.toHaveBeenCalled();
    });
  });

  it('読み込み中はボタンが非活性（disabled）になること', async () => {
    // リクエストを完了させない
    (global.fetch as any).mockReturnValue(new Promise(() => {}));

    await renderComponent();

    const button = screen.getByRole('button', { name: 'ブロック解除' });
    fireEvent.click(button);

    expect(button).toBeDisabled();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });
});
