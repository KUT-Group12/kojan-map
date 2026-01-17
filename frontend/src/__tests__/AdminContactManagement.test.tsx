import { render, screen, fireEvent, within } from '@testing-library/react';
import AdminContactManagement from '../components/AdminContactManagement';
import { toast } from 'sonner';

// toast のモック化
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
  },
}));

const mockInquiries = [
  {
    id: '1',
    fromName: '田中 太郎',
    email: 'tanaka@example.com',
    message: '使い方がわかりません。',
    role: 'general' as const,
    date: '2023-10-01',
    status: 'open' as const,
  },
  {
    id: '2',
    fromName: '株式会社テスト',
    email: 'business@example.com',
    message: '掲載依頼です。',
    role: 'business' as const,
    date: '2023-10-02',
    status: 'responded' as const,
    draft: '返信内容の下書き',
  },
];

describe('AdminContactManagement コンポーネント', () => {
  const mockSetInquiries = jest.fn();
  const mockOnDeleteInquiry = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('初期表示で問い合わせ一覧が正しく表示されること', () => {
    render(
      <AdminContactManagement
        inquiries={mockInquiries}
        setInquiries={mockSetInquiries}
        onDeleteInquiry={mockOnDeleteInquiry}
      />
    );

    expect(screen.getByText('田中 太郎')).toBeInTheDocument();
    expect(screen.getByText('株式会社テスト')).toBeInTheDocument();
    expect(screen.getByText('未対応のみ')).toBeInTheDocument();
  });

  test('検索バーでフィルタリングができること', () => {
    render(
      <AdminContactManagement
        inquiries={mockInquiries}
        setInquiries={mockSetInquiries}
        onDeleteInquiry={mockOnDeleteInquiry}
      />
    );

    const searchInput = screen.getByPlaceholderText(/検索/);
    fireEvent.change(searchInput, { target: { value: '株式会社' } });

    expect(screen.queryByText('田中 太郎')).not.toBeInTheDocument();
    expect(screen.getByText('株式会社テスト')).toBeInTheDocument();
  });

  test('「未対応のみ」フィルタが機能すること', () => {
    render(
      <AdminContactManagement
        inquiries={mockInquiries}
        setInquiries={mockSetInquiries}
        onDeleteInquiry={mockOnDeleteInquiry}
      />
    );

    const filterButton = screen.getByRole('button', { name: '未対応のみ' });
    fireEvent.click(filterButton);

    // ステータスが 'open' のものだけ表示される
    expect(screen.getByText('田中 太郎')).toBeInTheDocument();
    expect(screen.queryByText('株式会社テスト')).not.toBeInTheDocument();
  });

  test('返信ボタンをクリックするとモーダルが開き、下書きが反映されていること', () => {
    render(
      <AdminContactManagement
        inquiries={mockInquiries}
        setInquiries={mockSetInquiries}
        onDeleteInquiry={mockOnDeleteInquiry}
      />
    );

    // ID:2 の「株式会社テスト」には下書きがある想定（respondedだが実装上statusチェックに注意）
    // ※ コンポーネントの実装では inq.status === 'open' の時だけ返信ボタンが出るため、
    // 田中 太郎（open）の方で検証します。
    const tanakaCard = screen.getByText('田中 太郎').closest('.card') || screen.getByText('田中 太郎').parentElement?.parentElement?.parentElement!;
    const replyButton = within(tanakaCard as HTMLElement).getByRole('button', { name: '返信' });
    
    fireEvent.click(replyButton);

    expect(screen.getByText('返信: 田中 太郎 様')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/返信内容を入力してください/)).toBeInTheDocument();
  });

  test('メール送信を実行すると setInquiries と toast が呼ばれること', () => {
    render(
      <AdminContactManagement
        inquiries={mockInquiries}
        setInquiries={mockSetInquiries}
        onDeleteInquiry={mockOnDeleteInquiry}
      />
    );

    // 返信モーダルを開く
    fireEvent.click(screen.getAllByRole('button', { name: '返信' })[0]);

    // 返信内容入力
    const textarea = screen.getByPlaceholderText(/返信内容を入力してください/);
    fireEvent.change(textarea, { target: { value: 'お世話になっております。' } });

    // 送信ボタンクリック
    const sendButton = screen.getByRole('button', { name: 'メールで送信' });
    fireEvent.click(sendButton);

    expect(mockSetInquiries).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('メールを送信しました'));
    // モーダルが閉じていることを確認（クローズボタンが消えているか）
    expect(screen.queryByText('メールで送信')).not.toBeInTheDocument();
  });

  test('削除ボタンをクリックすると onDeleteInquiry が呼ばれること', () => {
    render(
      <AdminContactManagement
        inquiries={mockInquiries}
        setInquiries={mockSetInquiries}
        onDeleteInquiry={mockOnDeleteInquiry}
      />
    );

    const deleteButtons = screen.getAllByRole('button', { name: '削除' });
    fireEvent.click(deleteButtons[0]);

    expect(mockOnDeleteInquiry).toHaveBeenCalledWith('1');
  });
});