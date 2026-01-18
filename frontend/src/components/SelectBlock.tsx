import { Button } from './ui/button';
import { toast } from 'sonner';

interface SelectBlockProps {
  userId: string;
  onBlockUser: (userId: string) => void; // 親コンポーネントで定義された処理
  onClose: () => void;
}

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
