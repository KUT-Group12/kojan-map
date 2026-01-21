import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { User, Business, Post } from '../types';

import { Heart, CreditCard, BarChart3, Building2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { genreLabels } from '../lib/mockData';

interface BusinessDashboardProps {
  user: User;
  business: Business;
  posts: Post[];
  onPinClick: (post: Post) => void;
}

export function BusinessDashboard({
  user,
  business,
  posts = [],
  onPinClick,
}: BusinessDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // 1. 統計データの計算 (衝突ファイルの安全な集計ロジックを反映)
  const totalReactions = posts.reduce((sum, post) => sum + (post.numReaction || 0), 0);
  const totalViews = posts.reduce((sum, post) => sum + (post.numView || 0), 0);
  const avgReactions = posts.length > 0 ? Math.round(totalReactions / posts.length) : 0;
  const topPosts = [...posts]
    .sort((a, b) => (b.numReaction || 0) - (a.numReaction || 0))
    .slice(0, 5);

  // 2. ジャンル別統計 (グラフ用)
  const genreStats = posts.reduce(
    (acc, post) => {
      const label = genreLabels[post.genreId] || 'その他';
      if (!acc[post.genreId]) {
        acc[post.genreId] = { genre: label, count: 0, reactions: 0 };
      }
      acc[post.genreId].count++;
      acc[post.genreId].reactions += post.numReaction || 0;
      return acc;
    },
    {} as Record<string, { genre: string; count: number; reactions: number }>
  );

  const genreStatsArray = Object.values(genreStats);

  return (
    <div className="flex w-full h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="flex flex-col h-full w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-2xl z-20">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="tracking-wide font-bold">事業者</h2>
              <p className="text-xs text-slate-400">こじゃんとやまっぷ</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          <TabButton
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            icon={<BarChart3 className="w-5 h-5" />}
            label="概要"
          />
          <TabButton
            active={activeTab === 'billing'}
            onClick={() => setActiveTab('billing')}
            icon={<CreditCard className="w-5 h-5" />}
            label="支払い情報"
          />
        </nav>

        <div className="mt-auto p-4 border-t border-slate-700">
          <div className="mb-3 px-2">
            <p className="text-xs text-slate-400">事業者名</p>
            <p className="text-sm truncate">{business.businessName || user.name || '未設定'}</p>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="h-full flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-8 py-6">
          <h1 className="text-xl font-bold text-slate-900">
            {activeTab === 'overview' ? '事業者ダッシュボード' : '支払い情報'}
          </h1>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-7xl">
              {/* サマリーカード */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="総投稿数" value={posts.length} color="from-blue-500 to-blue-600" />
                <StatCard
                  title="総反応数"
                  value={totalReactions}
                  sub={`平均 ${avgReactions}/件`}
                  color="from-red-500 to-pink-600"
                />
                <StatCard
                  title="総閲覧数"
                  value={totalViews}
                  color="from-purple-500 to-indigo-600"
                />
                <StatCard
                  title="反応率"
                  value={`${totalViews > 0 ? ((totalReactions / totalViews) * 100).toFixed(1) : 0}%`}
                  color="from-green-500 to-emerald-600"
                />
              </div>

              {/* グラフセクション - あなたの高度な分析機能を維持 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-xl">
                  <CardHeader>
                    <CardTitle>ジャンル別統計</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={genreStatsArray}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="genre" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8b5cf6" name="投稿数" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* 人気投稿リスト */}
                <Card className="shadow-xl">
                  <CardHeader>
                    <CardTitle>人気投稿 Top 5</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {topPosts.length > 0 ? (
                        topPosts.map((post, i) => (
                          <button
                            key={post.postId}
                            onClick={() => onPinClick(post)}
                            className="w-full p-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 rounded-lg transition-all border border-slate-100"
                          >
                            <div className="flex items-center space-x-3 truncate">
                              <span className="text-slate-400 font-bold">{i + 1}</span>
                              <span className="truncate font-medium">{post.title}</span>
                            </div>
                            <div className="flex items-center text-red-500 space-x-1 ml-4">
                              <Heart className="w-4 h-4" />
                              <span>{post.numReaction}</span>
                            </div>
                          </button>
                        ))
                      ) : (
                        <p className="text-center text-slate-400 py-10">データがありません</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="max-w-4xl">
              <Card className="shadow-xl border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    支払い状況
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-3 gap-6 p-6 bg-slate-50 rounded-xl">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">プラン</p>
                      <p className="font-bold">事業者プラン</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">月額料金</p>
                      <p className="font-bold text-blue-600">¥2,000</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">次回更新</p>
                      <p className="font-bold">2026/02/01</p>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <h4 className="font-bold mb-4">支払い履歴</h4>
                    <p className="text-sm text-slate-400 text-center py-10 italic">
                      履歴データはありません
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ヘルパーコンポーネント
function StatCard({
  title,
  value,
  sub,
  color,
}: {
  title: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <Card
      className={`border-none shadow-lg bg-gradient-to-br ${color} text-white relative overflow-hidden`}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8" />
      <CardHeader className="pb-2 relative z-10">
        <CardTitle className="text-xs opacity-80">{title}</CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-3xl font-bold">{value}</div>
        {sub && <p className="text-[10px] opacity-70 mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
        active
          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg text-white'
          : 'hover:bg-slate-700 text-slate-300'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}
