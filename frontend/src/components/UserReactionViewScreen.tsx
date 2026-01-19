import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Heart } from 'lucide-react';
import { Post, Genre, User } from '../types';
import { genreColors, genreLabels } from '../lib/mockData';

interface UserReactionViewScreenProps {
  reactedPosts: Post[];
  userNameMap: Record<string, string>; // userId -> fromName のマップ
  genre: Genre;
  onPostClick: (post: Post) => void;
}

export function UserReactionViewScreen({ reactedPosts, userNameMap, genre, onPostClick }: UserReactionViewScreenProps) {

  const getAuthorName = (userId: string) => {
    return userNameMap[userId] || '匿名';
  };
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
          onClick={() => onPostClick(post)}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-medium">{post.title}</h3>
              <Badge style={{ backgroundColor: genreColors[genre.color] }}>
                {genreLabels[genre.genreId]}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{post.text}</p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                  投稿者: {getAuthorName(post.userId)}
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
