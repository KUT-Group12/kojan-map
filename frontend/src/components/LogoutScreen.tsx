import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { LogOut, Check, ArrowLeft } from 'lucide-react';

interface User {
  name?: string; // 修正: ユーザー名を追加
  email: string;
  role: 'business' | 'general' | 'admin';
}

interface LogoutScreenProps {
  user: User;
  onLogout: () => void;
  onBack: () => void;
}

/**
 * Render a logout confirmation screen for the given user.
 *
 * Renders a centered card showing the user's membership type and email, notes about data retained after logout,
 * a Google-login hint, a primary "ログアウトする" button and a secondary "戻る" button.
 *
 * @param user - The user to display; `name` (optional) is shown as a greeting when present, `email` is shown, and `role` controls membership label and an extra retained-data item for business users.
 * @param onLogout - Callback invoked when the primary logout button is clicked.
 * @param onBack - Callback invoked when the back button is clicked.
 * @returns The React element for the logout confirmation screen.
 */
export function LogoutScreen({ user, onLogout, onBack }: LogoutScreenProps) {
  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-6">
        <Card className="border-blue-200 shadow-md">
          <CardHeader className="flex flex-col items-center text-center">
            <div className="mb-2 text-blue-600">
              <LogOut className="w-10 h-10" />
            </div>
            <CardTitle className="text-xl">ログアウトの確認</CardTitle>
            <CardDescription>
              {/* テストが期待する文言に修正 */}
              {user.name && (
                <span className="block font-bold text-gray-900 mb-1">{user.name} 様</span>
              )}
              ログアウトしてもよろしいですか？
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* アカウント情報 */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">会員区分</span>
                <span className="font-medium text-blue-800">
                  {user.role === 'business' ? 'ビジネス会員' : '一般会員'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">メールアドレス</span>
                <span className="font-medium text-gray-800">{user.email}</span>
              </div>
            </div>

            {/* 注意事項 */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-600">
                ログアウト後も保持されるデータ：
              </p>
              <div className="space-y-2">
                <div className="flex items-start space-x-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>すべての投稿とピン情報</span>
                </div>
                <div className="flex items-start space-x-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>リアクション履歴</span>
                </div>
                {user.role === 'business' && (
                  <div className="flex items-start space-x-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>事業者情報とアイコン</span>
                  </div>
                )}
              </div>
            </div>

            {/* Googleログインのヒント */}
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
              <p className="text-xs text-gray-600 leading-relaxed">
                💡 ヒント: 次回ログイン時には、
                <br />
                Google アカウントで再度ログインしてください。
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                variant="default"
                onClick={onLogout}
                className="w-full py-6 text-lg font-bold"
              >
                ログアウトする
              </Button>

              {/* 修正: 戻るボタンを追加（テストの onBack 呼び出しに対応） */}
              <Button
                variant="ghost"
                onClick={onBack}
                className="w-full text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                戻る
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}