import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { User } from '../types';
import { mockPins, mockInquiries, Inquiry } from '../lib/mockData';
import ProcessBusinessRequestScreen from './ProcessBusinessRequestScreen';
import AdminReport, { AdminReportProps, Report } from './AdminReport';
import AdminUserManagement from './AdminUserManagement';
import AdminContactManagement from './AdminContactManagement';
import {
  Users,
  AlertTriangle,
  TrendingUp,
  MapPin,
  UserCheck,
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
  const [reports, setReports] = useState<Report[]>([
    {
      reportId: 1, // id -> reportId
      userId: 'user_google_001', // reporter(名前)ではなくIDを保持
      postId: 1, // pinId -> postId
      reason: '不適切な内容',
      date: '2025-11-03T10:00:00', // DATETIME形式
      reportFlag: false, // pending相当
      removeFlag: false,
    },
    {
      reportId: 2,
      userId: 'user_google_002',
      postId: 3,
      reason: 'スパム',
      date: '2025-11-02T15:30:00',
      reportFlag: false,
      removeFlag: false,
    },
    {
      reportId: 3,
      userId: 'user_google_003',
      postId: 2,
      reason: '虚偽情報',
      date: '2025-11-01T09:00:00',
      reportFlag: true, // resolved相当
      removeFlag: true, // 例：削除済みとする場合
    },
  ]);

  //データベースから持ってくるようにしなければならない？
  const [businessApplications, setBusinessApplications] = useState([
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

  const [userList, setUserList] = useState([
    { id: 'u1', name: '山田太郎', email: 'yamada@example.com', role: 'general', posts: 5 },
    { id: 'u2', name: '山田商店', email: 'yamadashouten@example.com', role: 'business', posts: 12 },
    { id: 'u3', name: '佐藤花子', email: 'sato@example.com', role: 'general', posts: 3 },
  ]);

  const [inquiries, setInquiries] = useState<Inquiry[]>(mockInquiries);

  /*
  const systemStats = {
    totalUsers: 1234,
    activeUsers: 856,
    totalPosts: mockPins.length,
    totalReactions: mockPins.reduce((sum, pin) => sum + pin.reactions, 0),
    businessUsers: 45,
    pendingReports: reports.filter((r) => r.status === 'pending').length,
  };*/

  const systemStats = {
    totalUsers: 1234,
    activeUsers: 856,
    // pinId から postId への変更に伴い、参照先も修正が必要な場合があります
    totalPosts: mockPins.length,
    totalReactions: mockPins.reduce((sum, pin) => sum + pin.reactions, 0),
    businessUsers: 45,
    // status === 'pending' を reportFlag === false に修正
    pendingReports: reports.filter((r) => r.reportFlag === false).length,
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

  //事業者申請承認時の処理
  const handleApprove = (id: string) => {
    setBusinessApplications((prev) => prev.filter((app) => app.id !== id));
    toast.success('事業者アカウントを承認しました');
  };

  //事業者申請却下時の処理
  const handleReject = (id: string) => {
    setBusinessApplications((prev) => prev.filter((app) => app.id !== id));
    toast.error('事業者申請を却下しました');
  };

  // 未実装の部分はコンソール表示
  const handleResolveReport = (reportId: number) => {
    // console.log('Resolving report:', reportId);
    // toast.success('通報を処理しました');
    setReports((prev) =>
      prev.map((report) =>
        // report.id → report.reportId に変更
        // reportId (引数) と比較
        report.reportId === reportId
          ? { ...report, reportFlag: true } // status: 'resolved' → reportFlag: true に変更
          : report
      )
    );
    toast.success('通報を処理済みにしました');
  };

  const handleDeletePost = (postId: number) => {
    /*
    if (confirm('この投稿を削除しますか？')) {
      // 対象の pinId を持つ通報をすべて処理済みに更新
      setReports((prev) =>
        prev.map((report) =>
          report.pinId === pinId ? { ...report, status: 'resolved' as const } : report
        )
      );
      toast.success('投稿を削除し、関連する通報を処理済みにしました');
    }*/
    if (confirm('この投稿を削除しますか？')) {
      // 対象の postId を持つ通報をすべて処理済み、かつ削除済みに更新
      setReports((prev) =>
        prev.map((report) =>
          report.postId === postId // pinId から postId へ変更
            ? {
                ...report,
                reportFlag: true, // status: 'resolved' の代わり
                removeFlag: true, // 実際に削除したため true に更新
              }
            : report
        )
      );
      toast.success('投稿を削除し、関連する通報を処理済みにしました');
    }
  };

  const reportProps: AdminReportProps = {
    reports: reports,
    onDeletePost: handleDeletePost, // これで宣言済みなのでエラーになりません
    onResolveReport: handleResolveReport,
  };

  const handleDeleteAccount = (userId: string) => {
    setUserList((prev) => prev.filter((user) => user.id !== userId));
    toast.success('アカウントを削除しました');
  };

  /*
  const handleRespondInquiry = (id: string) => {
    setInquiries((prev) => prev.map((q) => (q.id === id ? { ...q, status: 'responded' } : q)));
    toast.success('問い合わせを返信済みにしました');
  };*/

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
          {activeTab === 'reports' && <AdminReport {...reportProps} />}
          {/*
              reports={reports}
              onDeletePost={handleDeletePost}
              onResolveReport={handleResolveReport}*/}

          {/* 事業者申請一覧表示 */}
          {activeTab === 'business' && (
            <ProcessBusinessRequestScreen
              applications={businessApplications} // データを貸す
              onApprove={handleApprove} // 関数を貸す
              onReject={handleReject} // 関数を貸す
            />
          )}

          {/* ユーザー管理タブ */}
          {activeTab === 'users' && (
            <AdminUserManagement users={userList} onDeleteAccount={handleDeleteAccount} />
          )}

          {/* お問い合わせタブ */}
          {activeTab === 'inquiries' && (
            <AdminContactManagement
              inquiries={inquiries}
              setInquiries={setInquiries}
              onDeleteInquiry={handleDeleteInquiry}
            />
          )}
        </div>
      </div>
    </div>
  );
}
