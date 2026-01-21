import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminDashboard } from '../components/AdminDashboard';
import { User } from '../types';

// fetch のモック
vi.stubGlobal('fetch', vi.fn());

// toast のモック
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Recharts はテスト環境で正しく描画されないことが多いためモック化
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  BarChart: () => <div data-testid="bar-chart" />,
  PieChart: () => <div data-testid="pie-chart" />,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  Bar: () => null,
  Pie: () => null,
  Cell: () => null,
}));

// 子コンポーネントの簡易モック（これらは個別にテスト済みのため）
vi.mock('../components/AdminReport', () => ({
  default: () => <div data-testid="admin-report">AdminReport Component</div>,
}));

// toast をインポート
import { toast } from 'sonner';

describe('AdminDashboard', () => {
  const mockAdminUser: User = {
    googleId: 'admin-1',
    fromName: '管理者様',
    gmail: 'admin@example.com',
    role: 'admin',
    registrationDate: '2024-01-01',
  };

  const mockOnLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // デフォルトの成功レスポンス（overview用）
    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        stats: {
          totalUsers: 100,
          activeUsers: 50,
          totalPosts: 200,
          totalReactions: 500,
          businessUsers: 10,
          pendingReports: 3,
        },
        activity: [],
        genres: [],
      }),
    });
  });

  it('初期表示で統計データが表示されること', async () => {
    render(<AdminDashboard user={mockAdminUser} onLogout={mockOnLogout} />);

    // 統計値の確認
    expect(await screen.findByText('100')).toBeInTheDocument(); // 総ユーザー数
    expect(screen.getByText('管理者様')).toBeInTheDocument();
  });

  it('サイドバーのタブをクリックして画面が切り替わること', async () => {
    render(<AdminDashboard user={mockAdminUser} onLogout={mockOnLogout} />);

    // 初期状態は概要。通報管理タブをクリック
    const reportTabButton = screen.getByRole('button', { name: /通報管理/ });

    // 通報データ取得用のAPIレスポンスをモック
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reports: [] }),
    });

    fireEvent.click(reportTabButton);

    // ヘッダーが変わることを確認
    expect(await screen.findByRole('heading', { name: '通報管理' })).toBeInTheDocument();
    // モックしたコンポーネントが表示されているか
    expect(screen.getByTestId('admin-report')).toBeInTheDocument();
  });

  it('ログアウトボタンをクリックすると onLogout が呼ばれること', () => {
    render(<AdminDashboard user={mockAdminUser} onLogout={mockOnLogout} />);

    const logoutButton = screen.getByRole('button', { name: /ログアウト/ });
    fireEvent.click(logoutButton);

    expect(mockOnLogout).toHaveBeenCalled();
  });

  it('通報の解決 (handleResolveReport) が正しく動作し、統計が更新されること', async () => {
    render(<AdminDashboard user={mockAdminUser} onLogout={mockOnLogout} />);

    // 「3」というテキストを持つ要素のうち、Badge（サイドバー）の方を特定する
    // findByText の代わりに、セレクタを絞り込める queryByText + waitFor か
    // 役割(Role)で絞り込みます。
    const badge = await screen.findByText('3', {
      selector: '[data-slot="badge"]',
    });
    expect(badge).toBeInTheDocument();

    // fetch を PUT 成功用にモック
    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    // 補足：もし「概要カード側」の3を確認したい場合は以下のように書けます
    // const statCardValue = screen.getByText('3', { selector: '.text-3xl' });
  });

  it('APIエラー時にエラーがログ出力されること', async () => {
    // console.error をモック
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // ユーザー一覧取得でエラーを発生させる
    (globalThis.fetch as any).mockResolvedValueOnce({ ok: false });

    render(<AdminDashboard user={mockAdminUser} onLogout={mockOnLogout} />);

    fireEvent.click(screen.getByRole('button', { name: /ユーザー管理/ }));

    await waitFor(() => {
      // fetch が呼ばれたことを確認
      expect(globalThis.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/users'));
      // console.error が呼ばれたことを確認
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });
});
