import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NewPostScreen } from '../components/NewPostScreen';
import { toast } from 'sonner';

// fetchのモック
const fetchMock = jest.fn() as jest.Mock;

// toastのモック
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('NewPostScreen コンポーネント', () => {
  const mockUser = { googleId: 'google-user-123', role: 'general' };
  const mockOnClose = jest.fn();
  const mockOnCreate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    window.fetch = fetchMock;
    fetchMock.mockReset();
  });

  test('初期値（緯度・経度）が正しく反映されていること', () => {
    render(
      <NewPostScreen
        user={mockUser as any}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
        initialLatitude={35.1234}
        initialLongitude={135.5678}
      />
    );

    expect(screen.getByLabelText(/緯度/)).toHaveValue(35.1234);
    expect(screen.getByLabelText(/経度/)).toHaveValue(135.5678);
  });

  test('バリデーション：タイトルが50文字を超えるとエラーになること', async () => {
    render(<NewPostScreen user={mockUser as any} onClose={mockOnClose} onCreate={mockOnCreate} />);

    const longTitle = 'あ'.repeat(51);
    fireEvent.change(screen.getByLabelText(/タイトル/), { target: { value: longTitle } });
    fireEvent.change(screen.getByLabelText(/説明/), { target: { value: 'テスト説明' } });

    const form = screen.getByTestId('new-post-form');
    fireEvent.submit(form);

    expect(toast.error).toHaveBeenCalledWith('タイトルは50文字以内で入力してください');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('正常に入力して投稿するとAPIが呼ばれ、onCreateとonCloseが実行されること', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ postId: 999 }),
    } as Response);

    render(<NewPostScreen user={mockUser as any} onClose={mockOnClose} onCreate={mockOnCreate} />);

    // 入力
    fireEvent.change(screen.getByLabelText(/タイトル/), { target: { value: 'おいしいお店' } });
    fireEvent.change(screen.getByLabelText(/説明/), { target: { value: '高知のランチです' } });

    // フォーム送信
    const form = screen.getByTestId('new-post-form');
    fireEvent.submit(form);

    await waitFor(() => {
      // APIリクエストの検証
      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:8080/api/posts',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"title":"おいしいお店"'),
        })
      );
    });

    expect(mockOnCreate).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('投稿しました！');
  });

  test('画像をアップロードするとプレビューが表示されること', async () => {
    render(<NewPostScreen user={mockUser as any} onClose={mockOnClose} onCreate={mockOnCreate} />);

    const file = new File(['hello'], 'test.png', { type: 'image/png' });
    const input = screen.getByTestId('file-input');

    // ファイル選択イベントの発火
    fireEvent.change(input, { target: { files: [file] } });

    // FileReaderが非同期で完了するのを待つ
    await waitFor(() => {
      const previewImg = screen.getByAltText('投稿画像 1');
      expect(previewImg).toBeInTheDocument();
    });

    // 削除ボタンの動作確認
    const deleteBtn = screen.getByLabelText('画像 1 を削除');
    fireEvent.click(deleteBtn);
    expect(screen.queryByAltText('投稿画像 1')).not.toBeInTheDocument();
  });

  test('APIエラー時にトーストを表示し、画面を閉じないこと', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Server Down'));

    render(<NewPostScreen user={mockUser as any} onClose={mockOnClose} onCreate={mockOnCreate} />);

    fireEvent.change(screen.getByLabelText(/タイトル/), { target: { value: 'エラーテスト' } });
    fireEvent.change(screen.getByLabelText(/説明/), { target: { value: '説明' } });

    fireEvent.submit(screen.getByTestId('new-post-form'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('投稿に失敗しました'));
    });

    // 画面が閉じられていない（onCreateが呼ばれていない）ことを確認
    expect(mockOnCreate).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
