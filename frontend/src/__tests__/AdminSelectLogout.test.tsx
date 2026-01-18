import { render, screen, fireEvent } from '@testing-library/react';
import { AdminSelectLogout } from '../components/AdminSelectLogout';

describe('AdminSelectLogout コンポーネント', () => {
  test('ログアウトボタンをクリックすると、指定された遷移処理が呼ばれること', () => {
    // 1. 遷移処理の代わりとなるモック関数を作成
    const mockLogoutAction = jest.fn();

    // 2. コンポーネントにモック関数を注入してレンダリング
    render(<AdminSelectLogout onLogoutAction={mockLogoutAction} />);

    // 3. ボタンを取得（正規表現 /ログアウト/i で柔軟にマッチさせます）
    const logoutButton = screen.getByRole('button', { name: /ログアウト/i });

    // 4. ボタンをクリック
    fireEvent.click(logoutButton);

    // 5. 遷移先のURL "/" を引数として関数が呼ばれたか検証
    expect(mockLogoutAction).toHaveBeenCalledWith('/');
  });
});
