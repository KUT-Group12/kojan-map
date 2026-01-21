<<<<<<< HEAD
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

describe('UserTriggerReaction', () => {
=======
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserTriggerReaction } from '../components/UserTriggerReaction';
import { toast } from 'sonner';

// fetch と toast のモック
const fetchMock = jest.fn() as jest.Mock;
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('UserTriggerReaction コンポーネント', () => {
>>>>>>> main
  const defaultProps = {
    postId: 101,
    userId: 'user-123',
    isReacted: false,
<<<<<<< HEAD
    userRole: 'user',
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
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (global.fetch as any).mockResolvedValueOnce({ ok: true });

    render(<UserTriggerReaction {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'リアクション' }));

    // API呼び出しの検証 (POST)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/reactions'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ postId: 101, userId: 'user-123' }),
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

    // API呼び出しの検証 (DELETE)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/reactions'),
      expect.objectContaining({
        method: 'DELETE',
      })
    );

    await waitFor(() => {
      expect(defaultProps.onReaction).toHaveBeenCalledWith(101);
    });
  });

  it('事業者の場合、ボタンが非活性になりメッセージが変わること', () => {
    render(<UserTriggerReaction {...defaultProps} userRole="business" />);

=======
    userRole: 'general',
    isDisabled: false,
    onReaction: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    window.fetch = fetchMock;
    fetchMock.mockReset();
  });

  test('初期表示が正しいこと（リアクション前）', () => {
    render(<UserTriggerReaction {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'リアクション' })).toBeInTheDocument();
  });

  test('事業者の場合、ボタンが非活性になり専用のメッセージが表示されること', () => {
    render(<UserTriggerReaction {...defaultProps} userRole="business" />);
>>>>>>> main
    const button = screen.getByRole('button', { name: '事業者はリアクション不可' });
    expect(button).toBeDisabled();
  });

<<<<<<< HEAD
  it('APIエラー時にエラーメッセージが表示されること', async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockRejectedValueOnce(new Error('Network Error'));

    render(<UserTriggerReaction {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'リアクション' }));
=======
  test('クリック時に正しいAPIリクエスト(POST)が飛び、成功時にonReactionが呼ばれること', async () => {
    (window.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
    });

    render(<UserTriggerReaction {...defaultProps} />);
    const button = screen.getByRole('button', { name: 'リアクション' });

    fireEvent.click(button);

    // 1. ローディング状態の確認
    expect(screen.getByText('処理中...')).toBeInTheDocument();

    // 2. fetchの内容検証
    await waitFor(() => {
      expect(window.fetch as jest.Mock).toHaveBeenCalledWith(
        '/api/reactions',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ postId: 101, userId: 'user-123' }),
        })
      );
    });

    // 3. 親への通知とトーストの確認
    expect(defaultProps.onReaction).toHaveBeenCalledWith(101);
    expect(toast.success).toHaveBeenCalledWith('リアクションしました！');
  });

  test('既にリアクション済みの場合は DELETE メソッドが呼ばれること', async () => {
    (window.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
    });

    render(<UserTriggerReaction {...defaultProps} isReacted={true} />);
    const button = screen.getByRole('button', { name: 'リアクション済み' });

    fireEvent.click(button);

    await waitFor(() => {
      expect(window.fetch as jest.Mock).toHaveBeenCalledWith(
        '/api/reactions',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
    // 解除時はトーストが出ない仕様の確認
    expect(toast.success).not.toHaveBeenCalled();
  });

  test('APIがエラー(500)を返した場合、エラーメッセージが表示されること', async () => {
    (window.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    render(<UserTriggerReaction {...defaultProps} />);
    fireEvent.click(screen.getByRole('button'));
>>>>>>> main

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('通信エラーが発生しました');
    });
<<<<<<< HEAD
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
    expect(screen.getByText('処理中...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
=======
    expect(defaultProps.onReaction).not.toHaveBeenCalled();
  });

  test('通信中にボタンを連打しても、二重にリクエストが飛ばないこと', async () => {
    // 意図的にレスポンスを遅らせる
    (window.fetch as jest.Mock).mockReturnValue(new Promise(() => {}));

    render(<UserTriggerReaction {...defaultProps} />);
    const button = screen.getByRole('button');

    // 2回連続クリック
    fireEvent.click(button);
    fireEvent.click(button);

    expect(window.fetch as jest.Mock).toHaveBeenCalledTimes(1);
>>>>>>> main
  });
});
