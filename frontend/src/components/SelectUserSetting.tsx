import { User } from '../types';
import { Button } from './ui/button';
import { UserX, Trash2 } from 'lucide-react';
import { DisplayUserSetting } from './DisplayUserSetting';

interface SelectUserSettingProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onNavigateToDeleteAccount: () => void;
}

export function SelectUserSetting({ 
  user, 
  onUpdateUser, 
  onNavigateToDeleteAccount 
}: SelectUserSettingProps) {
  
  const handleUnblock = (userId: string) => {
    const next = (user.blockedUsers || []).filter(id => id !== userId);
    onUpdateUser({ ...user, blockedUsers: next });
  };

  return (
    <div className="space-y-4">
      {/* ブロックリスト設定 */}
      <DisplayUserSetting 
        title="ブロックリスト" 
        description="ブロックしたユーザーの管理"
      >
        {(!user.blockedUsers || user.blockedUsers.length === 0) ? (
          <p className="text-gray-500 text-sm">ブロックしたユーザーはいません</p>
        ) : (
          <div className="space-y-2">
            {user.blockedUsers.map((userId) => (
              <div key={userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <UserX className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">ユーザーID: {userId}</span>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleUnblock(userId)}>
                  ブロック解除
                </Button>
              </div>
            ))}
          </div>
        )}
      </DisplayUserSetting>

      {/* 退会設定 */}
      <DisplayUserSetting 
        title="退会" 
        description="アカウントの削除"
        className="border-red-200"
        titleClassName="text-red-600"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            アカウントを削除すると、すべての投稿とデータが完全に削除されます。この操作は取り消せません。
          </p>
          <Button variant="destructive" onClick={onNavigateToDeleteAccount}>
            <Trash2 className="w-4 h-4 mr-2" />
            アカウント削除画面へ
          </Button>
        </div>
      </DisplayUserSetting>
    </div>
  );
}