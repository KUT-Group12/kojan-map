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
=======
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SelectUnlock } from '../components/SelectUnlock';
import { toast } from 'sonner';

// fetchのモック設定
const fetchMock = jest.fn() as jest.Mock;

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
    window.fetch = fetchMock;
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
>>>>>>> main
        expect.objectContaining({
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
<<<<<<< HEAD
            userId: mockTargetUserId,
            blockerId: mockCurrentUser.id,
=======
            userId: targetUserId,
            blockerId: 'my-id-123',
>>>>>>> main
          }),
        })
      );
    });
  });

<<<<<<< HEAD
  it('ブロック解除成功時、状態が更新されトーストが表示されること', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'success' }),
    });

    await renderComponent();
=======
  test('ブロック解除成功時、対象のIDが除外された状態で onUpdateUser が呼ばれること', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    render(
      <SelectUnlock userId={targetUserId} user={mockUser as any} onUpdateUser={mockOnUpdateUser} />
    );
>>>>>>> main

    fireEvent.click(screen.getByRole('button', { name: 'ブロック解除' }));

    await waitFor(() => {
<<<<<<< HEAD
      // onUpdateUserが、ターゲットIDを除いたリストで呼ばれているか確認
      expect(mockOnUpdateUser).toHaveBeenCalledWith(
        expect.objectContaining({
          blockedUsers: ['other-user-000'], // target-user-999が消えている
=======
      // 親に渡される blockedUsers から 'target-user-999' が消えていることを確認
      expect(mockOnUpdateUser).toHaveBeenCalledWith(
        expect.objectContaining({
          blockedUsers: ['other-user-000'], // target-user-999 が除外されている
>>>>>>> main
        })
      );
      expect(toast.success).toHaveBeenCalledWith('ブロックを解除しました');
    });
  });

<<<<<<< HEAD
  it('APIエラー時にエラー通知が表示されること', async () => {
    (global.fetch as any).mockResolvedValueOnce({ ok: false });

    await renderComponent();
=======
  test('APIエラー時にトーストが表示され、ローディングが終了すること', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false } as Response);

    render(
      <SelectUnlock userId={targetUserId} user={mockUser as any} onUpdateUser={mockOnUpdateUser} />
    );
>>>>>>> main

    fireEvent.click(screen.getByRole('button', { name: 'ブロック解除' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('エラーが発生しました。再度お試しください。');
<<<<<<< HEAD
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
=======
    });

    // ボタンが再度活性化していることを確認
    expect(screen.getByRole('button', { name: 'ブロック解除' })).not.toBeDisabled();
>>>>>>> main
  });
});
