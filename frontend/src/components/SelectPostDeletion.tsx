import { Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface SelectPostDeletionProps {
  pinId: string;
  onDelete: (pinId: string) => void;
  onClose: () => void;
}

/**
 * Renders a destructive "Delete" button that asks the user for confirmation and, when confirmed, calls `onDelete` with the provided `pinId`, shows a success toast, and then calls `onClose`.
 *
 * @param pinId - ID of the post to delete
 * @param onDelete - Callback invoked with `pinId` when deletion is confirmed
 * @param onClose - Callback invoked after deletion completes
 * @returns A React element that renders the delete button
 */
export function SelectPostDeletion({ pinId, onDelete, onClose }: SelectPostDeletionProps) {
  const handleDelete = () => {
    if (confirm('この投稿を削除してもよろしいですか？')) {
      onDelete(pinId);
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