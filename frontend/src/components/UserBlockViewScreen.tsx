import { useEffect, useState } from 'react';
import { User, Block } from '../types';
import { UserX, Loader2 } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(true);
  const currentUser = user as UserWithBlocked;
  const blockedUsers = currentUser.blockedUsers || [];

  useEffect(() => {
    const fetchBlockedUsers = async () => {
      try {
        // 1. API仕様: GET /api/users/block/list?googleId=...
        const response = await fetch(`/api/users/block/list?googleId=${user.googleId}`);

        if (!response.ok) {
          throw new Error('ブロックリストの取得に失敗しました');
        }

        const data = await response.json();
        console.log(data);

        // 2. レスポンス形式: { "blocks": [{ "id": 1, "userId": "...", "blockerId": "..." }, ...] }
        // APIから返ってきたデータの中から、自分がブロックしている相手(userId)のIDだけを抽出
        const blockedIds = data.blocks.map((block: Block) => block.blockedId);

        // 3. 親コンポーネントのユーザー情報を更新して、ブロックリストを画面に反映
        onUpdateUser({
          ...user,
          blockedUsers: blockedIds,
        } as User);
      } catch (error) {
        console.error('Error fetching blocked users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlockedUsers();
  }, [user.googleId, user, onUpdateUser]); // コンポーネント表示時に実行

  return (
    <div className="space-y-4">
      <DisplayUserSetting title="ブロックリスト" description="ブロックしたユーザーの管理">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">読み込み中...</span>
          </div>
        ) : blockedUsers.length === 0 ? (
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
                <SelectUnlock userId={blockedId} user={currentUser} onUpdateUser={onUpdateUser} />
              </div>
            ))}
          </div>
        )}
      </DisplayUserSetting>
    </div>
  );
}
