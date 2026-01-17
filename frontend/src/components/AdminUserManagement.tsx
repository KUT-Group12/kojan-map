import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Trash2 } from 'lucide-react';

// ユーザーの型定義
interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'general' | 'business' | string;
  posts: number;
}

interface AdminUserManagementProps {
  users: AdminUser[];
  onDeleteAccount: (userId: string) => void;
}

export default function AdminUserManagement({ users, onDeleteAccount }: AdminUserManagementProps) {
  const handleDeleteClick = (userId: string, userName: string) => {
    // ユーザーへの確認
    if (confirm(`${userName} さんのアカウントを削除してもよろしいですか？`)) {
      onDeleteAccount(userId);
    }
  };

  return (
    <div className="max-w-5xl">
      <Card className="shadow-xl border-slate-200">
        <CardHeader>
          <CardTitle>ユーザー一覧</CardTitle>
          <CardDescription>全てのユーザーアカウントの管理（削除・権限確認）</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {users.length > 0 ? (
              users.map((userItem) => (
                <div
                  key={userItem.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1">
                    {/* ...名前やバッジの表示... */}
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-medium text-slate-900">{userItem.name}</p>
                      <Badge
                        className={userItem.role === 'business' ? 'bg-blue-600' : 'bg-slate-400'}
                      >
                        {userItem.role === 'business' ? '事業者' : '一般'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">{userItem.email}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      投稿数: <span className="font-semibold">{userItem.posts}</span>
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    // 修正点: ハンドラー経由で実行
                    onClick={() => handleDeleteClick(userItem.id, userItem.name)}
                    className="shadow-md"
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
