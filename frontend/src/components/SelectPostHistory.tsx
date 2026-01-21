import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Post, User } from '../types';
import { DisplayPostHistory } from './DisplayPostHistory';
import { SelectPostDeletion } from './SelectPostDeletion';
import { Loader2 } from 'lucide-react';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8080';

interface SelectPostHistoryProps {
  user: User;
  // posts: Post[];
  onPinClick: (post: Post) => void;
  // onDeletePin: (postId: number) => void;
  // setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
}

export function SelectPostHistory({ user, onPinClick }: SelectPostHistoryProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    const fetchHistory = async () => {
      try {
        // API仕様: GET /api/posts/history?googleId=...
        const response = await fetch(`${API_BASE_URL}/api/posts/history?googleId=${user.id}`);
        if (!response.ok) throw new Error('履歴の取得に失敗しました');

        const data = await response.json();
        // 仕様書のレスポンス形式 { "posts": [Post] } に合わせてセット
        setPosts(data.posts || []);
      } catch (error) {
        console.error('Fetch history error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [user?.id]);

  // 削除成功時にフロントエンドのリストから消去する
  const handleRemoveFromList = (deletedId: number) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.postId !== deletedId));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">まだ投稿がありません</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <DisplayPostHistory
          key={post.postId}
          post={post}
          onPinClick={onPinClick}
          formatDate={formatDate}
          /* 投稿削除 */
          deleteButton={
            <SelectPostDeletion
              postId={post.postId}
              onDelete={handleRemoveFromList}
              onClose={() => {}}
            />
          }
        />
      ))}
    </div>
  );
}
