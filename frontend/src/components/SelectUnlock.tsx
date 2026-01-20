import { User } from '../types';
import { Button } from './ui/button';

interface UserWithBlocked extends User {
  blockedUsers?: string[];
}

interface SelectUnlockProps {
  userId: string;
  user: UserWithBlocked;
  onUpdateUser: (user: User) => void;
}

export function SelectUnlock({ userId, user, onUpdateUser }: SelectUnlockProps) {
  const handleUnblock = async () => {
    try {
      // ブロック解除 API 呼び出し
      const response = await fetch(`/api/users/${user.googleId || 'me'}/blocks/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to unblock user');
      }
      const newBlockedList = await response.json();

      onUpdateUser({
        ...user,
        blockedUsers: newBlockedList,
      } as User);

      //エラー処理
    } catch (error) {
      console.error('Error unblocking user:', error);
    }
  };
  return (
    <Button size="sm" variant="outline" onClick={handleUnblock}>
      ブロック解除
    </Button>
  );
}
