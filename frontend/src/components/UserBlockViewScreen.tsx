import { User } from '../types';
import { UserX } from 'lucide-react';
import { DisplayUserSetting } from './DisplayUserSetting';
import { SelectUnlock } from './SelectUnlock';

interface UserWithBlocked extends User {
  blockedUsers?: string[];
}

interface UserBlockViewScreenProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

export function UserBlockViewScreen({ user, onUpdateUser }: UserBlockViewScreenProps) {
  const currentUser = user as UserWithBlocked;
  const blockedUsers = currentUser.blockedUsers || [];

  return (
    <div className="space-y-4">
      <DisplayUserSetting title="ブロックリスト" description="ブロックしたユーザーの管理">
        {blockedUsers.length === 0 ? (
          <p className="text-gray-500 text-sm">ブロックしたユーザーはいません</p>
        ) : (
          <div className="space-y-2">
            {blockedUsers.map((blockedId) => (
              <div
                key={blockedId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <UserX className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">ユーザーID: {blockedId}</span>
                </div>
                {/* ロジックを持つコンポーネントを呼び出すだけ
                 */}
                <SelectUnlock userId={blockedId} user={user} onUpdateUser={onUpdateUser} />
              </div>
            ))}
          </div>
        )}
      </DisplayUserSetting>
    </div>
  );
}
