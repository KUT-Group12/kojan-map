import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from 'sonner';
import { ReportScreen } from '../components/ReportScreen'

// sonnerのモック
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ReportScreen', () => {
  const mockPostId = 101;
  const mockUserId = 'user-999';
  const mockOnReportComplete = vi.fn();

  // propsの setIsReporting をモック化するために状態を管理
  const ReportWrapper = ({ initialReporting = false }) => {
    const [isReporting, setIsReporting] = React.useState(initialReporting);
    return (
      <ReportScreen
        postId={mockPostId}
        userId={mockUserId}
        isReporting={isReporting}
        setIsReporting={setIsReporting}
        onReportComplete={mockOnReportComplete}
      />
    );
  };

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv('VITE_API_URL', 'http://test-api.com');
    global.fetch = vi.fn();
    // Reactをインポートして利用可能にする
    global.React = await import('react');
  });

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
    expect(screen.queryByPlaceholderText('理由を入力')).not.toBeInTheDocument();
  });

  it('通報ボタンをクリックすると入力フォームが表示されること', async () => {
    await renderComponentWithState();

    const reportBtn = screen.getByRole('button', { name: /通報/ });
    fireEvent.click(reportBtn);

    expect(screen.getByPlaceholderText('理由を入力')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '送信' })).toBeInTheDocument();
  });

  it('理由を入力して送信すると、バックエンドが期待するキー名でAPIが呼ばれること', async () => {
    (global.fetch as any).mockResolvedValueOnce({ ok: true });
    await renderComponentWithState(true); // 最初からフォーム表示

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
            reporterId: mockUserId,      // キー名の確認
            reportReason: '不適切な内容です', // キー名の確認
          }),
        })
      );
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('通報を受け付けました'));
      expect(mockOnReportComplete).toHaveBeenCalled();
    });
  });

  it('理由が空のまま送信しようとするとエラーを表示すること', async () => {
    await renderComponentWithState(true);

    const submitBtn = screen.getByRole('button', { name: '送信' });
    fireEvent.click(submitBtn);

    expect(toast.error).toHaveBeenCalledWith('通報理由を入力してください');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  // ヘルパー: 状態を持ったラッパーでレンダリング
  async function renderComponentWithState(initialReporting = false) {
    const { ReportScreen } = await import('../components/ReportScreen');
    const { useState } = await import('react');
    
    const TestComponent = () => {
      const [reporting, setReporting] = useState(initialReporting);
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
    return render(<TestComponent />);
  }
});