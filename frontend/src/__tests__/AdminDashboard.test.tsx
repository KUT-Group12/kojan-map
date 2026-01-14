import { render, screen, fireEvent } from '@testing-library/react';
import { AdminDashboard } from '../components/AdminDashboard';
import { User } from '../types';

// Rechartsのモック
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  BarChart: ({ children }: any) => <div>{children}</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
  PieChart: ({ children }: any) => <div>{children}</div>,
  Pie: () => <div />,
  Cell: () => <div />,
}));

// Sonner のモック
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockUser: User = {
  id: 'admin-1',
  name: '管理者ユーザー',
  role: 'admin',
  email: 'admin@example.com',
  createdAt: new Date('2025-11-01'),
};

const mockOnLogout = jest.fn();

describe('AdminDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('初期表示で概要タブが表示されていること', () => {
    render(<AdminDashboard user={mockUser} onLogout={mockOnLogout} />);
    expect(screen.getByText('ダッシュボード概要')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('ログアウトボタンがクリックされたら onLogout が呼ばれること', () => {
    render(<AdminDashboard user={mockUser} onLogout={mockOnLogout} />);
    const logoutButton = screen.getByRole('button', { name: /ログアウト/i });
    fireEvent.click(logoutButton);
    expect(mockOnLogout).toHaveBeenCalledTimes(1);
  });
});