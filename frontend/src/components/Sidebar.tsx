import { useState, useEffect, useRef } from 'react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Search } from 'lucide-react';
import { Post, PinGenre, User } from '../types';
import { genreLabels, genreColors, GENRE_MAP } from '../lib/mockData';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8080';

interface SidebarProps {
  user: User;
  posts: Post[];
  onFilterChange: (filteredPosts: Post[]) => void;
  onPinClick: (post: Post) => void;
}

type DateFilterType = 'all' | 'today' | 'week' | 'month';

export function Sidebar({ user, posts: initialPosts, onFilterChange, onPinClick }: SidebarProps) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<PinGenre | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');

  // APIから取得した結果を管理
  const [apiPosts, setApiPosts] = useState<Post[]>(initialPosts);
  const [isLoading, setIsLoading] = useState(false);

  // genreIdからPinGenreキーを取得するヘルパー
  const genreIdToKey = (genreId: number): PinGenre => {
    const entry = Object.entries(GENRE_MAP).find(([, id]) => id === genreId);
    return (entry?.[0] as PinGenre) ?? 'other';
  };

  const initialPostsRef = useRef(initialPosts);
  useEffect(() => {
    const controller = new AbortController();

    const fetchFilteredPosts = async (): Promise<void> => {
      // 事業者ロールの場合は検索機能をスキップし、初期投稿を表示
      if (user.role === 'business') {
        setApiPosts(initialPostsRef.current);
        return;
      }

      setIsLoading(true);
      try {
        // デフォルトは全取得
        let url = `${API_BASE_URL}/api/posts`;

        // 条件に応じてエンドポイントを切り替え（排他的な検索ロジック）
        if (searchKeyword) {
          url = `${API_BASE_URL}/api/posts/search?keyword=${encodeURIComponent(searchKeyword)}`;
        } else if (selectedGenre !== 'all') {
          const genreId = GENRE_MAP[selectedGenre];
          url = `${API_BASE_URL}/api/posts/search/genre?genreId=${genreId}`;
        } else if (dateFilter !== 'all') {
          const endDate = new Date().toISOString().split('T')[0];
          const start = new Date();
          if (dateFilter === 'today') start.setDate(start.getDate());
          if (dateFilter === 'week') start.setDate(start.getDate() - 7);
          if (dateFilter === 'month') start.setMonth(start.getMonth() - 1);
          const startDate = start.toISOString().split('T')[0];
          url = `${API_BASE_URL}/api/posts/search/period?startDate=${startDate}&endDate=${endDate}`;
        }

        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error('検索に失敗しました');

        const data = (await response.json()) as { posts: Post[] };
        setApiPosts(data.posts || []);
      } catch (error: unknown) {
        // キャンセル時は何もしない
        if (error instanceof DOMException && error.name === 'AbortError') return;

        if (error instanceof Error) {
          console.error('Search error:', error.message);
        }
        setApiPosts([]); // エラー時は空にする
      } finally {
        setIsLoading(false);
      }
    };

    // 入力中の負荷を抑えるためのデバウンス処理
    const timer = setTimeout(fetchFilteredPosts, searchKeyword === '' ? 0 : 500);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchKeyword, selectedGenre, dateFilter, user.role]);

  // apiPostsが更新されたら親コンポーネントへ通知
  useEffect(() => {
    onFilterChange(apiPosts);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiPosts]);

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60));

    if (diffHours < 1) return 'たった今';
    if (diffHours < 24) return `${diffHours}時間前`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}日前`;
  };

  return (
    <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
      {/* 検索・フィルターエリア */}
      <div className="p-4 border-b border-gray-200 space-y-3">
        {user.role !== 'business' && (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="キーワードで検索..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Select
                value={selectedGenre}
                onValueChange={(value) => setSelectedGenre(value as PinGenre | 'all')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="ジャンル" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全ジャンル</SelectItem>
                  {Object.entries(genreLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={dateFilter}
                onValueChange={(value) => setDateFilter(value as DateFilterType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="期間" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全期間</SelectItem>
                  <SelectItem value="today">今日</SelectItem>
                  <SelectItem value="week">1週間</SelectItem>
                  <SelectItem value="month">1ヶ月</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>

      {/* ピンリスト表示エリア */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">検索中...</div>
        ) : apiPosts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>該当する投稿が見つかりませんでした</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {apiPosts.map((post) => (
              <button
                key={post.postId}
                onClick={() => onPinClick(post)}
                className="w-full p-4 hover:bg-gray-50 text-left transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="flex-1 text-gray-900 font-medium">{post.title}</h3>
                  <Badge
                    style={{
                      backgroundColor: genreColors[genreIdToKey(post.genreId)],
                    }}
                    className="ml-2 text-white"
                  >
                    {genreLabels[genreIdToKey(post.genreId)]}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{post.text}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{user.role === 'business' ? user.name || '事業者' : '匿名'}</span>
                  <div className="flex items-center space-x-3">
                    <span>❤️ {post.numReaction}</span>
                    <span>{formatDate(post.postDate)}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
