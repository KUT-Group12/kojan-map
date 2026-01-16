import { render, screen, fireEvent } from '@testing-library/react';
import { SelectBlock } from '../components/SelectBlock';
import { toast } from 'sonner';

// sonnerのtoastをモック化
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('SelectBlock コンポーネント', () => {
  const mockOnBlockUser = jest.fn();
  const mockOnClose = jest.fn();
  const userId = 'user-123';

  beforeEach(() => {
    jest.clearAllMocks();
    // window.confirm をモック化（デフォルトは true を返すように設定）
    jest.spyOn(window, 'confirm').mockImplementation(() => true);
  });

  afterEach(() => {
    // スパイを解除して元の状態に戻す
    jest.restoreAllMocks();
  });

  test('ブロックボタンが表示されていること', () => {
    render(<SelectBlock userId={userId} onBlockUser={mockOnBlockUser} onClose={mockOnClose} />);

    expect(screen.getByRole('button', { name: /ブロック/i })).toBeInTheDocument();
  });

  test('確認ダイアログで「OK」を押すとブロック処理が実行されること', () => {
    render(<SelectBlock userId={userId} onBlockUser={mockOnBlockUser} onClose={mockOnClose} />);

    const button = screen.getByRole('button', { name: /ブロック/i });
    fireEvent.click(button);

    // confirmが呼ばれたか
    expect(window.confirm).toHaveBeenCalledWith('このユーザーをブロックしますか？');
    // 親の関数が呼ばれたか
    expect(mockOnBlockUser).toHaveBeenCalledWith(userId);
    // 成功トーストが表示されたか
    expect(toast.success).toHaveBeenCalledWith('ユーザーをブロックしました');
    // 閉じる処理が呼ばれたか
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('確認ダイアログで「キャンセル」を押すと処理が中断されること', () => {
    // このテストケースだけ confirm が false を返すように設定
    (window.confirm as jest.Mock).mockReturnValue(false);

    render(<SelectBlock userId={userId} onBlockUser={mockOnBlockUser} onClose={mockOnClose} />);

    const button = screen.getByRole('button', { name: /ブロック/i });
    fireEvent.click(button);

    // confirmは呼ばれるが、その先の処理は実行されない
    expect(window.confirm).toHaveBeenCalled();
    expect(mockOnBlockUser).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('ブロック処理中にエラーが発生した場合、エラートーストが表示されること', () => {
    // onBlockUser がエラーを投げるように設定
    mockOnBlockUser.mockImplementation(() => {
      throw new Error('API Error');
    });

    // console.error を一時的に消す（ログを汚さないため）
    jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<SelectBlock userId={userId} onBlockUser={mockOnBlockUser} onClose={mockOnClose} />);

    const button = screen.getByRole('button', { name: /ブロック/i });
    fireEvent.click(button);

    expect(toast.error).toHaveBeenCalledWith('ブロック処理に失敗しました');
  });
});
