import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Heart } from 'lucide-react';
import { Post, PinGenre } from '../types';
import { genreColors, genreLabels, GENRE_MAP } from '../lib/mockData';
import { ReactNode } from 'react';

interface DisplayPostHistoryProps {
  post: Post;
  onPinClick: (post: Post) => void;
  formatDate: (date: Date) => string;
  deleteButton: ReactNode;
}

export function DisplayPostHistory({
  post,
  onPinClick,
  formatDate,
  deleteButton,
}: DisplayPostHistoryProps) {
  const genreIdToKey = (genreId: number): PinGenre => {
    const entry = Object.entries(GENRE_MAP).find(([, id]) => id === genreId);
    return (entry?.[0] as PinGenre) ?? 'other';
  };
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex justify-between items-start">
        <div className="flex-1 cursor-pointer" onClick={() => onPinClick(post)}>
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
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <Heart className="w-4 h-4 mr-1" />
              {post.numReaction}
            </span>
            <span>{formatDate(new Date(post.postDate))}</span>
          </div>
        </div>
        <div className="ml-4">{deleteButton}</div>
      </CardContent>
    </Card>
  );
}
