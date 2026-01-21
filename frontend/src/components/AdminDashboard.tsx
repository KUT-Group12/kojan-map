import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { User, Report, Post } from '../types';
// import { mockPins } from '../lib/mockData';
import ProcessBusinessRequestScreen from './ProcessBusinessRequestScreen';
import { AdminDisplayBusinessRequest } from './AdminDisplayBusinessApplicationList';
import AdminReport, { AdminReportProps } from './AdminReport';
import AdminUserManagement, { AdminUser } from './AdminUserManagement';
import AdminContactManagement, { Inquiry } from './AdminContactManagement';
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
  const [reports, setReports] = useState<Report[]>();

  //データベースから持ってくるようにしなければならない？
  const [businessApplications, setBusinessApplications] = useState<AdminDisplayBusinessRequest[]>();

  const [userList, setUsers] = useState<AdminUser[]>();

  const Inquiries: Inquiry[] = [];

  const [inquiries, setInquiries] = useState<Inquiry[]>(Inquiries);
  const Posts: Post[] = [];

  const systemStats = {
    totalUsers: 1234,
    activeUsers: 856,
    // pinId から postId への変更に伴い、参照先も修正が必要な場合があります
    totalPosts: Posts.length,
    totalReactions: Posts.reduce((sum, pin) => sum + pin.numReaction, 0),
    businessUsers: 45,
    // status === 'pending' を reportFlag === false に修正
    pendingReports: reports.filter((r) => r.reportFlag === false).length,
  };

  const weeklyActivityData = [];

  const genreDistribution = [];

  // 事業者申請承認時の処理 (M4-5-2 ProcessApplication)
  // 引数を id: string から applicationId: number に変更
  const handleApprove = (requestId: number) => {
    if (confirm('この事業者を承認しますか？')) {
      setBusinessApplications((prev) =>
        // app.applicationId ではなく app.requestId でフィルタリング
        prev.filter((app) => app.requestId !== requestId)
      );
      toast.success('事業者アカウントを承認しました');
    }
  };

  const handleReject = (requestId: number) => {
    if (confirm('この申請を却下しますか？')) {
      setBusinessApplications((prev) =>
        // 却下時も同様に requestId でフィルタリング
        prev.filter((app) => app.requestId !== requestId)
      );
      toast.error('申請を却下しました');
    }
  };

  // 未実装の部分はコンソール表示
  const handleResolveReport = (reportId: number) => {
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
    onDeletePost: handleDeletePost,
    onResolveReport: handleResolveReport,
  };

  const handleDeleteAccount = (googleId: string) => {
    //if (confirm('このアカウントを完全に削除してもよろしいですか？')) {
    // setUserList を users のステート更新関数（setUsers など）に合わせる
    setUsers((prev) =>
      // user.id ではなく user.googleId でフィルタリング
      prev.filter((user) => user.id !== googleId)
    );
    toast.success('アカウントを削除しました');
    //}
  };

  const handleDeleteInquiry = (askId: number) => {
    if (confirm('この問い合わせを削除しますか？')) {
      setInquiries((prev) =>
        // id ではなく askId でフィルタリング
        prev.filter((q) => q.askId !== askId)
      );
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
            {inquiries.filter((q) => !q.askFlag).length > 0 && (
              <Badge className="bg-emerald-500">{inquiries.filter((q) => !q.askFlag).length}</Badge>
            )}
          </button>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <div className="mb-3 px-2">
            <p className="text-xs text-slate-400">ログイン中</p>
            <p className="text-sm font-medium">{user.name}</p>
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
                {activeTab === 'users' && 'ユーザー管理'}
                {activeTab === 'inquiries' && 'お問い合わせ管理'}
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
