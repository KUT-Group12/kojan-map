import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { LogOut, Check } from 'lucide-react'; // 修正箇所1: Checkを追加

interface User {
  email: string;
  role: 'business' | 'general' | 'admin';
}

interface LogoutScreenProps {
  user: User;
  onLogout: () => void;
}

/**
 * Render a logout confirmation screen that displays the current account details, data retained after logout, and a logout action.
 *
 * Shows the user's membership type and email, includes a list of data preserved after logout (adds a business-specific item when `user.role` is `"business"`), and renders a button that triggers `onLogout`.
 *
 * @param user - The current user object containing `email` and `role` (`"business" | "general" | "admin"`).
 * @param onLogout - Callback invoked when the user confirms logout (e.g., by clicking the logout button).
 * @returns The JSX element for the logout confirmation UI.
 */
export function LogoutScreen({ user, onLogout }: LogoutScreenProps) {
  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-6">
        <Card className="border-blue-200 shadow-md">
          <CardHeader className="flex flex-col items-center text-center">
            <div className="mb-2 text-blue-600">
              <LogOut className="w-10 h-10" />
            </div>
            <CardTitle className="text-xl">ログアウトの確認</CardTitle>
            <CardDescription>現在のアカウントからログアウトします</CardDescription>
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

            {/* 注意事項：Checkアイコンを使用したリスト */}
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

            <Button variant="default" onClick={onLogout} className="w-full py-6 text-lg font-bold">
              ログアウトする
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}