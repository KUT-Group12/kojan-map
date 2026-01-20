import { useState, useEffect, useMemo } from 'react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Search } from 'lucide-react';
import { Post, PinGenre, User } from '../types';
import { genreLabels, genreColors, GENRE_MAP } from '../lib/mockData';

interface SidebarProps {
  user: User;
  posts: Post[];
  onFilterChange: (filteredPosts: Post[]) => void;
  // onCreatePin: () => void;
  onPinClick: (post: Post) => void;
}

export function Sidebar({ user, posts, onFilterChange, onPinClick }: SidebarProps) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<PinGenre | 'all'>('all');
  // const [sortBy] = useState<'date' | 'reactions' | 'distance'>('date');
  //const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  // 検索結果を格納する
  // const [filteredPosts, setFilteredPosts] = useState<Post[]>(posts);

  type DateFilterType = 'all' | 'today' | 'week' | 'month';
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');

  const genreIdToKey = (genreId: number): PinGenre => {
    const entry = Object.entries(GENRE_MAP).find(([, id]) => id === genreId);
    return (entry?.[0] as PinGenre) ?? 'other';
  };

  // 1. レンダリングの中で直接計算する (useMemoを使用)
  const filteredPosts = useMemo(() => {
    if (user.role === 'business') return [...posts];

    return posts.filter((post) => {
      // 1. キーワード検索 (安全に文字列を扱う)
      const matchesKeyword =
        !searchKeyword ||
        post.title?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        post.text?.toLowerCase().includes(searchKeyword.toLowerCase());

      // 2. ジャンルフィルター
      const matchesGenre = selectedGenre === 'all' || genreIdToKey(post.genreId) === selectedGenre;

      // 3. 日付フィルター
      const postDate = new Date(post.postDate);
      const now = new Date();
      let matchesDate = true;

      if (dateFilter === 'today') {
        matchesDate = postDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = postDate >= weekAgo;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesDate = postDate >= monthAgo;
      }

      return matchesKeyword && matchesGenre && matchesDate;
    });
  }, [searchKeyword, selectedGenre, dateFilter, posts, user.role]);

  // 2. 親コンポーネント（onFilterChange）への通知だけを useEffect で行う
  useEffect(() => {
    onFilterChange(filteredPosts);
  }, [filteredPosts, onFilterChange]);

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60));

    if (diffHours < 1) {
      return 'たった今';
    } else if (diffHours < 24) {
      return `${diffHours}時間前`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}日前`;
    }
  };

  return (
    <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
      {/* 検索・フィルター */}
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

      {/* ピンリスト */}
      <div className="flex-1 overflow-y-auto">
        {filteredPosts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>該当する投稿が見つかりませんでした</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredPosts.map((post) => (
              <button
                key={post.postId}
                onClick={() => onPinClick(post)}
                className="w-full p-4 hover:bg-gray-50 text-left transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="flex-1 text-gray-900">{post.title}</h3>
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
                  <span>
                    {user.role === 'business'
                      ? user.fromName || '名称未設定の事業者' // フォールバックを追加
                      : '匿名'}
                  </span>
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
