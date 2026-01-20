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
  const defaultProps = {
    postId: 101,
    userId: 'user-123',
    isReacted: false,
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
    const button = screen.getByRole('button', { name: '事業者はリアクション不可' });
    expect(button).toBeDisabled();
  });

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

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('通信エラーが発生しました');
    });
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
  });
});
