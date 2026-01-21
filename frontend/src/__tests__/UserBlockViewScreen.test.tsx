import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserBlockViewScreen } from '../components/UserBlockViewScreen';

describe('UserBlockViewScreen', () => {
  const mockUser = {
    id: 'my-google-id',
    name: 'テストユーザー',
    blockedUsers: [],
  } as any;
  const mockOnUpdateUser = vi.fn();
  const TEST_API_URL = 'http://test-api.com';

  const mockApiResponse = {
    blocks: [
      { id: 1, blockedId: 'target-user-1', blockerId: 'my-google-id' },
      { id: 2, blockedId: 'target-user-2', blockerId: 'my-google-id' },
    ],
  };

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv('VITE_API_URL', TEST_API_URL);
    global.fetch = vi.fn();
  });

  const renderComponent = async () => {
    // SelectUnlockなど子コンポーネントも含まれるため動的インポートを推奨
    const { UserBlockViewScreen } = await import('../components/UserBlockViewScreen');
    return render(<UserBlockViewScreen user={mockUser} onUpdateUser={mockOnUpdateUser} />);
  };

  it('マウント時にブロックリストを取得し、親の状態を更新すること', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    });

    await renderComponent();

    // 正しいURLでfetchが呼ばれたか
    expect(global.fetch).toHaveBeenCalledWith(
      `${TEST_API_URL}/api/users/block/list?googleId=${mockUser.id}`
    );

    await waitFor(() => {
      // APIから取得した blockedId の配列で onUpdateUser が呼ばれたか
      expect(mockOnUpdateUser).toHaveBeenCalledWith(
        expect.objectContaining({
          blockedUsers: ['target-user-1', 'target-user-2'],
        })
      );
    });
  });

  it('ブロックリストが空の場合、適切なメッセージが表示されること', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ blocks: [] }),
    });

    await renderComponent();

    await waitFor(() => {
      expect(screen.getByText('ブロックしたユーザーはいません')).toBeInTheDocument();
    });
  });

  it('読み込み中にローディング表示がされること', async () => {
    // 通信を終わらせない
    (global.fetch as any).mockReturnValue(new Promise(() => {}));

    await renderComponent();

    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    // LucideのLoader2アイコン（animate-spin）があるか
    const loader = document.querySelector('.animate-spin');
    expect(loader).toBeInTheDocument();
  });

  it('APIエラー時にローディングが終了すること', async () => {
    console.error = vi.fn(); // エラーログを抑制
    (global.fetch as any).mockRejectedValueOnce(new Error('API Error'));

    await renderComponent();

    await waitFor(() => {
      expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument();
    });
  });
});
