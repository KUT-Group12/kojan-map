import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  BusinessApplicationList,
  AdminDisplayBusinessRequest,
} from '../components/AdminDisplayBusinessApplicationList';

describe('BusinessApplicationList', () => {
  const mockApplications: AdminDisplayBusinessRequest[] = [
    {
      requestId: 10,
      userId: 'google-user-1',
      name: 'こだわりコーヒー店',
      phone: '09011112222',
      address: '東京都渋谷区...',
      fromName: '田中 太郎',
      gmail: 'tanaka@example.com',
      applicationDate: '2026-01-20 10:00',
    },
    {
      requestId: 11,
      userId: 'google-user-2',
      name: '街のパン屋さん',
      phone: '0312345678',
      address: '神奈川県横浜市...',
      fromName: '佐藤 花子',
      gmail: 'sato@example.com',
      applicationDate: '2026-01-21 15:30',
    },
  ];

  const mockOnApprove = vi.fn();
  const mockOnReject = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('申請一覧が正しく表示されること', () => {
    render(
      <BusinessApplicationList
        applications={mockApplications}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
      />
    );

    // 事業者名が表示されているか
    expect(screen.getByText('こだわりコーヒー店')).toBeInTheDocument();
    expect(screen.getByText('街のパン屋さん')).toBeInTheDocument();

    // メールアドレスや電話番号の表示確認
    expect(screen.getByText('tanaka@example.com')).toBeInTheDocument();
    expect(screen.getByText('0312345678')).toBeInTheDocument();

    // 申請日時の表示
    expect(screen.getByText('2026-01-21 15:30')).toBeInTheDocument();
  });

  it('承認ボタンをクリックすると、正しい requestId で onApprove が呼ばれること', () => {
    render(
      <BusinessApplicationList
        applications={mockApplications}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
      />
    );

    // 2番目の申請（requestId: 11）の承認ボタンを取得
    const approveButtons = screen.getAllByRole('button', { name: /承認/ });
    fireEvent.click(approveButtons[1]);

    expect(mockOnApprove).toHaveBeenCalledWith(11);
  });

  it('却下ボタンをクリックすると、正しい requestId で onReject が呼ばれること', () => {
    render(
      <BusinessApplicationList
        applications={mockApplications}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
      />
    );

    // 1番目の申請（requestId: 10）の却下ボタンを取得
    const rejectButtons = screen.getAllByRole('button', { name: /却下/ });
    fireEvent.click(rejectButtons[0]);

    expect(mockOnReject).toHaveBeenCalledWith(10);
  });

  it('申請が空の場合、専用のメッセージが表示されること', () => {
    render(
      <BusinessApplicationList
        applications={[]}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
      />
    );

    expect(screen.getByText('現在、未処理の申請はありません。')).toBeInTheDocument();
  });
});
