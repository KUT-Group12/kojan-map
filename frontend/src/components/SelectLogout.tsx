import { Button } from './ui/button';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  onLogout: () => void;
}

/**
 * ログアウト実行のみを担当するコンポーネント
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