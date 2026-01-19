import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { User, Post, Business } from '../types';
import {
  TrendingUp,
  Eye,
  Heart,
  Calendar,
  CreditCard,
  BarChart3,
  Building2,
  Clock,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { genreColors, genreLabels, API_GENRE_MAP } from '../lib/mockData';

interface BusinessDashboardProps {
  business: Business;
  user: User;
  posts: Post[];
  onPostClick: (post: Post) => void;
}

export function BusinessDashboard({ business, user, posts, onPostClick }: BusinessDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const weeklyData = [];

  const genreStats = posts.reduce(
    (acc, post) => {
      const genreKey = API_GENRE_MAP[post.genreId] || 'other';
      if (!acc[genreKey]) {
        acc[genreKey] = { genre: genreLabels[genreKey], count: 0, reactions: 0 };
      }
      acc[genreKey].count++;
      acc[genreKey].reactions += post.numReaction;
      return acc;
    },
    {} as Record<string, { genre: string; count: number; reactions: number }>
  );

  const genreStatsArray = Object.values(genreStats);

  const totalReactions = posts.reduce((sum, post) => sum + post.numReaction, 0);
  const totalViews = posts.reduce((sum, post) => sum + (post.numView || 0), 0);
  const avgReactions = posts.length > 0 ? Math.round(totalReactions / posts.length) : 0;

  const topPosts = [...posts].sort((a, b) => b.numReaction - a.numReaction).slice(0, 5);

  return (
    <div className="flex w-full h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* サイドバー */}
      <div className="flex flex-col h-full w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-2xl z-20">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="tracking-wide">事業者</h2>
              <p className="text-xs text-slate-400">こじゃんとやまっぷ</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'overview'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg'
                : 'hover:bg-slate-700'
              }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>概要</span>
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'billing'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg'
                : 'hover:bg-slate-700'
              }`}
          >
            <CreditCard className="w-5 h-5" />
            <span>支払い情報</span>
          </button>
        </nav>

        <div className="mt-auto p-4 border-t border-slate-700">
          <div className="mb-3 px-2">
            <p className="text-xs text-slate-400">事業者名</p>
            <p className="text-sm truncate">{business.businessName || user.fromName}</p>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="h-full flex-1 flex flex-col overflow-hidden">
        {/* ヘッダー */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-slate-900">
                {activeTab === 'overview' && '事業者ダッシュボード'}
                {activeTab === 'billing' && '支払い情報'}
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                {activeTab === 'overview' && business.businessName}
                {activeTab === 'billing' && (
                  <>
                    <Clock className="w-3 h-3 inline mr-1" />
                    最終更新: {new Date().toLocaleString('ja-JP')}
                  </>
                )}
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {/* 概要タブ */}
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-7xl">
              {/* サマリーカード */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-none shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                  <CardHeader className="pb-2 relative z-10">
                    <CardTitle className="text-sm opacity-90 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      総投稿数
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="text-3xl">{posts.length}</div>
                    <p className="text-xs opacity-75 mt-1">投稿</p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-lg bg-gradient-to-br from-red-500 to-pink-600 text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                  <CardHeader className="pb-2 relative z-10">
                    <CardTitle className="text-sm opacity-90 flex items-center">
                      <Heart className="w-4 h-4 mr-2" />
                      総リアクション
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="text-3xl">{totalReactions}</div>
                    <p className="text-xs opacity-75 mt-1">平均 {avgReactions}/投稿</p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                  <CardHeader className="pb-2 relative z-10">
                    <CardTitle className="text-sm opacity-90 flex items-center">
                      <Eye className="w-4 h-4 mr-2" />
                      総閲覧数
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="text-3xl">{totalViews}</div>
                    <p className="text-xs opacity-75 mt-1">閲覧</p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                  <CardHeader className="pb-2 relative z-10">
                    <CardTitle className="text-sm opacity-90 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      エンゲージメント率
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="text-3xl">
                      {totalViews > 0 ? ((totalReactions / totalViews) * 100).toFixed(1) : 0}%
                    </div>
                    <p className="text-xs opacity-75 mt-1">リアクション/閲覧</p>
                  </CardContent>
                </Card>
              </div>

              {/* グラフ */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 週間推移 */}
                <Card className="shadow-xl border-slate-200">
                  <CardHeader>
                    <CardTitle>週間推移</CardTitle>
                    <CardDescription>リアクション数と閲覧数の推移</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="reactions"
                          stroke="#ef4444"
                          name="リアクション"
                        />
                        <Line type="monotone" dataKey="views" stroke="#3b82f6" name="閲覧数" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* ジャンル別統計 */}
                <Card className="shadow-xl border-slate-200">
                  <CardHeader>
                    <CardTitle>ジャンル別投稿数</CardTitle>
                    <CardDescription>投稿のジャンル分布</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={genreStatsArray}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="genre" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#8b5cf6" name="投稿数" />
                        <Bar dataKey="reactions" fill="#ef4444" name="リアクション" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* 人気投稿 */}
              <Card className="shadow-xl border-slate-200">
                <CardHeader>
                  <CardTitle>人気投稿 Top 5</CardTitle>
                  <CardDescription>リアクション数が多い投稿</CardDescription>
                </CardHeader>
                <CardContent>
                  {topPosts.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">まだ投稿がありません</p>
                  ) : (
                    <div className="space-y-3">
                      {topPosts.map((post, index) => {
                        const genreKey = API_GENRE_MAP[post.genreId] || 'other';
                        return (
                          <button
                            key={post.postId}
                            onClick={() => onPostClick(post)}
                            className="w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-left"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3 flex-1">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white">
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h4>{post.title}</h4>
                                    <Badge style={{ backgroundColor: genreColors[genreKey] }}>
                                      {genreLabels[genreKey]}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-slate-600 line-clamp-1">
                                    {post.text}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right ml-4">
                                <div className="flex items-center text-red-500">
                                  <Heart className="w-4 h-4 mr-1" />
                                  <span>{post.numReaction}</span>
                                </div>
                                <div className="flex items-center text-blue-500 text-sm mt-1">
                                  <Eye className="w-3 h-3 mr-1" />
                                  <span>{post.numView || 0}</span>
                                </div>
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* 支払い情報タブ */}
          {activeTab === 'billing' && (
            <div className="max-w-4xl">
              <Card className="shadow-xl border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    支払い状況
                  </CardTitle>
                  <CardDescription>現在の契約と請求情報</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">プラン</p>
                      <p>事業者プラン</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">月額料金</p>
                      <p>¥2,000</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">次回請求日</p>
                      <p>2025年12月1日</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="mb-3">支払い履歴</h4>
                    <div className="space-y-2">
                      {[
                        { date: '2025年11月1日', amount: '¥2,000', status: '完了' },
                        { date: '2025年10月1日', amount: '¥2,000', status: '完了' },
                        { date: '2025年9月1日', amount: '¥2,000', status: '完了' },
                      ].map((payment, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <Calendar className="w-4 h-4 text-slate-500" />
                            <span className="text-sm">{payment.date}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span>{payment.amount}</span>
                            <Badge variant="outline">{payment.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 解約ボタンは廃止：事業者プランの解約操作は管理画面でのみ行えるため UI から削除しました */}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
