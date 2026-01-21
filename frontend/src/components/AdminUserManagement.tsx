import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Trash2 } from 'lucide-react';
import { User } from '../types';

// ユーザーの型定義
export interface AdminUser extends User {
  postCount: number; // 投稿数
}

interface AdminUserManagementProps {
  users: AdminUser[];
  onDeleteAccount: (googleId: string) => void; // 引数名を googleId に変更
}

export default function AdminUserManagement({ users, onDeleteAccount }: AdminUserManagementProps) {
  const handleDeleteClick = (googleId: string, fromName?: string) => {
    // ユーザーへの確認（名前がない場合はIDを表示）
    const displayName = fromName || googleId;
    if (confirm(`${displayName} さんのアカウントを削除してもよろしいですか？`)) {
      onDeleteAccount(googleId);
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
                  key={userItem.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      {/* fromName が optional なのでフォールバックを設定 */}
                      <p className="font-medium text-slate-900">{userItem.name || '名称未設定'}</p>
                      <Badge
                        className={
                          userItem.role === 'business'
                            ? 'bg-blue-600'
                            : userItem.role === 'admin'
                              ? 'bg-purple-600'
                              : 'bg-slate-400'
                        }
                      >
                        {userItem.role === 'business'
                          ? '事業者'
                          : userItem.role === 'admin'
                            ? '管理者'
                            : '一般'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">{userItem.email}</p>
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
