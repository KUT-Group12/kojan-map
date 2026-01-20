import { useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { Reaction } from '../types';

interface UserTriggerReactionProps {
  postId: Reaction['postId'];
  userId: Reaction['userId'];
  isReacted: boolean;
  userRole: string;
  isDisabled: boolean;
  onReaction: (postId: number) => void;
}

export function UserTriggerReaction({
  postId,
  userId,
  isReacted,
  userRole,
  isDisabled,
  onReaction,
}: UserTriggerReactionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isBusiness = userRole === 'business';

  const handleToggleReaction = async () => {
    if (isDisabled || isBusiness || isLoading) return;

    setIsLoading(true);
    try {
      // API仕様: POST(追加) または DELETE(削除)
      // ボディのキー名は仕様書の postId, userId に合わせる
      const method = isReacted ? 'DELETE' : 'POST';
      const response = await fetch('/api/reactions', {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: postId,
          userId: userId,
        }),
      });

      if (!response.ok) {
        throw new Error('リアクションの更新に失敗しました');
      }

      // 成功時に親コンポーネントへ通知
      onReaction(postId);

      if (!isReacted) {
        toast.success('リアクションしました！');
      }
    } catch (error) {
      console.error('Reaction error:', error);
      toast.error('通信エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleToggleReaction}
      variant={isReacted ? 'default' : 'outline'}
      className="flex-1"
      disabled={isDisabled || isBusiness || isLoading}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Heart className={`w-4 h-4 mr-2 ${isReacted ? 'fill-white' : ''}`} />
      )}
      {isBusiness
        ? '事業者はリアクション不可'
        : isLoading
          ? '処理中...'
          : isReacted
            ? 'リアクション済み'
            : 'リアクション'}
    </Button>
  );
}
