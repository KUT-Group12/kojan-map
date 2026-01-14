import { render, screen, fireEvent } from '@testing-library/react';
import { UserInputBusinessApplication } from '../components/UserInputBusinessApplication';

describe('UserInputBusinessApplication コンポーネント', () => {
  const mockOnUpdateUser = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // window.alert をモック化
    jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  test('フォームの各項目とボタンが表示されていること', () => {
    render(
      <UserInputBusinessApplication 
        onUpdateUser={mockOnUpdateUser} 
        onCancel={mockOnCancel} 
      />
    );

    expect(screen.getByPlaceholderText('店舗名')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('電話番号')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('住所')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '申請する' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
  });

  test('入力フィールドに値を入力できること', () => {
    render(
      <UserInputBusinessApplication 
        onUpdateUser={mockOnUpdateUser} 
        onCancel={mockOnCancel} 
      />
    );

    const shopInput = screen.getByPlaceholderText('店舗名') as HTMLInputElement;
    fireEvent.change(shopInput, { target: { value: '土佐商店' } });
    expect(shopInput.value).toBe('土佐商店');
  });

  test('未入力項目がある場合に alert を表示し、送信を中止すること', () => {
    render(
      <UserInputBusinessApplication 
        onUpdateUser={mockOnUpdateUser} 
        onCancel={mockOnCancel} 
      />
    );

    const submitButton = screen.getByRole('button', { name: '申請する' });
    fireEvent.click(submitButton);

    // アラートが表示されたか
    expect(window.alert).toHaveBeenCalledWith('すべての項目を入力してください');
    // 送信処理は呼ばれていないか
    expect(mockOnUpdateUser).not.toHaveBeenCalled();
  });

  test('すべての項目を入力して申請すると、正しいデータが送信されること', () => {
    render(
      <UserInputBusinessApplication 
        onUpdateUser={mockOnUpdateUser} 
        onCancel={mockOnCancel} 
      />
    );

    // 入力操作
    fireEvent.change(screen.getByPlaceholderText('店舗名'), { target: { value: '高知カフェ' } });
    fireEvent.change(screen.getByPlaceholderText('電話番号'), { target: { value: '088-000-0000' } });
    fireEvent.change(screen.getByPlaceholderText('住所'), { target: { value: '高知県香美市...' } });

    // 申請ボタンクリック
    const submitButton = screen.getByRole('button', { name: '申請する' });
    fireEvent.click(submitButton);

    // 正しいデータで呼ばれたか確認
    expect(mockOnUpdateUser).toHaveBeenCalledWith({
      ShopName: '高知カフェ',
      PhoneNumber: '088-000-0000',
      address: '高知県香美市...',
    });
  });

  test('キャンセルボタンをクリックすると onCancel が呼ばれること', () => {
    render(
      <UserInputBusinessApplication 
        onUpdateUser={mockOnUpdateUser} 
        onCancel={mockOnCancel} 
      />
    );

    const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});