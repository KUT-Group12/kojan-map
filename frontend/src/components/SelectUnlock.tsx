import { User } from '../types';
import { Button } from './ui/button';

interface SelectUnlockProps {
  userId: string;
  user: User;
  onUpdateUser: (user: User) => void;
}

export function SelectUnlock({ userId, user, onUpdateUser }: SelectUnlockProps) {
  const handleUnblock = () => {
    const nextBlockedList = (user.blockedUsers || []).filter((id) => id !== userId);
    onUpdateUser({
      ...user,
      blockedUsers: nextBlockedList,
    });
  };

  return (
    <Button size="sm" variant="outline" onClick={handleUnblock}>
      ブロック解除
    </Button>
  );
}
