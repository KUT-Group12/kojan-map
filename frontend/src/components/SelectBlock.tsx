import { Button } from './ui/button';
import { toast } from 'sonner';

interface SelectBlockProps {
  userId: string;
  onBlockUser: (userId: string) => void;
  onClose: () => void;
}

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
    <Button
      onClick={handleBlock}
      variant="destructive"
    >
      ブロック
    </Button>
  );
}