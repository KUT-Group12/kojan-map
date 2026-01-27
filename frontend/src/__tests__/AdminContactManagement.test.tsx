import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminContactManagement, { Inquiry } from '../components/AdminContactManagement';

describe('AdminContactManagement', () => {
  const mockInquiries: Inquiry[] = [
    {
      askId: 1,
      userId: 'user-001',
      subject: 'ログインできない',
      text: 'パスワードを忘れました。',
      date: '2026-01-20',
      askFlag: false,
      email: 'user1@example.com',
      fromName: '利用者A',
      role: 'user',
    },
    {
      askId: 2,
      userId: 'biz-001',
      subject: '掲載情報の修正',
      text: '営業時間を変更したいです。',
      date: '2026-01-21',
      askFlag: true,
      email: 'shop@example.com',
      fromName: 'カフェ・オーナー',
      role: 'business',
    },
  ];

  const mockSetInquiries = vi.fn();
  const mockOnDeleteInquiry = vi.fn();
  const mockOnApproveInquiry = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('お問い合わせ一覧が正しく表示されること', () => {
    render(
      <AdminContactManagement
        inquiries={mockInquiries}
        setInquiries={mockSetInquiries}
        onDeleteInquiry={mockOnDeleteInquiry}
        onApproveInquiry={mockOnApproveInquiry}
      />
    );

    expect(screen.getByText('利用者A')).toBeInTheDocument();
    expect(screen.getByText('カフェ・オーナー')).toBeInTheDocument();
    expect(screen.getByText('一般')).toBeInTheDocument();
    expect(screen.getByText('事業者')).toBeInTheDocument();
  });

  it('検索キーワードでお問い合わせをフィルタリングできること', () => {
    render(
      <AdminContactManagement
        inquiries={mockInquiries}
        setInquiries={mockSetInquiries}
        onDeleteInquiry={mockOnDeleteInquiry}
        onApproveInquiry={mockOnApproveInquiry}
      />
    );

    const searchInput = screen.getByPlaceholderText(/検索/);
    fireEvent.change(searchInput, { target: { value: 'ログイン' } });

    expect(screen.getByText('利用者A')).toBeInTheDocument();
    expect(screen.queryByText('カフェ・オーナー')).not.toBeInTheDocument();
  });

  it('「未対応のみ」の絞り込みが機能すること', () => {
    render(
      <AdminContactManagement
        inquiries={mockInquiries}
        setInquiries={mockSetInquiries}
        onDeleteInquiry={mockOnDeleteInquiry}
        onApproveInquiry={mockOnApproveInquiry}
      />
    );

    const filterButton = screen.getByRole('button', { name: '未対応のみ' });
    fireEvent.click(filterButton);

    // 対応済み(askFlag: true)の「カフェ・オーナー」が消えることを確認
    expect(screen.queryByText('カフェ・オーナー')).not.toBeInTheDocument();
    expect(screen.getByText('利用者A')).toBeInTheDocument();
  });

  it('返信ボタンをクリックするとモーダルが開き、送信できること', async () => {
    render(
      <AdminContactManagement
        inquiries={mockInquiries}
        setInquiries={mockSetInquiries}
        onDeleteInquiry={mockOnDeleteInquiry}
        onApproveInquiry={mockOnApproveInquiry}
      />
    );

    // 「返信」ボタンをクリック
    const replyButton = screen.getAllByText('返信')[0];
    fireEvent.click(replyButton);

    // モーダルが表示されたか
    expect(screen.getByText(/返信: 利用者A 様/)).toBeInTheDocument();

    // テキストを入力
    const textarea = screen.getByPlaceholderText(/返信内容を入力してください/);
    fireEvent.change(textarea, { target: { value: '了解しました。' } });

    // 送信
    const sendButton = screen.getByText('メールで送信');
    fireEvent.click(sendButton);

    expect(mockOnApproveInquiry).toHaveBeenCalledWith(1);
    // モーダルが閉じていることを確認
    expect(screen.queryByText(/返信: 利用者A 様/)).not.toBeInTheDocument();
  });

  it('下書き保存をクリックすると setInquiries が呼ばれること', () => {
    render(
      <AdminContactManagement
        inquiries={mockInquiries}
        setInquiries={mockSetInquiries}
        onDeleteInquiry={mockOnDeleteInquiry}
        onApproveInquiry={mockOnApproveInquiry}
      />
    );

    fireEvent.click(screen.getAllByText('返信')[0]);
    const textarea = screen.getByPlaceholderText(/返信内容を入力してください/);
    fireEvent.change(textarea, { target: { value: '下書きテスト' } });

    fireEvent.click(screen.getByText('下書き保存'));

    expect(mockSetInquiries).toHaveBeenCalled();
  });

  it('削除ボタンをクリックすると onDeleteInquiry が呼ばれること', () => {
    render(
      <AdminContactManagement
        inquiries={mockInquiries}
        setInquiries={mockSetInquiries}
        onDeleteInquiry={mockOnDeleteInquiry}
        onApproveInquiry={mockOnApproveInquiry}
      />
    );

    const deleteButtons = screen.getAllByText('削除');
    fireEvent.click(deleteButtons[0]);

    expect(mockOnDeleteInquiry).toHaveBeenCalledWith(1);
  });
});
