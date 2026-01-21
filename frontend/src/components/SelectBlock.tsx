import { useState } from 'react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Block } from '../types';

interface SelectBlockProps {
  userId: Block['blockedId'];
  blockerId: Block['blockerId'];
  onBlockUser: (userId: string) => void; // 親コンポーネントで定義された処理
  onClose: () => void;
}

export function SelectBlock({ userId, blockerId, onBlockUser, onClose }: SelectBlockProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleBlock = async () => {
    // ユーザーに確認を促す
    if (
      !confirm(
        'このユーザーをブロックしますか？\nブロックすると、このユーザーの投稿が表示されなくなります。'
      )
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      // API仕様書(POST /api/users/block)に合わせてリクエスト
      const response = await fetch('/api/users/block', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId, // API仕様のキー名に合わせる
          blockerId: blockerId, // API仕様のキー名に合わせる
        }),
      });

      if (!response.ok) {
        throw new Error('ブロック処理に失敗しました');
      }

      toast.success('ユーザーをブロックしました');
      onBlockUser(userId);
      onClose();
    } catch (error) {
      console.error('Block error:', error);
      toast.error('エラーが発生しました。再度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button onClick={handleBlock} variant="destructive" disabled={isSubmitting}>
      {isSubmitting ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          処理中
        </>
      ) : (
        'ブロック'
      )}
    </Button>
  );
}
