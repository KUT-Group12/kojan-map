import { Button } from './ui/button';
import { LogOut, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';

/**
 * ログアウト画面を表示するコンポーネント
 */
export function AdminSelectLogout() {
  const handleFinalLogout = () => {
    // 完全にページを離れる（ログイン画面へ）
    // もし遷移先が /admin/logout というファイルならそこへ飛ばします
    window.location.href = '/admin/logout';
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md shadow-2xl border-slate-200">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl">ログアウトの確認</CardTitle>
          <CardDescription>管理システムからログアウトします。よろしいですか？</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button
            variant="destructive"
            className="w-full py-6 text-lg shadow-lg"
            onClick={handleFinalLogout}
          >
            <LogOut className="w-5 h-5 mr-2" />
            ログアウトを実行する
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
