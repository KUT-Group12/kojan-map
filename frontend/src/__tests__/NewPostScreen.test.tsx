import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NewPostScreen } from '../components/NewPostScreen';
import { toast } from 'sonner';

// toast のモック
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('NewPostScreen コンポーネント', () => {
  const mockUser = { googleId: 'user-1', role: 'general' };
  const mockOnClose = jest.fn();
  const mockOnCreate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('初期表示が正しいこと', () => {
    render(<NewPostScreen user={mockUser as any} onClose={mockOnClose} onCreate={mockOnCreate} />);

    expect(screen.getByText('新規投稿')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('投稿のタイトルを入力')).toBeInTheDocument();
  });

  test('タイトルのバリデーション（空文字）でエラーが表示されること', async () => {
    render(<NewPostScreen user={mockUser as any} onClose={mockOnClose} onCreate={mockOnCreate} />);

    // タイトルを空にして送信
    fireEvent.change(screen.getByPlaceholderText('投稿のタイトルを入力'), {
      target: { value: '' },
    });
    fireEvent.submit(screen.getByTestId('new-post-form'));

    expect(toast.error).toHaveBeenCalledWith('タイトルを入力してください');
    expect(mockOnCreate).not.toHaveBeenCalled();
  });

  test('タイトルのバリデーション（50文字超）でエラーが表示されること', async () => {
    render(<NewPostScreen user={mockUser as any} onClose={mockOnClose} onCreate={mockOnCreate} />);

    const longTitle = 'a'.repeat(51);
    fireEvent.change(screen.getByPlaceholderText('投稿のタイトルを入力'), {
      target: { value: longTitle },
    });
    fireEvent.submit(screen.getByTestId('new-post-form'));

    expect(toast.error).toHaveBeenCalledWith('タイトルは50文字以内で入力してください');
  });

  test('画像をアップロードした際に、Base64としてプレビューが表示されること', async () => {
    render(<NewPostScreen user={mockUser as any} onClose={mockOnClose} onCreate={mockOnCreate} />);

    // 擬似的な画像ファイルを作成
    const file = new File(['hello'], 'test.png', { type: 'image/png' });
    const input = screen.getByTestId('file-input');

    // ファイル選択イベントを発火
    fireEvent.change(input, { target: { files: [file] } });

    // 画像が読み込まれ、削除ボタン（×）が表示されるのを待機
    await waitFor(() => {
      expect(screen.getByLabelText('画像 1 を削除')).toBeInTheDocument();
    });
  });

  test('正常に情報を入力して「投稿する」と、onCreateが呼ばれダイアログが閉じること', async () => {
    render(
      <NewPostScreen
        user={mockUser as any}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
        initialLatitude={35.0}
        initialLongitude={135.0}
      />
    );

    // 各項目を入力
    fireEvent.change(screen.getByPlaceholderText('投稿のタイトルを入力'), {
      target: { value: 'テストタイトル' },
    });
    fireEvent.change(screen.getByPlaceholderText('詳しい説明を入力してください'), {
      target: { value: 'テストの説明文です' },
    });

    // 緯度経度はPropsから初期値が入っているか確認
    expect(screen.getByLabelText('緯度 *')).toHaveValue(35.0);

    // 送信
    fireEvent.submit(screen.getByTestId('new-post-form'));

    await waitFor(() => {
      expect(mockOnCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'テストタイトル',
          text: 'テストの説明文です',
          latitude: 35.0,
          longitude: 135.0,
        })
      );
    });

    expect(toast.success).toHaveBeenCalledWith('投稿しました！');
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('事業者の場合、事業者名が表示されること', () => {
    const businessUser = { googleId: 'biz-1', role: 'business' };
    const businessData = { businessName: 'テストカフェ' };

    render(
      <NewPostScreen
        user={businessUser as any}
        businessData={businessData as any}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
      />
    );

    expect(screen.getByText(/事業者名「テストカフェ」として投稿されます/)).toBeInTheDocument();
  });
});
