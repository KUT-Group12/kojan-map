import { useState } from 'react';
import { User } from '../types';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getStoredJWT } from '../lib/auth';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8080';

interface UserWithBlocked extends User {
  id: string;
  blockedUsers?: string[];
}

interface SelectUnlockProps {
  userId: string;
  user: UserWithBlocked;
  onUpdateUser: (user: User) => void;
}

export function SelectUnlock({ userId, user, onUpdateUser }: SelectUnlockProps) {
  const [isUnblocking, setIsUnblocking] = useState(false);
  const handleUnblock = async () => {
    setIsUnblocking(true);
    try {
      const token = getStoredJWT();
      if (!token) {
        toast.error('認証情報がありません。再度ログインしてください。');
        return;
      }

      // 1. API仕様: DELETE /api/users/block
      // リクエストボディ形式で userId(相手) と blockerId(自分) を送信
      const response = await fetch(`${API_BASE_URL}/api/users/block`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: userId, // ブロックされているユーザー
          blockerId: user.id, // ブロックした人（自分）
        }),
      });

      if (!response.ok) {
        throw new Error('ブロック解除に失敗しました');
      }

      const data = await response.json();
      console.log(data);

      // 2. フロントエンド側の状態を更新
      // 現在のブロックリストから削除したユーザーを除外する
      const updatedBlockedUsers = user.blockedUsers?.filter((id) => id !== userId) || [];

      onUpdateUser({
        ...user,
        blockedUsers: updatedBlockedUsers,
      } as User);

      toast.success('ブロックを解除しました');
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast.error('エラーが発生しました。再度お試しください。');
    } finally {
      setIsUnblocking(false);
    }
  };
  return (
    <Button size="sm" variant="outline" onClick={handleUnblock} disabled={isUnblocking}>
      {isUnblocking ? (
        <>
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          処理中
        </>
      ) : (
        'ブロック解除'
      )}
    </Button>
  );
}
