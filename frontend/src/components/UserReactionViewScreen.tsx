import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Heart, Loader2 } from 'lucide-react';
import { Post, User } from '../types';
// 固定の色定数 (genreColors) のインポートを削除

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8080';

interface UserReactionViewScreenProps {
  user: User;
  onPinClick: (post: Post) => void;
}

export function UserReactionViewScreen({ user, onPinClick }: UserReactionViewScreenProps) {
  const [reactedPosts, setReactedPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const fetchReactedPosts = async () => {
      if (!user?.id) {
        setReactedPosts([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/reactions/list?googleId=${encodeURIComponent(user.id)}`,
          { signal: controller.signal }
        );
        if (!response.ok) throw new Error('リアクション履歴の取得に失敗しました');

        const data = await response.json();
        // APIから data.posts[].genreColor や data.posts[].genreName が返ってくる想定
        if (active) setReactedPosts(data.posts || []);
      } catch (error) {
        if ((error as DOMException).name !== 'AbortError') {
          console.error('Fetch error:', error);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchReactedPosts();
    return () => {
      active = false;
      controller.abort();
    };
  }, [user?.id]);

  // DBからデータが来るため、IDからキーへ変換するロジック (genreIdToKey) は削除

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (reactedPosts.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          まだリアクションがありません
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {reactedPosts.map((post) => (
        <Card
          key={post.postId}
          className="hover:shadow-md transition-shadow cursor-pointer border-slate-200"
          onClick={() => onPinClick(post)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-800">{post.title}</h3>
              <Badge
                style={{
                  // DBから返ってきた色を直接適用。無い場合はデフォルトのグレー
                  backgroundColor: post.genreColor || '#64748b',
                  color: '#ffffff',
                }}
                className="border-none shadow-sm"
              >
                {/* DBから返ってきたジャンル名を直接表示 */}
                {post.genreName || 'その他'}
              </Badge>
            </div>

            <p className="text-sm text-slate-600 mb-3 line-clamp-2">{post.text}</p>

            <div className="flex items-center justify-between text-xs text-slate-500 border-t pt-3">
              <div className="flex items-center space-x-2">
                <span className="bg-slate-100 px-2 py-1 rounded">
                  {post.businessName || `ユーザー:${post.userId}`}
                </span>
              </div>
              <div className="flex items-center text-rose-500 font-bold bg-rose-50 px-2 py-1 rounded-full">
                <Heart className="w-3.5 h-3.5 mr-1 fill-current" />
                {post.numReaction}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
