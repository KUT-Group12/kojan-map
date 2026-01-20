import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserInputBusinessApplication } from '../components/UserInputBusinessApplication';
import { toast } from 'sonner';

// fetchのモック設定
const fetchMock = jest.fn() as jest.Mock;

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('UserInputBusinessApplication コンポーネント', () => {
  const mockUser = { googleId: 'google-123' };
  const mockOnUpdateUser = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    window.fetch = fetchMock;
    fetchMock.mockReset(); // fetchの履歴をリセット
  });

  test('正常に入力して申請すると API が呼ばれること', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true } as Response);

    render(
      <UserInputBusinessApplication
        user={mockUser as any}
        onUpdateUser={mockOnUpdateUser}
        onCancel={mockOnCancel}
      />
    );

    // 1. 各フィールドに入力
    // inputを特定して値を変更。changeイベントを確実に発火させる
    fireEvent.change(screen.getByPlaceholderText('店舗名'), {
      target: { value: 'カフェ・テスト' },
    });
    fireEvent.change(screen.getByPlaceholderText('電話番号'), { target: { value: '09012345678' } });
    fireEvent.change(screen.getByPlaceholderText('住所'), { target: { value: '高知県香美市' } });

    // 2. 申請ボタンをクリック
    const submitButton = screen.getByRole('button', { name: '申請する' });
    fireEvent.click(submitButton);

    // 3. fetchが呼ばれるのを待機
    await waitFor(
      () => {
        expect(fetchMock).toHaveBeenCalledTimes(1);
      },
      { timeout: 2000 }
    ); // 少し長めに待機

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/business/apply',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"businessName":"カフェ・テスト"'),
      })
    );
  });
});
