import { Card, CardContent } from './ui/card';
import { Post } from '../types';
import { DisplayPostHistory } from './DisplayPostHistory';
import { SelectPostDeletion } from './SelectPostDeletion';

interface SelectPostHistoryProps {
  posts: Post[];
  onPostClick: (post: Post) => void;
  onDeletePost: (postId: number) => void;
}

export function SelectPostHistory({ posts, onPostClick, onDeletePost }: SelectPostHistoryProps) {
  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
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
          pin={post}
          onPinClick={onPostClick}
          onDeletePin={(id) => onDeletePost(parseInt(id))}
          formatDate={formatDate}
          /* 投稿削除 */
          deleteButton={
            <SelectPostDeletion
              pinId={post.postId.toString()}
              onDelete={(id) => onDeletePost(parseInt(id))}
              onClose={() => {}}
            />
          }
        />
      ))}
    </div>
  );
}
