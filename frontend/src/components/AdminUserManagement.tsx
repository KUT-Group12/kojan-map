import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Trash2 } from 'lucide-react';

// ユーザーの型定義
export interface AdminUser {
  googleId: string; // id -> googleId (PK)
  fromName: string; // 表示名 (※DBには無いがモジュール設計 M4-6-1等で取得対象) [cite: 128]
  gmail: string; // email -> gmail
  role: 'user' | 'business' | 'admin'; // 会員区分 (ENUM)
  registrationDate: string; // 登録日
  // 統計情報 (表12 投稿内容 の postId 数を外部でカウント)
  postCount: number; // posts -> postCount
}

interface AdminUserManagementProps {
  users: AdminUser[];
  onDeleteAccount: (googleId: string) => void; // 引数名を googleId に変更
}

export default function AdminUserManagement({ users, onDeleteAccount }: AdminUserManagementProps) {
  const handleDeleteClick = (googleId: string, userName: string) => {
    // ユーザーへの確認
    if (confirm(`${userName} さんのアカウントを削除してもよろしいですか？`)) {
      onDeleteAccount(googleId); // googleId を渡す [cite: 128]
    }
  };

  return (
    <div className="max-w-5xl">
      <Card className="shadow-xl border-slate-200">
        <CardHeader>
          <CardTitle>ユーザー一覧</CardTitle>
          <CardDescription>全ユーザーアカウント（一般・事業者・管理者）の管理</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {users.length > 0 ? (
              users.map((userItem) => (
                <div
                  key={userItem.googleId} // googleId を key に使用
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-medium text-slate-900">{userItem.fromName}</p>
                      <Badge
                        className={
                          userItem.role === 'business'
                            ? 'bg-blue-600'
                            : userItem.role === 'admin'
                              ? 'bg-purple-600'
                              : 'bg-slate-400'
                        }
                      >
                        {/* 会員区分の表示  */}
                        {userItem.role === 'business'
                          ? '事業者'
                          : userItem.role === 'admin'
                            ? '管理者'
                            : '一般'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">{userItem.gmail}</p>
                    <div className="flex space-x-4 mt-1">
                      <p className="text-xs text-slate-500">
                        投稿数: <span className="font-semibold">{userItem.postCount}</span>
                      </p>
                      <p className="text-xs text-slate-500">登録日: {userItem.registrationDate}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteClick(userItem.googleId, userItem.fromName)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    削除
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                該当するユーザーが見つかりません。
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
