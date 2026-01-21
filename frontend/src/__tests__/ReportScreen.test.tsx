<<<<<<< HEAD
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
// 注意: インポート順序によっては影響が出るため、
// コンポーネントのインポートはモックの後に書くか、テスト内で動的インポートします

// 1. sonnerをモック化（関数を直接定義して巻き上げエラーを回避）
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// 2. モックした関数への参照を取得するためのヘルパー（テスト内で expect するため）
// import { toast } from 'sonner' を通じて取得します
import { toast } from 'sonner';

describe('ReportScreen', () => {
  const mockPostId = 101;
  const mockUserId = 'user-999';
  const mockOnReportComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('VITE_API_URL', 'http://test-api.com');
    global.fetch = vi.fn();
  });

  // ヘルパー: 状態を持ったラッパーでレンダリング
  // ※複雑な dynamic import を避け、シンプルな関数コンポーネントとして定義
  const TestWrapper = ({ initialReporting = false }) => {
    const [reporting, setReporting] = React.useState(initialReporting);
    // ここで動的インポートではなく、通常のインポートを使うために
    // ReportScreenはファイル上部で普通にインポートしてOKです
    const { ReportScreen } = require('../components/ReportScreen');
    return (
      <ReportScreen
        postId={mockPostId}
        userId={mockUserId}
        isReporting={reporting}
        setIsReporting={setReporting}
        onReportComplete={mockOnReportComplete}
      />
    );
  };

  it('初期状態では「通報」ボタンのみが表示されていること', async () => {
    const { ReportScreen } = await import('../components/ReportScreen');
    render(
      <ReportScreen
        postId={mockPostId}
        userId={mockUserId}
        isReporting={false}
        setIsReporting={vi.fn()}
        onReportComplete={mockOnReportComplete}
      />
    );

    expect(screen.getByRole('button', { name: /通報/ })).toBeInTheDocument();
  });

  it('理由を入力して送信すると、バックエンドが期待するキー名でAPIが呼ばれること', async () => {
    (global.fetch as any).mockResolvedValueOnce({ ok: true });

    // テスト用の簡単なレンダリング
    const { ReportScreen } = await import('../components/ReportScreen');
    render(
      <ReportScreen
        postId={mockPostId}
        userId={mockUserId}
        isReporting={true} // フォーム表示状態
        setIsReporting={vi.fn()}
        onReportComplete={mockOnReportComplete}
      />
    );

    const textarea = screen.getByPlaceholderText(/理由を入力/);
    fireEvent.change(textarea, { target: { value: '不適切な内容です' } });

    const submitBtn = screen.getByRole('button', { name: '送信' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://test-api.com/api/posts/report',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            postId: mockPostId,
            reporterId: mockUserId,
            reportReason: '不適切な内容です',
          }),
        })
      );
      // toast.success が呼ばれたか検証
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('通報を受け付けました'));
    });
  });
=======
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ReportScreen } from '../components/ReportScreen';
import { toast } from 'sonner';

// fetchのモック設定
const fetchMock = jest.fn() as jest.Mock;

beforeAll(() => {
  globalThis.fetch = fetchMock;
});

beforeEach(() => {
  jest.clearAllMocks();
  window.fetch = fetchMock; // ← この行を追加
  fetchMock.mockReset();
});

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('ReportScreen コンポーネント', () => {
  const defaultProps = {
    postId: 101,
    userId: 'user-789',
    isReporting: false,
    setIsReporting: jest.fn(),
    onReportComplete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.mockReset();
  });

  test('正常に入力して送信すると、正しいAPI(POST)が呼ばれ完了処理が行われること', async () => {
    // 成功レスポンスを定義
    fetchMock.mockResolvedValueOnce({ ok: true } as Response);

    render(<ReportScreen {...defaultProps} isReporting={true} />);

    const textarea = screen.getByPlaceholderText('理由を入力');
    fireEvent.change(textarea, { target: { value: 'スパム投稿です' } });

    // 送信ボタンクリック
    const submitButton = screen.getByRole('button', { name: '送信' });
    fireEvent.click(submitButton);

    // 【修正ポイント1】
    // クリック直後は Loader2 アイコンが表示されるため、name 指定なしで disabled かどうかをチェック
    // もしくは data-slot="button" 等で特定する
    expect(submitButton).toBeDisabled();

    // 【修正ポイント2】
    // 非同期処理とそれに伴うステート更新（setReason等）を waitFor で包む
    // これにより act(...) の警告も解消されます
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/posts/report',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            postId: 101,
            reporterId: 'user-789',
            reportReason: 'スパム投稿です',
          }),
        })
      );
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('通報を受け付けました'));
      expect(defaultProps.setIsReporting).toHaveBeenCalledWith(false);
      expect(defaultProps.onReportComplete).toHaveBeenCalled();
    });
  });

  test('APIエラー時にエラーメッセージが表示されること', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false } as Response);

    render(<ReportScreen {...defaultProps} isReporting={true} />);

    fireEvent.change(screen.getByPlaceholderText('理由を入力'), { target: { value: 'test' } });
    fireEvent.click(screen.getByRole('button', { name: '送信' }));

    // エラー後のステート更新を待つ
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('エラーが発生しました。再度お試しください。');
    });

    // エラー後はボタンが「送信」に戻っているはず
    expect(screen.getByRole('button', { name: '送信' })).not.toBeDisabled();
  });
>>>>>>> main
});
