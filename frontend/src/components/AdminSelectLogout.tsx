import { Button } from './ui/button';

// 1. プロパティの型を定義
interface AdminSelectLogoutProps {
  onLogoutAction?: (url: string) => void;
}

/**
 * Renders a logout button that invokes a provided logout action when clicked.
 *
 * @param onLogoutAction - Callback invoked with the destination URL when logout is performed; defaults to setting `window.location.href` to the given URL.
 * @returns A JSX element rendering an outlined "ログアウト" button that triggers the logout action.
 */
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