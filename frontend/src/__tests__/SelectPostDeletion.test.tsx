import { render, screen, fireEvent } from '@testing-library/react';
import { SelectPostDeletion } from '../components/SelectPostDeletion';
import { toast } from 'sonner';

// sonnerのtoastをモック化
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('SelectPostDeletion コンポーネント', () => {
  const mockOnDelete = jest.fn();
  const mockOnClose = jest.fn();
  const pinId = 'pin-123';

  beforeEach(() => {
    jest.clearAllMocks();
    // window.confirm をモック化（デフォルトは true = OK を返す）
    jest.spyOn(window, 'confirm').mockImplementation(() => true);
  });

  afterEach(() => {
    // スパイを解除
    jest.restoreAllMocks();
  });

  test('削除ボタンが正しく表示されていること', () => {
    render(
      <SelectPostDeletion pinId={pinId} onDelete={mockOnDelete} onClose={mockOnClose} />
    );

    const deleteButton = screen.getByRole('button', { name: /削除/i });
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton.querySelector('svg')).toBeInTheDocument(); // Trash2アイコンの確認
  });

  test('確認ダイアログで「OK」を押すと削除処理が実行されること', () => {
    render(
      <SelectPostDeletion pinId={pinId} onDelete={mockOnDelete} onClose={mockOnClose} />
    );

    const deleteButton = screen.getByRole('button', { name: /削除/i });
    fireEvent.click(deleteButton);

    // confirmが呼ばれたか
    expect(window.confirm).toHaveBeenCalledWith('この投稿を削除してもよろしいですか？');
    // onDeleteが正しいIDで呼ばれたか
    expect(mockOnDelete).toHaveBeenCalledWith(pinId);
    // 成功トーストが表示されたか
    expect(toast.success).toHaveBeenCalledWith('投稿を削除しました');
    // 画面を閉じる処理が呼ばれたか
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('確認ダイアログで「キャンセル」を押すと削除処理が中断されること', () => {
    // confirm が false を返すように設定
    (window.confirm as jest.Mock).mockReturnValue(false);

    render(
      <SelectPostDeletion pinId={pinId} onDelete={mockOnDelete} onClose={mockOnClose} />
    );

    const deleteButton = screen.getByRole('button', { name: /削除/i });
    fireEvent.click(deleteButton);

    // confirmは呼ばれるが、削除処理は実行されない
    expect(window.confirm).toHaveBeenCalled();
    expect(mockOnDelete).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});