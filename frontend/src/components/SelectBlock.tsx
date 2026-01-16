import { Button } from './ui/button';
import { toast } from 'sonner';

interface SelectBlockProps {
  userId: string;
  onBlockUser: (userId: string) => void; // 親コンポーネントで定義された処理
  onClose: () => void;
}

/**
 * Renders a destructive "Block" button that prompts for confirmation and, when confirmed, invokes the provided block handler and closes the parent UI.
 *
 * @param userId - Identifier of the user to be blocked
 * @param onBlockUser - Callback invoked with `userId` to perform the blocking action
 * @param onClose - Callback invoked to close the parent modal or dialog after a successful block
 * @returns The button element that manages confirmation, executes the block callback, shows a toast, and closes the UI on success
 */
export function SelectBlock({ userId, onBlockUser, onClose }: SelectBlockProps) {
  const handleBlock = () => {
    // ユーザーに確認を促す
    const isConfirmed = confirm('このユーザーをブロックしますか？');

    if (isConfirmed) {
      try {
        // バックエンドとの通信(fetch)を削除し、
        // 親から渡されたフロントエンドの処理を実行します。
        onBlockUser(userId);

        // 成功メッセージを表示
        toast.success('ユーザーをブロックしました');

        // モーダルなどを閉じる
        onClose();
      } catch (error) {
        console.error(error);
        toast.error('ブロック処理に失敗しました');
      }
    }
  };

  return (
    <Button onClick={handleBlock} variant="destructive">
      ブロック
    </Button>
  );
}