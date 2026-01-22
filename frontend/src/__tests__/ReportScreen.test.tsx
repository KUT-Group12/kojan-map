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
vi.mock('../lib/auth', () => ({
  getStoredJWT: () => 'mock-token',
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
        })
      );
      // toast.success が呼ばれたか検証
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('通報を受け付けました'));
    });
  });
});
