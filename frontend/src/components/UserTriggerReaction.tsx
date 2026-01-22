import { useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { Reaction } from '../types';
import { getStoredJWT } from '../lib/auth';

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
  // userId, // Unused
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
      // Backend toggles reaction on POST
      const method = 'POST';
      const token = getStoredJWT();
      if (!token) {
        toast.error('認証情報がありません。再度ログインしてください。');
        return;
      }
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

      const response = await fetch(`${API_BASE_URL}/api/posts/reaction`, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          postId: postId,
        }), // Backend expects only postId, userId is extracted from token
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
