import { render, screen, waitFor } from '@testing-library/react';
<<<<<<< HEAD
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
=======
import { UserBlockViewScreen } from '../components/UserBlockViewScreen';

// fetchのモック設定
const fetchMock = jest.fn() as jest.Mock;

// 子コンポーネント (SelectUnlock) のモック化
// 複雑なロジックを持つ子コンポーネントをモックすることで、このコンポーネント自体のテストをシンプルにします
jest.mock('../components/SelectUnlock', () => ({
  SelectUnlock: () => <button>解除ボタン</button>,
}));

describe('UserBlockViewScreen コンポーネント', () => {
  const mockUser = {
    googleId: 'me-123',
    name: '自分',
    blockedUsers: [], // 初期状態は空
  };
  const mockOnUpdateUser = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    window.fetch = fetchMock;
    fetchMock.mockReset();
  });

  test('マウント時にローディングが表示され、APIが呼ばれること', async () => {
    // 解決を遅らせることでローディング状態を確認
    fetchMock.mockReturnValue(new Promise(() => {}));

    render(<UserBlockViewScreen user={mockUser as any} onUpdateUser={mockOnUpdateUser} />);

    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/users/block/list?googleId=me-123')
    );
  });

  test('ブロックリストが空の場合、専用のメッセージが表示されること', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ blocks: [] }),
    } as Response);

    render(<UserBlockViewScreen user={mockUser as any} onUpdateUser={mockOnUpdateUser} />);
>>>>>>> main

    await waitFor(() => {
      expect(screen.getByText('ブロックしたユーザーはいません')).toBeInTheDocument();
    });
  });

<<<<<<< HEAD
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
=======
  test('APIからリストを取得後、親コンポーネントの更新関数が呼ばれ、リストが表示されること', async () => {
    // モックデータ: APIは blockedId を含むオブジェクトの配列を返す仕様
    const mockApiResponse = {
      blocks: [
        { id: 1, blockedId: 'target-user-A', blockerId: 'me-123' },
        { id: 2, blockedId: 'target-user-B', blockerId: 'me-123' },
      ],
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    } as Response);

    // テスト環境で user プロパティが更新された後の表示をシミュレートするため、
    // ここでは blockedUsers を持った状態を render に渡すか、
    // 内部状態の反映を待ちます。
    const { rerender } = render(
      <UserBlockViewScreen user={mockUser as any} onUpdateUser={mockOnUpdateUser} />
    );

    // 1. API取得後の親への通知を検証
    await waitFor(() => {
      expect(mockOnUpdateUser).toHaveBeenCalledWith(
        expect.objectContaining({
          blockedUsers: ['target-user-A', 'target-user-B'],
        })
      );
    });

    // 2. 親から新しい user (blockedUsers入り) が降ってきたと仮定して再描画
    const updatedUser = { ...mockUser, blockedUsers: ['target-user-A', 'target-user-B'] };
    rerender(<UserBlockViewScreen user={updatedUser as any} onUpdateUser={mockOnUpdateUser} />);

    // 3. 画面にIDが表示されているか確認
    expect(screen.getByText('ユーザーID: target-user-A')).toBeInTheDocument();
    expect(screen.getByText('ユーザーID: target-user-B')).toBeInTheDocument();
    expect(screen.getAllByText('解除ボタン')).toHaveLength(2);
  });

  test('APIエラー時にローディングが終了し、コンソールにエラーが出力されること', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    fetchMock.mockResolvedValueOnce({ ok: false } as Response);

    render(<UserBlockViewScreen user={mockUser as any} onUpdateUser={mockOnUpdateUser} />);
>>>>>>> main

    await waitFor(() => {
      expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument();
    });
<<<<<<< HEAD
=======
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
>>>>>>> main
  });
});
