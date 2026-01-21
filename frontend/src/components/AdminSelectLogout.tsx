import { Button } from './ui/button';

export function AdminSelectLogout() {
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (e) {
      console.error(e);
    } finally {
      //画面遷移
      window.location.href = '/';
    }
  };

  return (
    <Button onClick={handleLogout} variant="outline">
      ログアウト
    </Button>
  );
}

{
  /*import { Button } from './ui/button';

>>>>>>> main
// 1. プロパティの型を定義
interface AdminSelectLogoutProps {
  onLogoutAction?: (url: string) => void;
}

// 2. プロパティを受け取り、デフォルトで location.href を使うように設定
export function AdminSelectLogout({
  onLogoutAction = (url) => {
    window.location.href = url;
  },
}: AdminSelectLogoutProps) {
  const handleFinalLogout = () => {
    // 3. 渡された関数を実行する
    onLogoutAction('/');
  };

  return (
    <Button onClick={handleFinalLogout} variant="outline">
      ログアウト
    </Button>
  );
}
  */
}
