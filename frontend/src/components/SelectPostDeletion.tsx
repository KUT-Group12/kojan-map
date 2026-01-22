import { useState } from 'react';
import { getStoredJWT } from '../lib/auth';
import { Trash2, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8080';

interface SelectPostDeletionProps {
  postId: number;
  onDelete: (postId: number) => void;
  onClose: () => void;
}

export function SelectPostDeletion({ postId, onDelete, onClose }: SelectPostDeletionProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const handleDelete = async () => {
    /*
    if (confirm('この投稿を削除してもよろしいですか？')) {
      onDelete(postId);
      toast.success('投稿を削除しました');
      onClose();
    }*/
    if (!confirm('この投稿を削除してもよろしいですか？')) {
      return;
    }
    setIsDeleting(true);

    try {
      // 2. バックエンドAPI呼び出し (仕様書: PUT /api/posts/anonymize)
      const token = getStoredJWT();
      const response = await fetch(`${API_BASE_URL}/api/posts/anonymize`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          postId: postId,
        }),
      });

      if (!response.ok) {
        throw new Error('削除処理に失敗しました');
      }

      // レスポンス: { "message": "post anonymized" }
      const data = await response.json();
      console.log(data);

      // 3. 成功時の処理
      toast.success('投稿を削除しました');
      onDelete(postId); // 親コンポーネントのリストから消去させるコールバック
      onClose();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('削除中にエラーが発生しました');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button onClick={handleDelete} variant="destructive" disabled={isDeleting}>
      {/*
      <Trash2 className="w-4 h-4 mr-2" />
      削除*/}
      {isDeleting ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          削除中...
        </>
      ) : (
        <>
          <Trash2 className="w-4 h-4 mr-2" />
          削除
        </>
      )}
    </Button>
  );
}
