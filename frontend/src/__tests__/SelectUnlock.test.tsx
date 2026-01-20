import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SelectUnlock } from '../components/SelectUnlock';
import { toast } from 'sonner';

// fetchのモック設定
if (typeof window.fetch === 'undefined') {
  window.fetch = jest.fn();
}
const fetchMock = window.fetch as jest.Mock;

// toast のモック化
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('SelectUnlock コンポーネント', () => {
  const mockUser = {
    googleId: 'my-id-123',
    name: '自分',
    blockedUsers: ['target-user-999', 'other-user-000'],
  };
  const targetUserId = 'target-user-999';
  const mockOnUpdateUser = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.mockReset();
  });

  test('初期表示で「ブロック解除」ボタンが表示されていること', () => {
    render(
      <SelectUnlock userId={targetUserId} user={mockUser as any} onUpdateUser={mockOnUpdateUser} />
    );
    expect(screen.getByRole('button', { name: 'ブロック解除' })).toBeInTheDocument();
  });

  test('ボタンクリック時に正しいAPIリクエスト(DELETE)が送信されること', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    render(
      <SelectUnlock userId={targetUserId} user={mockUser as any} onUpdateUser={mockOnUpdateUser} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'ブロック解除' }));

    // 1. ローディング表示の確認
    expect(screen.getByText('処理中')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();

    // 2. fetch の引数検証
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/users/block',
        expect.objectContaining({
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: targetUserId,
            blockerId: 'my-id-123',
          }),
        })
      );
    });
  });

  test('ブロック解除成功時、対象のIDが除外された状態で onUpdateUser が呼ばれること', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    render(
      <SelectUnlock userId={targetUserId} user={mockUser as any} onUpdateUser={mockOnUpdateUser} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'ブロック解除' }));

    await waitFor(() => {
      // 親に渡される blockedUsers から 'target-user-999' が消えていることを確認
      expect(mockOnUpdateUser).toHaveBeenCalledWith(
        expect.objectContaining({
          blockedUsers: ['other-user-000'], // target-user-999 が除外されている
        })
      );
      expect(toast.success).toHaveBeenCalledWith('ブロックを解除しました');
    });
  });

  test('APIエラー時にトーストが表示され、ローディングが終了すること', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false } as Response);

    render(
      <SelectUnlock userId={targetUserId} user={mockUser as any} onUpdateUser={mockOnUpdateUser} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'ブロック解除' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('エラーが発生しました。再度お試しください。');
    });

    // ボタンが再度活性化していることを確認
    expect(screen.getByRole('button', { name: 'ブロック解除' })).not.toBeDisabled();
  });
});
