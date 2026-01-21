import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserBlockViewScreen } from '../components/UserBlockViewScreen';
import { User } from '../types';

// fetch のモック
vi.stubGlobal('fetch', vi.fn());

// 子コンポーネント SelectUnlock のモック
vi.mock('../components/SelectUnlock', () => ({
  SelectUnlock: ({ userId }: { userId: string }) => <button>解除ボタン:{userId}</button>,
}));

// レイアウト用コンポーネント DisplayUserSetting のモック
vi.mock('../components/DisplayUserSetting', () => ({
  DisplayUserSetting: ({ title, children }: any) => (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  ),
}));

describe('UserBlockViewScreen', () => {
  const mockUser: User = {
    googleId: 'my-google-id',
    gmail: 'test@gmail.com',
    role: 'user',
    registrationDate: new Date().toISOString(),
    fromName: '自分',
    // 初期状態では空
    blockedUsers: [],
  };

  const mockOnUpdateUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const getFetchMock = () => globalThis.fetch as any;

  it('初期レンダリング時にローディングが表示され、APIが呼ばれること', async () => {
    getFetchMock().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ blocks: [] }),
    });

    render(<UserBlockViewScreen user={mockUser} onUpdateUser={mockOnUpdateUser} />);

    // ローディングテキストの確認
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();

    await waitFor(() => {
      expect(getFetchMock()).toHaveBeenCalledWith(
        expect.stringContaining(`/api/users/block/list?googleId=${mockUser.googleId}`)
      );
    });
  });

  it('ブロックユーザーがいる場合、親コンポーネントを更新し、リストを表示すること', async () => {
    // APIレスポンス: ブロックされている相手のIDが含まれる
    const mockApiResponse = {
      blocks: [
        { id: 1, blockedId: 'blocked-user-1', blockerId: 'my-google-id' },
        { id: 2, blockedId: 'blocked-user-2', blockerId: 'my-google-id' },
      ],
    };

    getFetchMock().mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    });

    // テスト用に、既に更新された状態のユーザー情報を模倣して再レンダリングを想定
    const userWithBlocks = {
      ...mockUser,
      blockedUsers: ['blocked-user-1', 'blocked-user-2'],
    };

    const { rerender } = render(
      <UserBlockViewScreen user={mockUser} onUpdateUser={mockOnUpdateUser} />
    );

    // 1. API取得後に onUpdateUser が正しいデータで呼ばれたか確認
    await waitFor(() => {
      expect(mockOnUpdateUser).toHaveBeenCalledWith(
        expect.objectContaining({
          blockedUsers: ['blocked-user-1', 'blocked-user-2'],
        })
      );
    });

    // 2. プロパティが更新されたと仮定して再レンダリングし、表示を確認
    rerender(<UserBlockViewScreen user={userWithBlocks} onUpdateUser={mockOnUpdateUser} />);

    expect(screen.getByText('ユーザーID: blocked-user-1')).toBeInTheDocument();
    expect(screen.getByText('ユーザーID: blocked-user-2')).toBeInTheDocument();
    expect(screen.getByText('解除ボタン:blocked-user-1')).toBeInTheDocument();
  });

  it('ブロックしたユーザーがいない場合、空のメッセージを表示すること', async () => {
    getFetchMock().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ blocks: [] }),
    });

    render(<UserBlockViewScreen user={mockUser} onUpdateUser={mockOnUpdateUser} />);

    await waitFor(() => {
      expect(screen.getByText('ブロックしたユーザーはいません')).toBeInTheDocument();
    });
  });
});
