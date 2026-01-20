import { Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface SelectPostDeletionProps {
  postId: number;
  onDelete: (pinId: number) => void;
  onClose: () => void;
}

export function SelectPostDeletion({ postId, onDelete, onClose }: SelectPostDeletionProps) {
  const handleDelete = () => {
    if (confirm('この投稿を削除してもよろしいですか？')) {
      onDelete(postId);
      toast.success('投稿を削除しました');
      onClose();
    }
  };

  return (
    <Button onClick={handleDelete} variant="destructive">
      <Trash2 className="w-4 h-4 mr-2" />
      削除
    </Button>
  );
}
