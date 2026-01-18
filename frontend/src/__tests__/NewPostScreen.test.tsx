import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NewPostScreen } from '../components/NewPostScreen';
import { User } from '../types';
import { toast } from 'sonner';

// sonnerのtoastをモック化
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('NewPostScreen コンポーネント', () => {
  const mockUser: User = {
    id: 'u1',
    role: 'general',
    name: 'テストユーザー',
  } as any;

  const mockOnClose = jest.fn();
  const mockOnCreate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('初期状態でフォーム要素が正しく表示されていること', () => {
    render(
      <NewPostScreen
        user={mockUser}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
        initialLatitude={33.6}
        initialLongitude={133.7}
      />
    );

    expect(screen.getByLabelText(/タイトル/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/説明/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('33.6')).toBeInTheDocument();
    expect(screen.getByDisplayValue('133.7')).toBeInTheDocument();
  });

  test('未入力で送信しようとするとエラーが発生すること', () => {
    render(<NewPostScreen user={mockUser} onClose={mockOnClose} onCreate={mockOnCreate} />);

    // role="form" ではなく、data-testid で確実に取得
    const form = screen.getByTestId('new-post-form');
    fireEvent.submit(form);

    expect(toast.error).toHaveBeenCalledWith('タイトルを入力してください');
    expect(mockOnCreate).not.toHaveBeenCalled();
  });

  test('画像アップロードが機能すること', async () => {
    render(<NewPostScreen user={mockUser} onClose={mockOnClose} onCreate={mockOnCreate} />);

    const file = new File(['hello'], 'test-image.png', { type: 'image/png' });

    // hidden: true を指定して、非表示のinputを取得
    const input = screen.getByTestId('file-input');

    fireEvent.change(input, { target: { files: [file] } });

    // 画像プレビューが表示されるのを待つ
    const previewImage = await screen.findByAltText(/投稿画像 1/i);
    expect(previewImage).toBeInTheDocument();
  });

  test('フォームをすべて入力して送信すると、onCreate が呼ばれること', async () => {
    // 1. 不足していた引数（user, onClose）を正しく渡す
    render(<NewPostScreen user={mockUser} onClose={mockOnClose} onCreate={mockOnCreate} />);

    // 2. 必須項目を入力する
    fireEvent.change(screen.getByLabelText(/タイトル/i), {
      target: { value: 'テストタイトル' },
    });
    fireEvent.change(screen.getByLabelText(/説明/i), {
      target: { value: 'テストの説明文です' },
    });

    // 3. 送信ボタンをクリック
    const submitButton = screen.getByRole('button', { name: /投稿する/i });
    fireEvent.click(submitButton);

    // 4. 非同期処理（onCreate や toast）を待機して検証
    await waitFor(() => {
      expect(mockOnCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'テストタイトル',
          description: 'テストの説明文です',
        })
      );
    });

    expect(toast.success).toHaveBeenCalledWith('投稿しました！');
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('事業者ユーザーの場合、事業者向けのメッセージが表示されること', () => {
    const businessUser = { ...mockUser, role: 'business', businessName: 'やまっぷ商店' } as User;
    render(<NewPostScreen user={businessUser} onClose={mockOnClose} onCreate={mockOnCreate} />);

    expect(screen.getByText(/事業者名「やまっぷ商店」として投稿されます/i)).toBeInTheDocument();
  });
});
