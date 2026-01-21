import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Heart, Eye } from 'lucide-react';
import { Post, User, Place } from '../types';
import { genreLabels, genreColors, GENRE_MAP } from '../lib/mockData';
import { useEffect, useRef, useState } from 'react';
import { UserTriggerReaction } from './UserTriggerReaction';
import { ReportScreen } from './ReportScreen';
import { SelectBlock } from './SelectBlock';
import { SelectPostDeletion } from './SelectPostDeletion';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8080';

interface PinDetailModalProps {
  post: Post;
  place: Place;
  currentUser: User;
  isReacted: boolean;
  onClose: () => void;
  onReaction: (postId: number) => void;
  onDelete: (postId: number) => void;
  onBlockUser?: (userId: string) => void;
  // pins at the same/similar location to allow scrolling through nearby posts
  postsAtLocation?: Post[];
  // open create modal prefilled with given coordinates
  onOpenCreateAtLocation?: (lat: number, lng: number) => void;
  // 追加：別のピンを選択するための関数
  onSelectPin?: (post: Post) => void;
}

export function DisplayPostList({
  post,
  place,
  currentUser,
  isReacted,
  onClose,
  onReaction,
  onDelete,
  onBlockUser,
  postsAtLocation,
  onOpenCreateAtLocation,
  onSelectPin,
}: PinDetailModalProps) {
  const [isReporting, setIsReporting] = useState(false);

  const [postDetail, setPostDetail] = useState<Post | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 投稿詳細取得 & 閲覧数アップAPIの呼び出し
  useEffect(() => {
    if (!post?.postId) return;
    setPostDetail(null);
    const fetchPostDetail = async () => {
      setIsDetailLoading(true);
      try {
        // バックエンドとの接続
        const response = await fetch(`${API_BASE_URL}/api/posts/detail?postId=${post.postId}`);
        if (!response.ok) throw new Error('詳細の取得に失敗しました');

        const data = await response.json(); // Post オブジェクトが返る

        setPostDetail(data.post);
        console.log('data: ', data);
      } catch (error) {
        setPostDetail(null);
        console.error('詳細取得エラー:', error);
      } finally {
        setIsDetailLoading(false);
      }
    };

    fetchPostDetail();
  }, [post?.postId]);

  // スクロール制御
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [post.postId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isOwnPost = post.userId === currentUser.id;

  console.log(post.text);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent ref={scrollContainerRef} className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* 1. ローディング中のオーバーレイ表示 */}
        {isDetailLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-[1px]">
            <div className="flex flex-col items-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
              <p className="mt-2 text-sm text-gray-500 font-medium">詳細を読み込み中...</p>
            </div>
          </div>
        )}
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="whitespace-pre-wrap break-words overflow-wrap-anywhere">
                {post.title}
              </DialogTitle>
              <DialogDescription className="sr-only">投稿の詳細情報を表示します</DialogDescription>
              <div className="flex items-center space-x-2 mt-2">
                <Badge style={{ backgroundColor: genreColors[GENRE_MAP[post.genreId] || 'other'] }}>
                  {genreLabels[GENRE_MAP[post.genreId] || 'other']}
                </Badge>
                {currentUser.role === 'business' && <Badge variant="outline">事業者</Badge>}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* 投稿者情報 */}
          <div className="flex items-center justify-between pb-4 border-b">
            <div>
              <p className="text-sm">
                {currentUser.role === 'business' ? currentUser.name : '匿名'}
              </p>
              <p className="text-xs text-gray-500">{formatDate(post.postDate)}</p>
            </div>
            {post.numView !== undefined && (
              <div className="flex items-center text-sm text-gray-500">
                <Eye className="w-4 h-4 mr-1" />
                {post.numView} 閲覧
              </div>
            )}
          </div>

          {/* 説明文 */}
          <div className="min-h-[1.5rem]">
            <p className="text-gray-700 whitespace-pre-wrap">{postDetail?.text || post.text}</p>
          </div>

          {/* 画像表示エリア */}
          {(postDetail?.postImage || post?.postImage) && (
            <div className="grid grid-cols-2 gap-2">
              {(Array.isArray(postDetail?.postImage || post.postImage)
                ? postDetail?.postImage || post.postImage
                : [postDetail?.postImage || post.postImage]
              ).map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`投稿画像 ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg shadow-sm"
                />
              ))}
            </div>
          )}

          {/* 位置情報 */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              📍 位置: {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
            </p>
          </div>

          {/* リアクション数 と 投稿を追加ボタン */}
          <div className="flex items-center space-x-3 text-gray-700">
            <div className="flex items-center space-x-2">
              <Heart className={`w-5 h-5 ${isReacted ? 'fill-red-500 text-red-500' : ''}`} />
              <span>{post.numReaction} リアクション</span>
            </div>

            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onOpenCreateAtLocation && onOpenCreateAtLocation(place.latitude, place.longitude)
                }
              >
                投稿を追加
              </Button>
            </div>
          </div>

          {/* アクションエリア */}
          <div className="flex items-center space-x-2 pt-4 border-t">
            {isReporting ? (
              <ReportScreen
                postId={post.postId}
                userId={currentUser.id}
                isReporting={isReporting}
                setIsReporting={setIsReporting}
                onReportComplete={onClose}
              />
            ) : (
              <>
                {/* 1. リアクションボタン */}
                <UserTriggerReaction
                  postId={post.postId}
                  userId={currentUser.id}
                  isReacted={isReacted}
                  userRole={currentUser.role}
                  isDisabled={false}
                  onReaction={onReaction}
                />

                {isOwnPost ? (
                  /* 2. 削除ボタン */
                  <SelectPostDeletion postId={post.postId} onDelete={onDelete} onClose={onClose} />
                ) : (
                  /* 3. 通報 & ブロック */
                  <>
                    <ReportScreen
                      postId={post.postId}
                      userId={currentUser.id}
                      isReporting={isReporting}
                      setIsReporting={setIsReporting}
                      onReportComplete={onClose}
                    />
                    {typeof onBlockUser === 'function' && (
                      <SelectBlock
                        userId={post.userId}
                        blockerId={currentUser.id}
                        onBlockUser={onBlockUser} // Prop名を onBlockUser に合わせる
                        onClose={onClose}
                      />
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {/* 同一場所の投稿リスト（スクロール可能） */}
          {postsAtLocation && postsAtLocation.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-bold mb-3">この場所の他の投稿</h3>
              <div className="space-y-2">
                {postsAtLocation.map((p) => (
                  <div
                    key={p.postId}
                    onClick={() => {
                      if (p.postId !== post.postId && onSelectPin) onSelectPin(p);
                    }}
                    className={`cursor-pointer p-3 rounded-lg border transition-colors ${
                      p.postId === post.postId
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{p.title}</span>
                      <span className="text-xs text-gray-500">{p.numReaction} ❤️</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
