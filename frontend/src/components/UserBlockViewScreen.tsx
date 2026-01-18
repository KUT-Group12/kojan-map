import { User, Block } from '../types';
import { UserX } from 'lucide-react';
import { DisplayUserSetting } from './DisplayUserSetting';
import { SelectUnlock } from './SelectUnlock';

interface UserBlockViewScreenProps {
  block: Block;
  user: User;
  onUpdateUser: (user: User) => void;
}

export function UserBlockViewScreen({ block, user, onUpdateUser }: UserBlockViewScreenProps) {
  return (
    <div className="space-y-4">
      <DisplayUserSetting title="ブロックリスト" description="ブロックしたユーザーの管理">
        {!block.blockedId ? (
          <p className="text-gray-500 text-sm">ブロックしたユーザーはいません</p>
        ) : (
          <div className="space-y-2">
            <div
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <UserX className="w-4 h-4 text-gray-500" />
                <span className="text-sm">ユーザーID: {block.blockedId}</span>
              </div>
              {/* ロジックを持つコンポーネントを呼び出すだけ
                 */}
              <SelectUnlock userId={block.blockedId} user={user} onUpdateUser={onUpdateUser} />
            </div>
          </div>
        )}
      </DisplayUserSetting>
    </div>
  );
}
