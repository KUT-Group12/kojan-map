import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Heart, Eye, Loader2 } from 'lucide-react'; // Loader2を追加
import { Post, User, Place } from '../types';
// mockDataからの固定値インポートを削除
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
  postsAtLocation?: Post[];
  onOpenCreateAtLocation?: (lat: number, lng: number) => void;
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
    const controller = new AbortController();
    const fetchPostDetail = async () => {
      setIsDetailLoading(true);
      try {
        // バックエンドとの接続
        const response = await fetch(`${API_BASE_URL}/api/posts/detail?postId=${post.postId}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('詳細の取得に失敗しました');

        const data = await response.json(); // Post オブジェクトが返る

        setPostDetail(data.post);
        console.log('data: ', data);
      } catch (error) {
        if ((error as Error).name === 'AbortError') return;
        console.error('詳細取得エラー:', error);
      } finally {
        if (!controller.signal.aborted) setIsDetailLoading(false);
      }
    };

    fetchPostDetail();
    return () => controller.abort();
  }, [post?.postId]);

  // スクロール制御
  useEffect(() => {
    if (!post?.postId) return;
    setPostDetail(null);
    const fetchPostDetail = async () => {
      setIsDetailLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/posts/detail?postId=${post.postId}`);
        if (!response.ok) throw new Error('詳細の取得に失敗しました');
        const data = await response.json();
        setPostDetail(data.post);
      } catch (error) {
        setPostDetail(null);
        console.error('詳細取得エラー:', error);
      } finally {
        setIsDetailLoading(false);
      }
    };
    fetchPostDetail();
  }, [post?.postId]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [post.postId]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isOwnPost = post.userId === currentUser.googleId;

  // 表示に使うデータを決定（詳細があればそちらを優先）
  const displayPost = postDetail || post;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent
        ref={scrollContainerRef}
        className="max-w-2xl max-h-[90vh] overflow-y-auto border-none shadow-2xl"
      >
        {isDetailLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
              <p className="mt-2 text-sm text-slate-500 font-bold">読み込み中...</p>
            </div>
          </div>
        )}

        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-black text-slate-800 leading-tight whitespace-pre-wrap break-words">
                {displayPost.title}
              </DialogTitle>
              <DialogDescription className="sr-only">投稿の詳細情報を表示します</DialogDescription>

              <div className="flex items-center gap-2 mt-3">
                <Badge
                  style={{
                    // DBから取得した色を適用
                    backgroundColor: displayPost.genreColor || '#64748b',
                    color: '#ffffff',
                  }}
                  className="px-3 py-1 border-none shadow-sm text-sm font-bold"
                >
                  {displayPost.genreName || 'その他'}
                </Badge>
                {/* 投稿者のロールに応じたバッジ */}
                {displayPost.role === 'business' && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-50 text-blue-600 border-blue-100 font-bold"
                  >
                    事業者
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                👤
              </div>
              <div>
                <p className="font-bold text-slate-700">
                  {displayPost.businessName ||
                    (displayPost.userId === currentUser.googleId
                      ? currentUser.fromName
                      : '匿名ユーザー')}
                </p>
                <p className="text-xs text-slate-400 font-medium">
                  {formatDate(displayPost.postDate)}
                </p>
              </div>
            </div>
            {displayPost.numView !== undefined && (
              <div className="flex items-center px-3 py-1 bg-slate-50 rounded-full text-xs font-bold text-slate-500">
                <Eye className="w-3.5 h-3.5 mr-1" />
                {displayPost.numView} 閲覧
              </div>
            )}
          </div>
          <div className="text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
            {displayPost.text}
          </div>

          {displayPost.postImage && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Array.isArray(displayPost.postImage)
                ? displayPost.postImage
                : [displayPost.postImage]
              ).map((image, index) => (
                <div
                  key={index}
                  className="aspect-video overflow-hidden rounded-xl shadow-inner bg-slate-100"
                >
                  <img
                    src={image}
                    alt={`投稿画像 ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          )}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center text-slate-500 text-sm font-bold">
              <span className="mr-2">📍</span>
              {place.latitude.toFixed(6)}, {place.longitude.toFixed(6)}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-700 font-bold"
              onClick={() => onOpenCreateAtLocation?.(place.latitude, place.longitude)}
            >
              ここに投稿を追加
            </Button>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center px-4 py-2 bg-rose-50 rounded-full text-rose-600 font-black shadow-sm border border-rose-100">
                <Heart className={`w-5 h-5 mr-2 ${isReacted ? 'fill-current' : ''}`} />
                {displayPost.numReaction}
              </div>

              <UserTriggerReaction
                postId={post.postId}
                userId={currentUser.googleId}
                isReacted={isReacted}
                userRole={currentUser.role}
                isDisabled={false}
                onReaction={onReaction}
              />
            </div>

            <div className="flex items-center gap-2">
              {isOwnPost ? (
                <SelectPostDeletion postId={post.postId} onDelete={onDelete} onClose={onClose} />
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-rose-500"
                    onClick={() => setIsReporting(true)}
                  >
                    通報
                  </Button>
                  {onBlockUser && (
                    <SelectBlock
                      userId={post.userId}
                      blockerId={currentUser.googleId}
                      onBlockUser={onBlockUser}
                      onClose={onClose}
                    />
                  )}
                </>
              )}
            </div>
          </div>

          {isReporting && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <ReportScreen
                  postId={post.postId}
                  userId={currentUser.googleId}
                  isReporting={isReporting}
                  setIsReporting={setIsReporting}
                  onReportComplete={onClose}
                />
              </div>
            </div>
          )}

          {postsAtLocation && postsAtLocation.length > 1 && (
            <div className="mt-8 pt-8 border-t border-slate-100">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                <span className="w-1 h-4 bg-blue-500 rounded-full mr-2" />
                この場所の他の投稿
              </h3>
              <div className="grid gap-2">
                {postsAtLocation.map((p) => (
                  <button
                    key={p.postId}
                    onClick={() => p.postId !== post.postId && onSelectPin?.(p)}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                      p.postId === post.postId
                        ? 'border-blue-500 bg-blue-50 shadow-inner'
                        : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: p.genreColor || '#cbd5e1' }}
                      />
                      <span
                        className={`text-sm font-bold ${p.postId === post.postId ? 'text-blue-700' : 'text-slate-600'}`}
                      >
                        {p.title}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-rose-400">{p.numReaction} ❤️</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
