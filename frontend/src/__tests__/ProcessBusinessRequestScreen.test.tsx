import { render, screen, fireEvent } from '@testing-library/react';
import ProcessBusinessRequestScreen, { BusinessApplication } from '../components/ProcessBusinessRequestScreen';

// 子コンポーネントをモック化
// 子コンポーネント自体のテストは別途行うため、ここではプロップスが正しく渡されているかだけを確認します
jest.mock('../components/AdminDisplayBusinessApplicationList', () => ({
  BusinessApplicationList: ({ applications, onApprove, onReject }: any) => (
    <div data-testid="mock-list">
      {applications.map((app: any) => (
        <div key={app.id}>
          <span>{app.ShopName}</span>
          <button onClick={() => onApprove(app.id)}>承認</button>
          <button onClick={() => onReject(app.id)}>却下</button>
        </div>
      ))}
    </div>
  ),
}));

describe('ProcessBusinessRequestScreen コンポーネント', () => {
  const mockApplications: BusinessApplication[] = [
    {
      id: '1',
      userName: '田中 太郎',
      email: 'tanaka@example.com',
      ShopName: 'やまっぷカフェ',
      PhoneNumber: '090-1234-5678',
      address: '高知県香美市...',
      date: '2026-01-15',
    },
    {
      id: '2',
      userName: '佐藤 花子',
      email: 'sato@example.com',
      ShopName: '山のパン屋',
      PhoneNumber: '080-8765-4321',
      address: '高知県土佐市...',
      date: '2026-01-14',
    }
  ];

  const mockOnApprove = jest.fn();
  const mockOnReject = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('タイトルと未処理件数が正しく表示されること', () => {
    render(
      <ProcessBusinessRequestScreen 
        applications={mockApplications} 
        onApprove={mockOnApprove} 
        onReject={mockOnReject} 
      />
    );

    expect(screen.getByText('事業者申請の処理')).toBeInTheDocument();
    // 件数表示の確認
    expect(screen.getByText(/現在 2 件の未処理案件があります/i)).toBeInTheDocument();
  });

  test('子コンポーネントにデータが渡され、表示されていること', () => {
    render(
      <ProcessBusinessRequestScreen 
        applications={mockApplications} 
        onApprove={mockOnApprove} 
        onReject={mockOnReject} 
      />
    );

    // モック化したリストの中にショップ名が含まれているか確認
    expect(screen.getByText('やまっぷカフェ')).toBeInTheDocument();
    expect(screen.getByText('山のパン屋')).toBeInTheDocument();
  });

  test('承認ボタンがクリックされたときに onApprove が呼ばれること', () => {
    render(
      <ProcessBusinessRequestScreen 
        applications={mockApplications} 
        onApprove={mockOnApprove} 
        onReject={mockOnReject} 
      />
    );

    // 最初のアプリの承認ボタンをクリック
    const approveButtons = screen.getAllByText('承認');
    fireEvent.click(approveButtons[0]);

    expect(mockOnApprove).toHaveBeenCalledWith('1');
  });

  test('却下ボタンがクリックされたときに onReject が呼ばれること', () => {
    render(
      <ProcessBusinessRequestScreen 
        applications={mockApplications} 
        onApprove={mockOnApprove} 
        onReject={mockOnReject} 
      />
    );

    const rejectButtons = screen.getAllByText('却下');
    fireEvent.click(rejectButtons[1]);

    expect(mockOnReject).toHaveBeenCalledWith('2');
  });

  test('申請が0件の場合の表示確認', () => {
    render(
      <ProcessBusinessRequestScreen 
        applications={[]} 
        onApprove={mockOnApprove} 
        onReject={mockOnReject} 
      />
    );

    expect(screen.getByText(/現在 0 件の未処理案件があります/i)).toBeInTheDocument();
  });
});