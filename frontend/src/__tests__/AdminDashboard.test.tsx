import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminDashboard } from '../components/AdminDashboard';
import { User } from '../types';

// fetchのグローバルモック
vi.stubGlobal('fetch', vi.fn());

// Rechartsのレスポンシブコンテナがテスト環境(jsdom)でサイズ0になるのを防ぐモック
vi.mock('recharts', async () => {
  const OriginalModule = await vi.importActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: any) => (
      <div style={{ width: '800px', height: '400px' }}>{children}</div>
    ),
  };
});

describe('AdminDashboard', () => {
  const mockAdminUser: User = {
    googleId: 'admin-001',
    fromName: '管理者 A',
    gmail: 'admin@example.com',
    role: 'admin',
    registrationDate: '2024-01-01',
  };

  const mockSummary = {
    stats: {
      totalUsers: 100,
      activeUsers: 50,
      totalPosts: 200,
      totalReactions: 500,
      businessUsers: 10,
      pendingReports: 5,
    },
    activity: [{ date: '2026-01-20', posts: 5, reactions: 10 }],
    genres: [{ name: 'グルメ', value: 30, color: '#ff0000' }],
  };

  const mockInquiries = [
    {
      askId: 1,
      userId: 'user1',
      subject: 'テスト件名',
      text: 'テスト本文',
      date: '2026-01-20',
      askFlag: false,
      email: 'test@example.com',
      fromName: '質問者',
      role: 'general',
    },
  ];

  const mockOnLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // デフォルトのfetchレスポンス（概要データ）
    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockSummary,
    });
  });

  it('初期表示時に概要データがフェッチされ、統計カードが表示されること', async () => {
    render(<AdminDashboard user={mockAdminUser} onLogout={mockOnLogout} />);

    // APIが呼ばれたか確認
    expect(globalThis.fetch).toHaveBeenCalledWith(expect.stringContaining('/admin/summary'));

    // 統計値が表示されているか
    await waitFor(() => {
      const elements = screen.getAllByText('5');
      expect(elements.length).toBeGreaterThanOrEqual(1);
      // 統計カードの「5」が最初に来ることがわかっている場合
      // expect(elements[1]).toBeInTheDocument();
    });
  });

  it('タブを切り替えると、対応するAPIが呼び出されること', async () => {
    render(<AdminDashboard user={mockAdminUser} onLogout={mockOnLogout} />);

    // 「お問い合わせ」タブをクリック
    const inquiryTab = screen.getByRole('button', { name: /お問い合わせ/ });

    // お問い合わせデータのレスポンスを個別にモック
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ inquiries: mockInquiries }),
    });

    fireEvent.click(inquiryTab);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(expect.stringContaining('/admin/inquiries'));
      expect(screen.getByText('お問い合わせ管理')).toBeInTheDocument();
    });
  });

  it('お問い合わせの削除ボタンがクリックされたとき、確認ダイアログが出てAPIが呼ばれること', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    // 1. fetchを事前に確実にモック（データが空でないことを確認）
    const mockFetch = vi.spyOn(globalThis, 'fetch').mockImplementation((url) => {
      if (url.toString().includes('/admin/inquiries')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ inquiries: [{ askId: 1, title: 'テスト件名', status: 'pending' }] }),
        } as Response);
      }
      return Promise.resolve({ ok: true } as Response);
    });

    render(<AdminDashboard user={mockAdminUser} onLogout={mockOnLogout} />);

    // 2. サイドバーの「お問い合わせ」ボタンをクリック
    // name: 'お問い合わせ' だと見つからない場合があるため、正規表現や exact: false を検討
    const inquiryTab = screen.getByRole('button', { name: /お問い合わせ/i });
    fireEvent.click(inquiryTab);

    // 3. メインエリアが切り替わるのを「見出し」で待つ
    // これにより AdminContactManagement が表示されたことを確定させる
    await screen.findByRole('heading', { name: /お問い合わせ管理/ });

    // 4. その後、削除ボタンが表示されるのを待つ
    const deleteBtn = await screen.findByRole('button', { name: '削除' });

    // 5. 削除実行
    fireEvent.click(deleteBtn);

    // 6. 検証
    expect(confirmSpy).toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin/inquiries/1/reject'),
      expect.any(Object)
    );

    confirmSpy.mockRestore();
    mockFetch.mockRestore();
  });

  it('ログアウトボタンをクリックすると onLogout が呼ばれること', () => {
    render(<AdminDashboard user={mockAdminUser} onLogout={mockOnLogout} />);

    const logoutBtn = screen.getByRole('button', { name: /ログアウト/ });
    fireEvent.click(logoutBtn);

    expect(mockOnLogout).toHaveBeenCalled();
  });

  it('未処理通報がある場合、サイドバーにバッジが表示されること', async () => {
    render(<AdminDashboard user={mockAdminUser} onLogout={mockOnLogout} />);

    // data-testid を使ってピンポイントで取得
    const reportBadge = await screen.findByTestId('report-badge');

    expect(reportBadge).toHaveTextContent('5');
    expect(reportBadge).toHaveClass('bg-red-500');
  });
});
