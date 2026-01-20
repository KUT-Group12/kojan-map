import { Card, CardContent } from './ui/card';
import { Post } from '../types';
import { DisplayPostHistory } from './DisplayPostHistory';
import { SelectPostDeletion } from './SelectPostDeletion';

interface SelectPostHistoryProps {
  posts: Post[];
  onPinClick: (post: Post) => void;
  onDeletePin: (postId: number) => void;
}

export function SelectPostHistory({ posts, onPinClick, onDeletePin }: SelectPostHistoryProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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
          onDeletePin={onDeletePin}
          formatDate={formatDate}
          /* 投稿削除 */
          deleteButton={
            <SelectPostDeletion
              postId={post.postId}
              onDelete={(id) => onDeletePin(id)}
              onClose={() => {}}
            />
          }
        />
      ))}
    </div>
  );
}
