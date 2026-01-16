import { Button } from './ui/button';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  onLogout: () => void;
}

/**
 * Renders a button that triggers the provided logout callback when clicked.
 *
 * @param onLogout - Callback invoked with no arguments when the user clicks the button
 * @returns A Button element labeled "ログアウトする" with a logout icon that calls `onLogout` on click
 */
export function LogoutButton({ onLogout }: LogoutButtonProps) {
  const handleLogout = () => {
    // 呼び出し元（親）から渡されたログアウト処理を実行
    onLogout();
  };

  return (
    <Button
      variant="default" // 元のコードの指定通り
      onClick={handleLogout}
      className="flex-1" // 親のレイアウト（flex）に合わせるため
    >
      <LogOut className="w-4 h-4 mr-2" />
      ログアウトする
    </Button>
  );
}