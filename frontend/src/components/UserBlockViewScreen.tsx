import { useEffect, useState, useRef } from 'react';
import { getStoredJWT } from '../lib/auth';
import { User, Block } from '../types';
import { UserX, Loader2 } from 'lucide-react';
import { DisplayUserSetting } from './DisplayUserSetting';
import { SelectUnlock } from './SelectUnlock';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8080';

interface UserWithBlocked extends User {
  id: string;
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
  const userRef = useRef(user);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    const fetchBlockedUsers = async () => {
      try {
        const token = getStoredJWT && getStoredJWT();
        // 1. API仕様: GET /api/users/block/list?googleId=...
        const response = await fetch(
          `${API_BASE_URL}/api/users/block/list?googleId=${user.googleId}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : '',
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('ブロックリストの取得に失敗しました');
        }

        const data = await response.json();
        console.log(data);

        // 2. レスポンス形式: { "blocks": [{ "id": 1, "userId": "...", "blockerId": "..." }, ...] }
        // APIから返ってきたデータの中から、自分がブロックしている相手(userId)のIDだけを抽出
        const blockedIds = data.blocks.map((block: Block) => block.blockedId).sort();
        const currentBlockedIds = [...(currentUser.blockedUsers || [])].sort();

        // 変更がある場合のみ更新（無限ループ防止）
        if (JSON.stringify(blockedIds) !== JSON.stringify(currentBlockedIds)) {
          // 3. 親コンポーネントのユーザー情報を更新して、ブロックリストを画面に反映
          onUpdateUser({
            ...userRef.current,
            blockedUsers: blockedIds,
          } as User);
        }
      } catch (error) {
        console.error('Error fetching blocked users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlockedUsers();
  }, [user.googleId, onUpdateUser]); // googleId 変更時に実行

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
