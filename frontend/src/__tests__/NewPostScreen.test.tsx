import { render, screen, fireEvent, waitFor } from '@testing-library/react';
<<<<<<< HEAD
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from 'sonner';

// sonnerのモック
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// FileReaderのモック
class MockFileReader {
  result = '';
  onload: any = null;
  readAsDataURL() {
    this.result = 'data:image/png;base64,mockdata';
    setTimeout(() => this.onload && this.onload(), 0);
  }
}
vi.stubGlobal('FileReader', MockFileReader);

describe('NewPostScreen', () => {
  const mockUser = { id: 'u1', name: '一般ユーザー', role: 'user' } as any;
  const mockOnClose = vi.fn();
  const mockOnCreate = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv('VITE_API_URL', 'http://test-api.com');
    global.fetch = vi.fn();
  });

  const renderComponent = async (props = {}) => {
    const { NewPostScreen } = await import('../components/NewPostScreen');
    return render(
      <NewPostScreen user={mockUser} onClose={mockOnClose} onCreate={mockOnCreate} {...props} />
    );
  };

  it('フォームに値を入力して送信するとAPIが正しく呼ばれること', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ postId: 123 }),
    });

    await renderComponent();

    // 入力操作
    fireEvent.change(screen.getByLabelText(/タイトル \*/), { target: { value: '美味しいランチ' } });
    fireEvent.change(screen.getByLabelText(/説明 \*/), {
      target: { value: '駅前のカレー屋さんが最高でした。' },
    });

    // 送信
    const form = screen.getByTestId('new-post-form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://test-api.com/api/posts',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"title":"美味しいランチ"'),
        })
      );
      expect(mockOnCreate).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('投稿しました！');
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('タイトルの文字数制限バリデーションが機能すること', async () => {
    await renderComponent();

    const longTitle = 'a'.repeat(51);
    fireEvent.change(screen.getByLabelText(/タイトル \*/), { target: { value: longTitle } });
=======
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
>>>>>>> main

    const form = screen.getByTestId('new-post-form');
    fireEvent.submit(form);

    expect(toast.error).toHaveBeenCalledWith('タイトルは50文字以内で入力してください');
<<<<<<< HEAD
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('画像を選択したとき、Base64に変換されてプレビューが表示されること', async () => {
    await renderComponent();
=======
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
>>>>>>> main

    const file = new File(['hello'], 'test.png', { type: 'image/png' });
    const input = screen.getByTestId('file-input');

<<<<<<< HEAD
    // ファイル選択イベントのシミュレート
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      // FileReaderのモックが返したデータがimgのsrcにあるか確認
      const previewImages = screen.getAllByRole('img');
      expect(previewImages[0]).toHaveAttribute('src', 'data:image/png;base64,mockdata');
    });
  });

  it('初期座標が渡された場合、入力欄に反映されていること', async () => {
    await renderComponent({
      initialLatitude: 35.6895,
      initialLongitude: 139.6917,
    });

    expect(screen.getByLabelText(/緯度 \*/)).toHaveValue(35.6895);
    expect(screen.getByLabelText(/経度 \*/)).toHaveValue(139.6917);
  });

  it('事業者ユーザーの場合、事業者名が表示されること', async () => {
    const businessUser = { id: 'b1', name: '店主', role: 'business' } as any;
    const businessData = { businessName: 'カレーショップXYZ' } as any;

    await renderComponent({ user: businessUser, businessData });

    expect(screen.getByText(/カレーショップXYZ/)).toBeInTheDocument();
=======
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
>>>>>>> main
  });
});
