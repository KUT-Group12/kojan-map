import { render, screen, fireEvent } from '@testing-library/react';
// import { describe, it, expect } from '@jest/globals'; // 環境によっては必要ですが、基本は不要です
import { BusinessApplicationList, UserInputBusiness } from '../components/AdminDisplayBusinessApplicationList.tsx';

// モックデータ
const mockApplications: UserInputBusiness[] = [
  {
    id: '1',
    userName: '山田 太郎',
    email: 'test@example.com',
    ShopName: 'テス屋',
    PhoneNumber: '090-0000-0000',
    address: '東京都渋谷区',
    date: '2024-01-01',
  },
];

describe('BusinessApplicationList', () => {
  // 各テストの前にモックをリセット
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. 正常にデータが表示されるかのテスト
  it('申請データが正しく表示されること', () => {
    render(
      <BusinessApplicationList 
        applications={mockApplications} 
        onApprove={jest.fn()} 
        onReject={jest.fn()} 
      />
    );

    // 商号や氏名が画面にあるか確認
    expect(screen.getByText('テス屋')).toBeInTheDocument();
    expect(screen.getByText('山田 太郎')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('東京都渋谷区')).toBeInTheDocument();
  });

  // 2. 承認ボタンのクリックテスト
  it('承認ボタンをクリックすると onApprove が呼ばれること', () => {
    // vi.fn() を jest.fn() に修正
    const onApproveMock = jest.fn();
    render(
      <BusinessApplicationList 
        applications={mockApplications} 
        onApprove={onApproveMock} 
        onReject={jest.fn()} 
      />
    );

    // name属性やテキストでボタンを特定
    const approveButton = screen.getByRole('button', { name: /承認/i });
    fireEvent.click(approveButton);

    // 正しいID ('1') で呼ばれたか確認
    expect(onApproveMock).toHaveBeenCalledWith('1');
    expect(onApproveMock).toHaveBeenCalledTimes(1);
  });

  // 3. 却下ボタンのクリックテスト
  it('却下ボタンをクリックすると onReject が呼ばれること', () => {
    // vi.fn() を jest.fn() に修正
    const onRejectMock = jest.fn();
    render(
      <BusinessApplicationList 
        applications={mockApplications} 
        onApprove={jest.fn()} 
        onReject={onRejectMock} 
      />
    );

    const rejectButton = screen.getByRole('button', { name: /却下/i });
    fireEvent.click(rejectButton);

    expect(onRejectMock).toHaveBeenCalledWith('1');
    expect(onRejectMock).toHaveBeenCalledTimes(1);
  });

  // 4. データが空の場合のテスト
  it('申請が0件の時、メッセージが表示されること', () => {
    render(
      <BusinessApplicationList 
        applications={[]} 
        onApprove={jest.fn()} 
        onReject={jest.fn()} 
      />
    );

    expect(screen.getByText('現在、未処理の申請はありません。')).toBeInTheDocument();
  });
});