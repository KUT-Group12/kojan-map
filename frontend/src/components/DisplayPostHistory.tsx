import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Heart } from 'lucide-react';
import { Post } from '../types'; // PinGenre のインポートは不要になるため削除
// mockData からのインポートを削除
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
  return (
    <Card className="hover:shadow-md transition-all border-slate-200">
      <CardContent className="p-4 flex justify-between items-start">
        <div className="flex-1 cursor-pointer" onClick={() => onPinClick(post)}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800">{post.title}</h3>
              <Badge
                style={{
                  // DBから取得した色を直接適用。無い場合はデフォルトのグレー
                  backgroundColor: post.genreColor || '#64748b',
                  color: '#ffffff',
                }}
                className="border-none shadow-sm font-bold"
              >
                {/* DBから取得したジャンル名を直接表示 */}
                {post.genreName || 'その他'}
              </Badge>
            </div>
          </div>

          <p className="text-sm text-slate-600 mb-3 line-clamp-2 leading-relaxed">{post.text}</p>

          <div className="flex items-center space-x-4 text-xs font-bold text-slate-400">
            <span className="flex items-center text-rose-400 bg-rose-50 px-2 py-1 rounded-full">
              <Heart className="w-3.5 h-3.5 mr-1 fill-current" />
              {post.numReaction}
            </span>
            <span className="bg-slate-50 px-2 py-1 rounded-full">
              📅 {formatDate(new Date(post.postDate))}
            </span>
            {post.numView !== undefined && (
              <span className="bg-slate-50 px-2 py-1 rounded-full">👁️ {post.numView} 閲覧</span>
            )}
          </div>
        </div>

        {/* 削除ボタンエリア */}
        <div className="ml-4 pt-1">{deleteButton}</div>
      </CardContent>
    </Card>
  );
}
