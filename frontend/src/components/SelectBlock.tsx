import { useState } from 'react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Block } from '../types';
import { getStoredJWT } from '../lib/auth';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8080';

interface SelectBlockProps {
  userId: Block['blockedId'];
  onBlockUser: (userId: string) => void; // 親コンポーネントで定義された処理
  onClose: () => void;
}

export function SelectBlock({ userId, onBlockUser, onClose }: SelectBlockProps) {
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
      const token = getStoredJWT();
      if (!token) {
        toast.error('認証情報がありません。再度ログインしてください。');
        return;
      }
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const response = await fetch(`${API_BASE_URL}/api/users/block`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: userId, // API仕様のキー名に合わせる
          // blockerId: blockerId, // Backend extracts from token
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
