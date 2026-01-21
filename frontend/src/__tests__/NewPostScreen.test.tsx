import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

    const form = screen.getByTestId('new-post-form');
    fireEvent.submit(form);

    expect(toast.error).toHaveBeenCalledWith('タイトルは50文字以内で入力してください');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('画像を選択したとき、Base64に変換されてプレビューが表示されること', async () => {
    await renderComponent();

    const file = new File(['hello'], 'test.png', { type: 'image/png' });
    const input = screen.getByTestId('file-input');

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
  });
});
