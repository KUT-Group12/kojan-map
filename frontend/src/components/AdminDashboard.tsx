import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { User } from '../types';
import { mockPins, mockInquiries, Inquiry } from '../lib/mockData';
import { BusinessApplicationList } from './AdminDisplayBusinessApplicationList';
import {
  Users,
  AlertTriangle,
  TrendingUp,
  MapPin,
  UserCheck,
  Trash2,
  CheckCircle,
  LogOut,
  Activity,
  BarChart3,
  Shield,
  Clock,
  Eye,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [reports] = useState([
    {
      id: 'r1',
      pinId: 'pin1',
      reporter: '山田太郎',
      reason: '不適切な内容',
      status: 'pending' as const,
      date: '2025-11-03',
    },
    {
      id: 'r2',
      pinId: 'pin3',
      reporter: '佐藤花子',
      reason: 'スパム',
      status: 'pending' as const,
      date: '2025-11-02',
    },
    {
      id: 'r3',
      pinId: 'pin2',
      reporter: '鈴木一郎',
      reason: '虚偽情報',
      status: 'resolved' as const,
      date: '2025-11-01',
    },
  ]);

  //データベースから持ってくるようにしなければならない？
  const [businessApplications] = useState([
    {
      id: 'ba1',
      userName: '田中商店',
      email: 'tanaka@example.com',
      ShopName: '田中商店',
      PhoneNumber: '090-1234-5678',
      address: '山田市1-2-3',
      date: '2025-11-03',
    },
    {
      id: 'ba2',
      userName: '鈴木食堂',
      email: 'suzuki@example.com',
      ShopName: '鈴木食堂',
      PhoneNumber: '090-8765-4321',
      address: '山田市4-5-6',
      date: '2025-11-02',
    },
  ]);

  const [inquiries, setInquiries] = useState<Inquiry[]>(mockInquiries);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyOpen, setShowOnlyOpen] = useState(false);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyingInquiry, setReplyingInquiry] = useState<Inquiry | null>(null);
  const [replyText, setReplyText] = useState('');

  const systemStats = {
    totalUsers: 1234,
    activeUsers: 856,
    totalPosts: mockPins.length,
    totalReactions: mockPins.reduce((sum, pin) => sum + pin.reactions, 0),
    businessUsers: 45,
    pendingReports: reports.filter((r) => r.status === 'pending').length,
  };

  const weeklyActivityData = [
    { date: '10/28', users: 720, posts: 45, reactions: 156 },
    { date: '10/29', users: 780, posts: 52, reactions: 189 },
    { date: '10/30', users: 810, posts: 48, reactions: 201 },
    { date: '10/31', users: 845, posts: 67, reactions: 234 },
    { date: '11/01', users: 890, posts: 71, reactions: 267 },
    { date: '11/02', users: 920, posts: 63, reactions: 298 },
    { date: '11/03', users: 856, posts: 58, reactions: 315 },
  ];

  const genreDistribution = [
    { name: 'グルメ', value: 2, color: '#EF4444' },
    { name: 'イベント', value: 1, color: '#F59E0B' },
    { name: '景色', value: 1, color: '#10B981' },
    { name: 'お店', value: 1, color: '#3B82F6' },
    { name: '緊急情報', value: 1, color: '#8B5CF6' },
  ];

  const handleApproveBusinessAccount = (_appId: string) => {
    // TODO: API を呼び出して承認状態を更新
    toast.success('事業者アカウントを承認しました');
  };

  const handleRejectBusinessAccount = (_appId: string) => {
    // TODO: API を呼び出して却下状態を更新
    toast.success('事業者申請を却下しました');
  };

  const handleResolveReport = (_reportId: string) => {
    toast.success('通報を処理しました');
  };

  const handleDeletePost = (_pinId: string) => {
    if (confirm('この投稿を削除しますか？')) {
      toast.success('投稿を削除しました');
    }
  };

  const handleDeleteAccount = (_userId: string) => {
    if (confirm('このアカウントを削除しますか？関連する全ての投稿も削除されます。')) {
      toast.success('アカウントを削除しました');
    }
  };

  const handleDeleteInquiry = (id: string) => {
    if (confirm('この問い合わせを削除しますか？')) {
      setInquiries((prev) => prev.filter((q) => q.id !== id));
      toast.success('問い合わせを削除しました');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* サイドバー */}
      <div className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-2xl z-20">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="tracking-wide">管理者</h2>
              <p className="text-xs text-slate-400">こじゃんとやまっぷ</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg'
                : 'hover:bg-slate-700'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>概要</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'reports'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg'
                : 'hover:bg-slate-700'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
            <span className="flex-1 text-left">通報管理</span>
            {systemStats.pendingReports > 0 && (
              <Badge className="bg-red-500">{systemStats.pendingReports}</Badge>
            )}
          </button>
          <button
            onClick={() => setActiveTab('business')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'business'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg'
                : 'hover:bg-slate-700'
            }`}
          >
            <UserCheck className="w-5 h-5" />
            <span className="flex-1 text-left">事業者申請</span>
            {businessApplications.length > 0 && (
              <Badge className="bg-orange-500">{businessApplications.length}</Badge>
            )}
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'posts'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg'
                : 'hover:bg-slate-700'
            }`}
          >
            <MapPin className="w-5 h-5" />
            <span>投稿管理</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg'
                : 'hover:bg-slate-700'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>ユーザー管理</span>
          </button>
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'inquiries'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg'
                : 'hover:bg-slate-700'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="flex-1 text-left">お問い合わせ</span>
            {inquiries.length > 0 && <Badge className="bg-emerald-500">{inquiries.length}</Badge>}
          </button>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <div className="mb-3 px-2">
            <p className="text-xs text-slate-400">ログイン中</p>
            <p className="text-sm truncate">{user.name}</p>
          </div>
          <Button
            variant="outline"
            className="w-full bg-transparent border-slate-600 hover:bg-slate-700 text-white"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            ログアウト
          </Button>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="ml-64 min-h-screen">
        {/* ヘッダー */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-8 py-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-slate-900">
                {activeTab === 'overview' && 'ダッシュボード概要'}
                {activeTab === 'reports' && '通報管理'}
                {activeTab === 'business' && '事業者申請'}
                {activeTab === 'posts' && '投稿管理'}
                {activeTab === 'users' && 'ユーザー管理'}
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                <Clock className="w-3 h-3 inline mr-1" />
                最終更新: {new Date().toLocaleString('ja-JP')}
              </p>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* 概要タブ */}
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-7xl">
              {/* 統計カード */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="border-none shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm opacity-90 flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      総ユーザー数
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl">{systemStats.totalUsers.toLocaleString()}</div>
                    <p className="text-xs opacity-75 mt-1">登録済みアカウント</p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm opacity-90 flex items-center">
                      <Activity className="w-4 h-4 mr-2" />
                      アクティブユーザー
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl">{systemStats.activeUsers.toLocaleString()}</div>
                    <p className="text-xs opacity-75 mt-1">過去7日間</p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm opacity-90 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      総投稿数
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl">{systemStats.totalPosts.toLocaleString()}</div>
                    <p className="text-xs opacity-75 mt-1">全ジャンル</p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-lg bg-gradient-to-br from-orange-500 to-red-600 text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm opacity-90 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      総リアクション
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl">{systemStats.totalReactions.toLocaleString()}</div>
                    <p className="text-xs opacity-75 mt-1">いいね数合計</p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm opacity-90 flex items-center">
                      <UserCheck className="w-4 h-4 mr-2" />
                      事業者アカウント
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl">{systemStats.businessUsers.toLocaleString()}</div>
                    <p className="text-xs opacity-75 mt-1">認証済み事業者</p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-lg bg-gradient-to-br from-red-500 to-pink-600 text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm opacity-90 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      未処理通報
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl">{systemStats.pendingReports.toLocaleString()}</div>
                    <p className="text-xs opacity-75 mt-1">要確認</p>
                  </CardContent>
                </Card>
              </div>

              {/* グラフエリア */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 shadow-xl border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                      週間アクティビティ推移
                    </CardTitle>
                    <CardDescription>ユーザー活動とコンテンツ投稿の推移</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={weeklyActivityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="posts" fill="#3b82f6" name="新規投稿" radius={[8, 8, 0, 0]} />
                        <Bar
                          dataKey="reactions"
                          fill="#8b5cf6"
                          name="リアクション"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="shadow-xl border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Eye className="w-5 h-5 mr-2 text-purple-600" />
                      ジャンル別投稿
                    </CardTitle>
                    <CardDescription>カテゴリー分布</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={genreDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => entry.name}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {genreDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* 通報管理タブ */}
          {activeTab === 'reports' && (
            <div className="max-w-5xl space-y-4">
              {reports.map((report) => (
                <Card
                  key={report.id}
                  className="shadow-lg border-slate-200 hover:shadow-xl transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <Badge
                            className={report.status === 'pending' ? 'bg-red-500' : 'bg-slate-400'}
                          >
                            {report.status === 'pending' ? '未処理' : '処理済み'}
                          </Badge>
                          <span className="text-sm text-slate-500">{report.date}</span>
                        </div>
                        <div className="space-y-2">
                          <p className="flex items-center">
                            <span className="text-sm text-slate-600 w-24">通報者:</span>
                            <span>{report.reporter}</span>
                          </p>
                          <p className="flex items-center">
                            <span className="text-sm text-slate-600 w-24">理由:</span>
                            <span className="text-red-600">{report.reason}</span>
                          </p>
                          <p className="flex items-center">
                            <span className="text-sm text-slate-600 w-24">対象投稿ID:</span>
                            <span className="text-sm text-slate-700">{report.pinId}</span>
                          </p>
                        </div>
                      </div>
                      {report.status === 'pending' && (
                        <div className="flex space-x-2 ml-4">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeletePost(report.pinId)}
                            className="shadow-md"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            投稿削除
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResolveReport(report.id)}
                            className="shadow-md"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            却下
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* ★事業者申請一覧表示 */}
          {activeTab === 'business' && (
            <div className="max-w-5xl space-y-4">
              <BusinessApplicationList
                applications={businessApplications}
                onApprove={handleApproveBusinessAccount}
                onReject={handleRejectBusinessAccount}
              />
            </div>
          )}

          {/* 事業者申請タブ */}
          {/*{activeTab === 'business' && (
            <div className="max-w-5xl space-y-4">
              {businessApplications.map((app) => (
                <Card key={app.id} className="shadow-lg border-slate-200 hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-xs text-slate-500">事業者名</p>
                          <p>{app.businessName}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-slate-500">申請者</p>
                          <p>{app.userName}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-slate-500">メールアドレス</p>
                          <p className="text-sm">{app.email}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-slate-500">電話番号</p>
                          <p>{app.phone}</p>
                        </div>
                        <div className="col-span-2 space-y-1">
                          <p className="text-xs text-slate-500">住所</p>
                          <p>{app.address}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-slate-500">申請日</p>
                          <p className="text-sm">{app.date}</p>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2 ml-6">
                        <Button 
                          size="sm"
                          onClick={() => handleApproveBusinessAccount(app.id)}
                          className="bg-green-600 hover:bg-green-700 shadow-md"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          承認
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleRejectBusinessAccount(app.id)}
                          className="shadow-md"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          却下
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          */}

          {/* 投稿管理タブ */}
          {activeTab === 'posts' && (
            <div className="max-w-5xl">
              <Card className="shadow-xl border-slate-200">
                <CardHeader>
                  <CardTitle>投稿一覧</CardTitle>
                  <CardDescription>全ての投稿の管理</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {mockPins.slice(0, 10).map((pin) => (
                      <div
                        key={pin.id}
                        className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex-1">
                          <p>{pin.title}</p>
                          <p className="text-sm text-slate-600">
                            投稿者: {pin.userRole === 'business' ? pin.businessName : pin.userName}
                          </p>
                          <div className="flex items-center space-x-3 mt-1">
                            <Badge variant="outline">{pin.genre}</Badge>
                            <span className="text-xs text-slate-500">
                              リアクション: {pin.reactions}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeletePost(pin.id)}
                          className="shadow-md"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ユーザー管理タブ */}
          {activeTab === 'users' && (
            <div className="max-w-5xl">
              <Card className="shadow-xl border-slate-200">
                <CardHeader>
                  <CardTitle>ユーザー一覧</CardTitle>
                  <CardDescription>全てのユーザーアカウントの管理</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      {
                        id: 'u1',
                        name: '山田太郎',
                        email: 'yamada@example.com',
                        role: 'general',
                        posts: 5,
                      },
                      {
                        id: 'u2',
                        name: '山田商店',
                        email: 'yamadashouten@example.com',
                        role: 'business',
                        posts: 12,
                      },
                      {
                        id: 'u3',
                        name: '佐藤花子',
                        email: 'sato@example.com',
                        role: 'general',
                        posts: 3,
                      },
                    ].map((userItem) => (
                      <div
                        key={userItem.id}
                        className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <p>{userItem.name}</p>
                            <Badge
                              className={
                                userItem.role === 'business' ? 'bg-blue-600' : 'bg-slate-400'
                              }
                            >
                              {userItem.role === 'business' ? '事業者' : '一般'}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600">{userItem.email}</p>
                          <p className="text-xs text-slate-500 mt-1">投稿数: {userItem.posts}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteAccount(userItem.id)}
                          className="shadow-md"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          削除
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* お問い合わせタブ */}
          {activeTab === 'inquiries' && (
            <div className="max-w-5xl space-y-4">
              <Card className="shadow-lg border-slate-200">
                <CardHeader>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                      <div>
                        <CardTitle>お問い合わせ一覧</CardTitle>
                        <CardDescription>
                          一般会員・事業者からの問い合わせを管理します
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center bg-white rounded shadow px-2 py-1">
                        <input
                          className="w-64 px-2 py-1 text-sm outline-none"
                          placeholder="検索（名前・メール・本文）"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <Button
                        size="sm"
                        variant={showOnlyOpen ? undefined : 'outline'}
                        onClick={() => setShowOnlyOpen((v) => !v)}
                        className="shadow-sm"
                      >
                        未対応のみ
                      </Button>
                      <Badge className="bg-emerald-500">{inquiries.length}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(() => {
                      const q = searchQuery.trim().toLowerCase();
                      const filtered = inquiries.filter((it) => {
                        if (showOnlyOpen && it.status !== 'open') return false;
                        if (!q) return true;
                        return (
                          it.fromName.toLowerCase().includes(q) ||
                          it.email.toLowerCase().includes(q) ||
                          it.message.toLowerCase().includes(q)
                        );
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="text-sm text-slate-500">
                            条件に一致する問い合わせはありません。
                          </div>
                        );
                      }

                      return filtered.map((inq) => (
                        <Card key={inq.id} className="shadow-sm border-slate-100">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <p className="font-medium">{inq.fromName}</p>
                                  <Badge
                                    className={
                                      inq.role === 'business' ? 'bg-blue-600' : 'bg-slate-400'
                                    }
                                  >
                                    {inq.role === 'business' ? '事業者' : '一般'}
                                  </Badge>
                                  <span className="text-xs text-slate-500">{inq.date}</span>
                                  <Badge
                                    className={
                                      inq.status === 'open' ? 'bg-red-500' : 'bg-slate-400'
                                    }
                                  >
                                    {inq.status === 'open' ? '未対応' : '対応済み'}
                                  </Badge>
                                  {inq.draft && (
                                    <Badge className="bg-yellow-500 text-slate-900">下書き</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-slate-700 mb-2">{inq.message}</p>
                                <p className="text-xs text-slate-500">{inq.email}</p>
                              </div>
                              <div className="flex flex-col ml-4 space-y-2">
                                {inq.status === 'open' && (
                                  <Button
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700"
                                    onClick={() => {
                                      setReplyingInquiry(inq);
                                      setReplyText('');
                                      setReplyModalOpen(true);
                                    }}
                                  >
                                    返信
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteInquiry(inq.id)}
                                >
                                  削除
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ));
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          {/* 返信モーダル（簡易実装・モックのメール送信） */}
          {replyModalOpen && replyingInquiry && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-lg w-[640px] max-w-full p-4 shadow-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium">{`返信: ${replyingInquiry.fromName}`}</h3>
                    <p className="text-sm text-slate-500">
                      宛先: {replyingInquiry.email} ・{' '}
                      {replyingInquiry.role === 'business' ? '事業者' : '一般'}
                    </p>
                  </div>
                  <div>
                    <button
                      className="text-slate-500 hover:text-slate-700"
                      onClick={() => {
                        setReplyModalOpen(false);
                        setReplyingInquiry(null);
                        setReplyText('');
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <textarea
                    className="w-full h-40 p-2 border rounded resize-none"
                    placeholder="ここに返信内容を入力します（モック）。メール送信すると自動で対応済みに切り替わります。"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                </div>
                <div className="flex justify-end space-x-2 mt-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setReplyModalOpen(false);
                      setReplyingInquiry(null);
                      setReplyText('');
                    }}
                  >
                    キャンセル
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (!replyingInquiry) return;
                      // モック: メール送信として扱い、問い合わせを対応済みにする
                      setInquiries((prev) =>
                        prev.map((q) =>
                          q.id === replyingInquiry.id
                            ? { ...q, status: 'responded', draft: undefined }
                            : q
                        )
                      );
                      toast.success(
                        'メールを送信しました（モック）。問い合わせを対応済みにしました。'
                      );
                      setReplyModalOpen(false);
                      setReplyingInquiry(null);
                      setReplyText('');
                    }}
                  >
                    メールで送信
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (!replyingInquiry) return;
                      // 下書きを保存（モック）：draft フィールドに本文を保存、ステータスは変更しない
                      setInquiries((prev) =>
                        prev.map((q) =>
                          q.id === replyingInquiry.id ? { ...q, draft: replyText } : q
                        )
                      );
                      toast.success('下書きを保存しました（モック）。');
                      setReplyModalOpen(false);
                      setReplyingInquiry(null);
                      setReplyText('');
                    }}
                  >
                    下書き
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
