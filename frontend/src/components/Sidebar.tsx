import { useState, useEffect, useRef } from 'react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Search, Loader2 } from 'lucide-react'; // Loader2を追加
import { Post, User } from '../types';
// 不要になった GENRE_MAP, genreColors, genreLabels のインポートを削除
// もし検索条件のプルダウンを作るために genreLabels が必要な場合は残しますが、
// ここでは「投稿に含まれるDBデータ」を優先する形に書き換えます。

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
  const [selectedGenre, setSelectedGenre] = useState<string>('all'); // string型に変更
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
  const [apiPosts, setApiPosts] = useState<Post[]>(initialPosts);
  const [isLoading, setIsLoading] = useState(false);

  const initialPostsRef = useRef(initialPosts);
  useEffect(() => {
    initialPostsRef.current = initialPosts;
  }, [initialPosts]);

  useEffect(() => {
    // クライアントサイドフィルタリング
    let result = [...initialPosts];

    // 1. Keyword Filter (Title, Text, GenreName, BusinessName)
    if (searchKeyword.trim()) {
      const lowerKeyword = searchKeyword.toLowerCase();
      result = result.filter((post) => {
        const titleMatch = post.title?.toLowerCase().includes(lowerKeyword);
        const textMatch = post.text?.toLowerCase().includes(lowerKeyword);
        const genreMatch = post.genreName?.toLowerCase().includes(lowerKeyword); // ジャンル名も検索対象に
        // const businessMatch = post.businessName?.toLowerCase().includes(lowerKeyword);
        return titleMatch || textMatch || genreMatch;
      });
    }

    // 2. Genre Filter
    if (selectedGenre !== 'all') {
      result = result.filter((post) => String(post.genreId) === selectedGenre);
    }

    // 3. Date Filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const postDate = (dateStr: string) => new Date(dateStr);

      result = result.filter((post) => {
        if (!post.postDate) return false;

        const d = new Date(post.postDate);
        if (isNaN(d.getTime())) return false; // Invalid 

        // リセットした日付比較 (時刻を無視)
        const checkDate = new Date(d);
        checkDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const diffTime = today.getTime() - checkDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        // console.log(`PostDate: ${post.postDate}, DiffDays: ${diffDays}, Filter: ${dateFilter}`);

        if (dateFilter === 'today') return diffDays === 0; // 同じ日付
        if (dateFilter === 'week') return diffDays <= 7 && diffDays >= -1; // 未来日付(時差)も許容
        if (dateFilter === 'month') return diffDays <= 30 && diffDays >= -1;
        return true;
      });
    }

    setApiPosts(result);
  }, [searchKeyword, selectedGenre, dateFilter, initialPosts]);

  useEffect(() => {
    onFilterChange(apiPosts);
  }, [apiPosts, onFilterChange]);

  const formatDate = (date: Date | string) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60));

    if (diffHours < 1) return 'たった今';
    if (diffHours < 24) return `${diffHours}時間前`;
    return `${Math.floor(diffHours / 24)}日前`;
  };

  return (
    <div className="w-96 bg-white border-r border-gray-200 flex flex-col shadow-sm">
      <div className="p-4 border-b border-gray-200 space-y-3 bg-slate-50/50">
        {user.role !== 'business' && (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="キーワードで検索..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="ジャンル" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全ジャンル</SelectItem>
                  {/* ここはDBからジャンル一覧を取得して回すのが理想ですが、
                      現状は投稿に含まれるデータを使うため、一旦固定値か、
                      既存のGENRE_MAPが残っているならそれを利用します */}
                  <SelectItem value="1">グルメ</SelectItem>
                  <SelectItem value="2">イベント</SelectItem>
                  <SelectItem value="3">風景</SelectItem>
                  <SelectItem value="4">お店</SelectItem>
                  <SelectItem value="5">緊急情報</SelectItem>
                  <SelectItem value="6">その他</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilterType)}>
                <SelectTrigger className="bg-white">
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

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p className="text-sm">検索中...</p>
          </div>
        ) : apiPosts.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="text-sm">該当する投稿が見つかりませんでした</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {apiPosts.map((post) => (
              <button
                key={post.postId}
                onClick={() => onPinClick(post)}
                className="w-full p-4 hover:bg-slate-50 text-left transition-all active:bg-slate-100 group"
              >
                <div className="flex items-start justify-between mb-1.5">
                  <h3 className="flex-1 text-slate-900 font-bold leading-tight group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>
                  <Badge
                    style={{
                      // DBから取得した色を直接適用
                      backgroundColor: post.genreColor || '#64748b',
                      color: '#ffffff',
                    }}
                    className="ml-2 border-none px-2 shadow-sm whitespace-nowrap"
                  >
                    {/* DBから取得した名前を表示 */}
                    {post.genreName || 'その他'}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 mb-3 line-clamp-2 leading-relaxed">
                  {post.text}
                </p>
                <div className="flex items-center justify-between text-[12px] text-slate-400">
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                    {post.businessName ||
                      (user.role === 'business' ? user.fromName : '匿名ユーザー')}
                  </span>
                  <div className="flex items-center space-x-3 font-medium">
                    <span className="flex items-center text-rose-400">❤️ {post.numReaction}</span>
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
