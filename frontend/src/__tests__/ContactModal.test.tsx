import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ContactModal } from '../components/ContactModal';
import { User } from '../types';
import { toast } from 'sonner';

// 1. import.meta.env のモック (SyntaxError 回避)
vi.stubGlobal('import', {
  meta: {
    env: {
      VITE_API_URL: 'http://localhost:8080',
    },
  },
});

// sonner の toast をモック
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ContactModal', () => {
  const mockUser: User = {
    googleId: 'test-id',
    gmail: 'test@gmail.com',
    role: 'general',
    registrationDate: new Date().toISOString(),
    fromName: 'テスト太郎',
  };

  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  const getFetchMock = () => globalThis.fetch as any;

  it('初期表示が正しいこと', () => {
    render(<ContactModal user={mockUser} onClose={mockOnClose} />);

    expect(screen.getByText('お問い合わせ')).toBeInTheDocument();
    expect(screen.getByText(new RegExp(mockUser.gmail))).toBeInTheDocument();
    expect(screen.getByPlaceholderText('お問い合わせの件名')).toBeInTheDocument();
  });

  it('入力がない状態で送信するとエラーを表示すること', async () => {
    render(<ContactModal user={mockUser} onClose={mockOnClose} />);

    // ボタンではなく form 自体を取得して submit を発火させる
    const form = screen.getByRole('form'); // form に aria-label="contact-form" がない場合は以下
    // const form = document.querySelector('form')!;

    fireEvent.submit(form);

    expect(toast.error).toHaveBeenCalledWith('件名とメッセージを入力してください');
  });

  it('フォーム送信中にボタンが「送信中...」になり無効化されること', async () => {
    // 意図的にレスポンスを遅らせる
    getFetchMock().mockReturnValue(
      new Promise((resolve) => setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 100))
    );

    render(<ContactModal user={mockUser} onClose={mockOnClose} />);

    fireEvent.change(screen.getByPlaceholderText('お問い合わせの件名'), {
      target: { value: '相談' },
    });
    fireEvent.change(screen.getByPlaceholderText('お問い合わせ内容を詳しくご記入ください'), {
      target: { value: '内容' },
    });

    fireEvent.click(screen.getByText('送信する'));

    // 送信中状態の確認
    expect(screen.getByText('送信中...')).toBeInTheDocument();
    expect(screen.getByText('送信中...')).toBeDisabled();
    expect(screen.getByPlaceholderText('お問い合わせの件名')).toBeDisabled();
  });

  it('API送信に成功したとき、成功トーストを表示して閉じること', async () => {
    getFetchMock().mockResolvedValue({
      ok: true,
      json: async () => ({ message: '送信完了しました' }),
    });

    render(<ContactModal user={mockUser} onClose={mockOnClose} />);

    fireEvent.change(screen.getByLabelText('件名 *'), { target: { value: 'バグ報告' } });
    fireEvent.change(screen.getByLabelText('メッセージ *'), {
      target: { value: '地図が動きません' },
    });

    fireEvent.click(screen.getByText('送信する'));

    await waitFor(() => {
      // APIリクエストの内容確認
      expect(getFetchMock()).toHaveBeenCalledWith(
        expect.stringContaining('/api/contact/validate'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ subject: 'バグ報告', text: '地図が動きません' }),
        })
      );
      expect(toast.success).toHaveBeenCalledWith('送信完了しました');
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('APIエラー時にエラートーストを表示すること', async () => {
    getFetchMock().mockResolvedValue({
      ok: false,
    });

    render(<ContactModal user={mockUser} onClose={mockOnClose} />);

    fireEvent.change(screen.getByLabelText('件名 *'), { target: { value: '質問' } });
    fireEvent.change(screen.getByLabelText('メッセージ *'), { target: { value: 'テスト' } });

    fireEvent.click(screen.getByText('送信する'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'エラーが発生しました。時間をおいて再度お試しください。'
      );
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  it('キャンセルボタンを押すと onClose が呼ばれること', () => {
    render(<ContactModal user={mockUser} onClose={mockOnClose} />);
    fireEvent.click(screen.getByText('キャンセル'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
