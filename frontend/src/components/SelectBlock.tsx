import { Button } from './ui/button';
import { toast } from 'sonner';

interface SelectBlockProps {
  userId: string;
  onBlockUser: (userId: string) => void;
  onClose: () => void;
}

/**
 * Renders a destructive "Block" button that prompts for confirmation and blocks the specified user when confirmed.
 *
 * @param userId - Identifier of the user to block
 * @param onBlockUser - Callback invoked with `userId` to perform the block action
 * @param onClose - Callback invoked to close the UI after the user is blocked
 * @returns The button element that, when clicked and confirmed, invokes `onBlockUser(userId)`, shows a success toast, and calls `onClose()`
 */
export function SelectBlock({ userId, onBlockUser, onClose }: SelectBlockProps) {
  const handleBlock = () => {
    const isConfirmed = confirm(
      'このユーザーをブロックしますか？ ブロックすると相手の投稿が表示されなくなります。'
    );

    if (isConfirmed) {
      onBlockUser(userId);
      toast.success('ユーザーをブロックしました');
      onClose();
    }
  };

  return (
    <Button onClick={handleBlock} variant="destructive">
      ブロック
    </Button>
  );
}