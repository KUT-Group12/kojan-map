// src/__tests__/AdminContactManagement.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminContactManagement, { Inquiry } from '../components/AdminContactManagement';

describe('AdminContactManagement コンポーネント', () => {
  const mockOnDelete = jest.fn();
  const mockOnApprove = jest.fn();
  const setInquiries = jest.fn();

  const inquiries: Inquiry[] = [
    {
      askId: 1,
      fromName: '田中 太郎',
      email: 'tanaka@example.com',
      role: 'business',
      subject: '問い合わせ1',
      text: '内容1',
      askFlag: false,
      date: '2026-01-21',
      userId: 'u1',
    },
    {
      askId: 2,
      fromName: '佐藤 次郎',
      email: 'sato@example.com',
      role: 'general',
      subject: '問い合わせ2',
      text: '内容2',
      askFlag: true,
      date: '2026-01-20',
      userId: 'u2',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('問い合わせ一覧が表示される', () => {
    render(
      <AdminContactManagement
        inquiries={inquiries}
        setInquiries={setInquiries}
        onDeleteInquiry={mockOnDelete}
        onApproveInquiry={mockOnApprove}
      />
    );

    expect(screen.getByText('田中 太郎')).toBeInTheDocument();
    expect(screen.getByText('佐藤 次郎')).toBeInTheDocument();
    expect(screen.getByText('問い合わせ1')).toBeInTheDocument();
    expect(screen.getByText('問い合わせ2')).toBeInTheDocument();
    expect(screen.getByText('未対応')).toBeInTheDocument();
    expect(screen.getByText('対応済み')).toBeInTheDocument();
  });

  test('検索フィルターが動作する', () => {
    render(
      <AdminContactManagement
        inquiries={inquiries}
        setInquiries={setInquiries}
        onDeleteInquiry={mockOnDelete}
        onApproveInquiry={mockOnApprove}
      />
    );

    const input = screen.getByPlaceholderText(/検索/);
    fireEvent.change(input, { target: { value: '田中' } });

    expect(screen.getByText('田中 太郎')).toBeInTheDocument();
    expect(screen.queryByText('佐藤 次郎')).not.toBeInTheDocument();
  });

  test('未対応のみボタンでフィルターされる', () => {
    render(
      <AdminContactManagement
        inquiries={inquiries}
        setInquiries={setInquiries}
        onDeleteInquiry={mockOnDelete}
        onApproveInquiry={mockOnApprove}
      />
    );

    const btn = screen.getByRole('button', { name: /未対応のみ/i });
    fireEvent.click(btn);

    expect(screen.getByText('田中 太郎')).toBeInTheDocument();
    expect(screen.queryByText('佐藤 次郎')).not.toBeInTheDocument();
  });

  test('返信ボタンでモーダルが開き、下書き保存・メール送信が動作する', () => {
    render(
      <AdminContactManagement
        inquiries={inquiries}
        setInquiries={setInquiries}
        onDeleteInquiry={mockOnDelete}
        onApproveInquiry={mockOnApprove}
      />
    );

    const replyBtn = screen.getByRole('button', { name: /返信/i });
    fireEvent.click(replyBtn);

    expect(screen.getByText(/返信: 田中 太郎 様/)).toBeInTheDocument();

    const sendBtn = screen.getByRole('button', { name: /メールで送信/i });
    fireEvent.click(sendBtn);

    expect(mockOnApprove).toHaveBeenCalledWith(1);
    expect(setInquiries).toHaveBeenCalled();
  });

  test('削除ボタンで onDeleteInquiry が呼ばれる', () => {
    render(
      <AdminContactManagement
        inquiries={inquiries}
        setInquiries={setInquiries}
        onDeleteInquiry={mockOnDelete}
        onApproveInquiry={mockOnApprove}
      />
    );

    const deleteBtns = screen.getAllByRole('button', { name: /削除/i });
    fireEvent.click(deleteBtns[0]);

    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });
});
