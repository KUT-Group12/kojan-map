import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { LogOut, Check, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { User } from '../types';

import { API_BASE_URL } from '../lib/apiBaseUrl';

interface LogoutScreenProps {
  user: User;
  onLogout: () => void;
  onBack: () => void;
}

export function LogoutScreen({ user, onLogout, onBack }: LogoutScreenProps) {
  const [isPending, setIsPending] = useState(false);
  const handleLogout = async () => {
    setIsPending(true);
    try {
      // JWTトークンとセッションIDを取得
      const token = localStorage.getItem('kojanmap_jwt');
      const sessionId = localStorage.getItem('kojanmap_sessionId');
      if (!sessionId) {
        toast.error('セッション情報がありません。再度ログインしてください。');
        setIsPending(false);
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok && response.status !== 401) {
        const errorText = await response.text();
        console.error('Logout API error:', errorText);
        throw new Error('サーバー側でのログアウトに失敗しました');
      }

      // JWT・ユーザー・セッションID削除
      localStorage.removeItem('kojanmap_jwt');
      localStorage.removeItem('kojanmap_user');
      localStorage.removeItem('kojanmap_sessionId');
      toast.success('ログアウトしました');
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      // 通信失敗してもJWT・ユーザー・セッションID削除
      localStorage.removeItem('kojanmap_jwt');
      localStorage.removeItem('kojanmap_user');
      localStorage.removeItem('kojanmap_sessionId');
      onLogout();
    } finally {
      setIsPending(false);
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-6">
        <Card className="border-blue-200 shadow-md">
          <CardHeader className="flex flex-col items-center text-center">
            <div className="mb-2 text-blue-600">
              {isPending ? (
                <Loader2 className="w-10 h-10 animate-spin" />
              ) : (
                <LogOut className="w-10 h-10" />
              )}
            </div>
            <CardTitle className="text-xl">ログアウトの確認</CardTitle>
            <CardDescription>
              {user.fromName && (
                <span className="block font-bold text-gray-900 mb-1">{user.fromName}様</span>
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
                  {user.role === 'business'
                    ? 'ビジネス会員'
                    : user.role === 'admin'
                      ? '管理者'
                      : '一般会員'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">メールアドレス</span>
                <span className="font-medium text-gray-800">{user.gmail}</span>
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

            {/* Googleログインのヒント (削除) */}

            <div className="flex flex-col gap-3">
              <Button
                variant="default"
                onClick={handleLogout}
                disabled={isPending}
                className="w-full py-6 text-lg font-bold"
              >
                {isPending ? 'ログアウト中...' : 'ログアウトする'}
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
