import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Heart, Loader2 } from 'lucide-react';
import { Post, PinGenre, User } from '../types';
import { genreColors, genreLabels, GENRE_MAP } from '../lib/mockData';

interface UserReactionViewScreenProps {
  user: User; // ログイン中の自分
  onPinClick: (post: Post) => void;
}

export function UserReactionViewScreen({ user, onPinClick }: UserReactionViewScreenProps) {
  const [reactedPosts, setReactedPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReactedPosts = async () => {
      if (!user?.googleId) {
        setReactedPosts([]);
        setIsLoading(false);
        return;
      }
      try {
        // API仕様: GET /api/reactions/list?googleId=...
        const response = await fetch(
          `/api/reactions/list?googleId=${encodeURIComponent(user.googleId)}`
        );
        if (!response.ok) throw new Error('リアクション履歴の取得に失敗しました');

        const data = await response.json();
        // data.posts は Post[] 型の配列であることを想定
        setReactedPosts(data.posts || []);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReactedPosts();
  }, [user?.googleId]);

  const genreIdToKey = (genreId: number): PinGenre => {
    const entry = Object.entries(GENRE_MAP).find(([, id]) => id === genreId);
    return (entry?.[0] as PinGenre) ?? 'other';
  };

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
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onPinClick(post)}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-medium">{post.title}</h3>
              <Badge
                style={{
                  backgroundColor: genreColors[genreIdToKey(post.genreId) ?? 'other'],
                }}
                className="ml-2"
              >
                {genreLabels[genreIdToKey(post.genreId) ?? 'other']}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{post.text}</p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                  投稿者ID: {post.userId}
                </span>
              </div>
              <div className="flex items-center text-red-500 font-medium">
                <Heart className="w-4 h-4 mr-1 fill-current" />
                {post.numReaction}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
