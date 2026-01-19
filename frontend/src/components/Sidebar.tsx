import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Search } from 'lucide-react';
import { Post, PinGenre, User } from '../types';
import { genreLabels, genreColors } from '../lib/mockData';

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
  const [sortBy] = useState<'date' | 'reactions' | 'distance'>('date');
  //const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  type DateFilterType = 'all' | 'today' | 'week' | 'month';
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');

  useEffect(() => {
    // 事業者ユーザーの場合、検索・絞り込み・並び替えの機能を無効化（全件表示）
    if (user.role === 'business') {
      onFilterChange([...posts]);
      return;
    }

    let filtered = [...posts];

    // キーワード検索
    if (searchKeyword) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          post.text.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }

    // ジャンルフィルター
    if (selectedGenre !== 'all') {
      filtered = filtered.filter(
        (post) => genreLabels[post.genreId] === genreLabels[selectedGenre]
      );
    }

    // 日付フィルター
    const now = new Date();
    if (dateFilter === 'today') {
      filtered = filtered.filter((post) => {
        const pinDate = new Date(post.postDate);
        return pinDate.toDateString() === now.toDateString();
      });
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((post) => new Date(post.postDate) >= weekAgo);
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((post) => new Date(post.postDate) >= monthAgo);
    }

    /*
    // 並べ替え
    if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'reactions') {
      filtered.sort((a, b) => b.reactions - a.reactions);
    } else if (sortBy === 'distance') {
      // 距離順は簡易的に緯度経度で計算（実際は現在地からの距離を計算する）
      filtered.sort((a, b) => a.latitude - b.latitude);
    }*/

    onFilterChange(filtered);
  }, [searchKeyword, selectedGenre, sortBy, dateFilter, posts, onFilterChange, user.role]);

  const genreIdToKey: Record<number, PinGenre> = {
    0: 'food',       // ジャンルID 0 -> 'food'
    1: 'event',      // ジャンルID 1 -> 'event'
    2: 'scene',      // ジャンルID 2 -> 'scene'
    3: 'store',      // ジャンルID 3 -> 'store'
    4: 'emergency',  // ジャンルID 4 -> 'emergency'
    5: 'other',      // ジャンルID 5 -> 'other'
  };

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
        {/*}
        <Button onClick={onCreatePin} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          新規投稿
        </Button>*/}
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
            {/*
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
              <SelectTrigger>
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                <SelectValue placeholder="並べ替え" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">新着順</SelectItem>
                <SelectItem value="reactions">リアクション順</SelectItem>
                <SelectItem value="distance">距離順</SelectItem>
              </SelectContent>
            </Select>*/}
          </>
        )}
      </div>

      {/* ピンリスト */}
      <div className="flex-1 overflow-y-auto">
        {posts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>該当する投稿が見つかりませんでした</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {posts.map((post) => (
              <button
                key={post.postId}
                onClick={() => onPinClick(post)}
                className="w-full p-4 hover:bg-gray-50 text-left transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="flex-1 text-gray-900">{post.title}</h3>
                  <Badge
                    style={{
                      backgroundColor: genreColors[genreIdToKey[post.genreId] ?? 'other'],
                    }}
                    className="ml-2"
                  >
                    {genreLabels[genreIdToKey[post.genreId] ?? 'other']}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{post.text}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{user.role === 'business' ? user.fromName : '匿名'}</span>
                  <div className="flex items-center space-x-3">
                    <span>❤️ {post.numReaction}</span>
                    <span>{formatDate(new Date(post.postDate))}</span>
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
