import { Button } from './ui/button';

// 1. プロパティの型を定義
interface AdminSelectLogoutProps {
  onLogoutAction?: (url: string) => void;
}

// 2. プロパティを受け取り、デフォルトで location.href を使うように設定
export function AdminSelectLogout({ 
  onLogoutAction = (url) => { window.location.href = url; } 
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