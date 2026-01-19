import { render, screen, fireEvent } from '@testing-library/react';
import AdminUserManagement from '../components/AdminUserManagement';

// モックデータ
const mockUsers = [
  {
    id: 'user-1',
    name: '山田 太郎',
    email: 'yamada@example.com',
    role: 'general',
    posts: 5,
  },
  {
    id: 'user-2',
    name: '佐藤 建設',
    email: 'sato@business.com',
    role: 'business',
    posts: 12,
  },
];

describe('AdminUserManagement コンポーネント', () => {
  const mockOnDeleteAccount = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // window.confirm をモック化し、デフォルトで true (OK) を返すように設定
    jest.spyOn(window, 'confirm').mockImplementation(() => true);
  });

  afterEach(() => {
    // スパイを解除して元の挙動に戻す
    jest.restoreAllMocks();
  });

  test('ユーザー一覧が正しくレンダリングされること', () => {
    render(<AdminUserManagement users={mockUsers} onDeleteAccount={mockOnDeleteAccount} />);

    expect(screen.getByText('山田 太郎')).toBeInTheDocument();
    expect(screen.getByText('yamada@example.com')).toBeInTheDocument();
    expect(screen.getByText('一般')).toBeInTheDocument();

    expect(screen.getByText('佐藤 建設')).toBeInTheDocument();
    expect(screen.getByText('事業者')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument(); // 投稿数
  });

  test('削除ボタンをクリックし、確認ダイアログでOKを押すと onDeleteAccount が呼ばれること', () => {
    render(<AdminUserManagement users={mockUsers} onDeleteAccount={mockOnDeleteAccount} />);

    // 山田 太郎の削除ボタンを取得
    const deleteButtons = screen.getAllByRole('button', { name: /削除/i });
    fireEvent.click(deleteButtons[0]);

    // 1. confirm が正しいメッセージで呼ばれたか
    expect(window.confirm).toHaveBeenCalledWith(
      '山田 太郎 さんのアカウントを削除してもよろしいですか？'
    );

    // 2. 親から渡された削除関数が正しいIDで呼ばれたか
    expect(mockOnDeleteAccount).toHaveBeenCalledWith('user-1');
  });

  test('確認ダイアログでキャンセルを押すと onDeleteAccount が呼ばれないこと', () => {
    // このテストケースだけ confirm が false を返すように上書き
    (window.confirm as jest.Mock).mockReturnValue(false);

    render(<AdminUserManagement users={mockUsers} onDeleteAccount={mockOnDeleteAccount} />);

    const deleteButtons = screen.getAllByRole('button', { name: /削除/i });
    fireEvent.click(deleteButtons[0]);

    // 関数が呼ばれていないことを確認
    expect(mockOnDeleteAccount).not.toHaveBeenCalled();
  });

  test('ユーザーが空の場合、メッセージが表示されること', () => {
    render(<AdminUserManagement users={[]} onDeleteAccount={mockOnDeleteAccount} />);

    expect(screen.getByText('該当するユーザーが見つかりません。')).toBeInTheDocument();
  });
});
