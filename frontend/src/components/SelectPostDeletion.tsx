import { Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface SelectPostDeletionProps {
  pinId: string;
  onDelete: (pinId: string) => void;
  onClose: () => void;
}

/**
 * Renders a destructive "Delete" button for a post and handles the confirmed deletion flow.
 *
 * @param pinId - The identifier of the post to delete.
 * @param onDelete - Called with `pinId` when the user confirms deletion.
 * @param onClose - Called after a successful deletion to close the surrounding UI.
 * @returns The button element that prompts for confirmation and, if confirmed, invokes `onDelete`, shows a success toast, and then invokes `onClose`.
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