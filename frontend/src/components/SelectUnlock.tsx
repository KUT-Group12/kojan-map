import { User } from '../types';
import { Button } from './ui/button';

interface SelectUnlockProps {
  userId: string;
  user: User;
  onUpdateUser: (user: User) => void;
}

/**
 * Renders a small outlined "ブロック解除" button that removes `userId` from `user.blockedUsers` and invokes `onUpdateUser` with the updated user.
 *
 * @param userId - The ID to remove from the user's blockedUsers list.
 * @param user - The current user object to base the update on.
 * @param onUpdateUser - Callback invoked with the updated user object after `userId` is removed.
 * @returns The button element that triggers the unblock action when clicked.
 */
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