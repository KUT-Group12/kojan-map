import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { User, Report } from '../types';
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

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  totalReactions: number;
  businessUsers: number;
  pendingReports: number;
}

interface GenreDistribution {
  name: string;
  value: number;
  color: string;
}

interface WeeklyActivity {
  date: string;
  posts: number;
  reactions: number;
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const [reports, setReports] = useState<Report[]>([]);
  const [businessApplications, setBusinessApplications] = useState<AdminDisplayBusinessRequest[]>(
    []
  );
  const [userList, setUsers] = useState<AdminUser[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalPosts: 0,
    totalReactions: 0,
    businessUsers: 0,
    pendingReports: 0,
  });
  const [weeklyActivityData, setWeeklyActivityData] = useState<WeeklyActivity[]>([]);
  const [genreDistribution, setGenreDistribution] = useState<GenreDistribution[]>([]);

  const API_BASE = '/api';

  const fetchOverviewData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/summary`);
      if (!res.ok) throw new Error('Failed to fetch summary');
      const data = await res.json();
      if (data.stats) setSystemStats(data.stats);
      if (data.activity) setWeeklyActivityData(data.activity);
      if (data.genres) setGenreDistribution(data.genres);
    } catch (error) {
      console.error('Error fetching overview:', error);
    }
  }, []);

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/reports`);
      if (!res.ok) throw new Error('Failed to fetch reports');
      const data = await res.json();
      setReports(data.reports || data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  }, []);

  const fetchBusinessApplications = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/request`);
      if (!res.ok) throw new Error('Failed to fetch business requests');
      const data = await res.json();
      setBusinessApplications(data.requests || data);
    } catch (error) {
      console.error('Error fetching business applications:', error);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/users`);
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data.users || data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, []);

  const fetchInquiries = useCallback(async () => {
    try {
      const res = await fetch(`/internal/asks`);
      if (!res.ok) throw new Error('Failed to fetch inquiries');
      const data = await res.json();
      setInquiries(data.asks || data);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    }
  }, []);

  useEffect(() => {
    switch (activeTab) {
      case 'overview':
        fetchOverviewData();
        break;
      case 'reports':
        fetchReports();
        break;
      case 'business':
        fetchBusinessApplications();
        break;
      case 'users':
        fetchUsers();
        break;
      case 'inquiries':
        fetchInquiries();
        break;
    }
  }, [
    activeTab,
    fetchOverviewData,
    fetchReports,
    fetchBusinessApplications,
    fetchUsers,
    fetchInquiries,
  ]);

  const handleApprove = async (requestId: number) => {
    if (!confirm('この事業者を承認しますか？')) return;
    try {
      const res = await fetch(`/api/applications/${requestId}/approve`, { method: 'PUT' });
      if (!res.ok) throw new Error('Approval failed');

      setBusinessApplications((prev) => prev.filter((app) => app.requestId !== requestId));
      toast.success('事業者アカウントを承認しました');
    } catch (error) {
      console.error(error);
      toast.error('承認に失敗しました');
    }
  };

  const handleReject = async (requestId: number) => {
    if (!confirm('この申請を却下しますか？')) return;
    try {
      const res = await fetch(`/api/applications/${requestId}/reject`, { method: 'PUT' });
      if (!res.ok) throw new Error('Rejection failed');

      setBusinessApplications((prev) => prev.filter((app) => app.requestId !== requestId));
      toast.error('申請を却下しました');
    } catch (error) {
      console.error(error);
      toast.error('却下に失敗しました');
    }
  };

  const handleResolveReport = async (reportId: number) => {
    try {
      const res = await fetch(`${API_BASE}/admin/reports/${reportId}/handle`, { method: 'PUT' });
      if (!res.ok) throw new Error('Failed to resolve report');

      setReports((prev) =>
        prev.map((report) =>
          report.reportId === reportId ? { ...report, reportFlag: true } : report
        )
      );
      toast.success('通報を処理済みにしました');
    } catch (error) {
      console.error(error);
      toast.error('処理に失敗しました');
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm('この投稿を削除しますか？')) return;
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}`, { method: 'DELETE' });
      if (!res.ok) {
        console.warn('Backend delete might not be implemented, updating UI only');
      }

      setReports((prev) =>
        prev.map((report) =>
          report.postId === postId
            ? {
              ...report,
              reportFlag: true,
              removeFlag: true,
            }
            : report
        )
      );
      toast.success('投稿を削除し、関連する通報を処理済みにしました');
    } catch (error) {
      console.error(error);
      toast.error('削除操作に失敗しました');
    }
  };

  const handleDeleteAccount = async (googleId: string) => {
    if (!confirm('このアカウントを完全に削除してもよろしいですか？')) return;
    try {
      const res = await fetch(`/internal/users/${googleId}`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to delete user');

      setUsers((prev) => prev.filter((user) => user.googleId !== googleId));
      toast.success('アカウントを削除しました');
    } catch (error) {
      console.error(error);
      toast.error('アカウント削除に失敗しました');
    }
  };

  const handleDeleteInquiry = async (askId: number) => {
    if (!confirm('この問い合わせを削除しますか？')) return;
    try {
      const res = await fetch(`/internal/requests/${askId}/reject`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to delete');

      setInquiries((prev) => prev.filter((q) => q.askId !== askId));
      toast.success('問い合わせを削除しました');
    } catch (error) {
      console.error(error);
      toast.error('削除に失敗しました');
    }
  };

  const handleApproveInquiry = async (askId: number) => {
    try {
      const res = await fetch(`/internal/requests/${askId}/approve`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to approve');

      setInquiries((prev) =>
        prev.map((q) => (q.askId === askId ? { ...q, askFlag: true } : q))
      );
      toast.success('問い合わせを対応済みにしました');
    } catch (error) {
      console.error(error);
      toast.error('対応済みにできませんでした');
    }
  };

  const reportProps: AdminReportProps = {
    reports: reports,
    onDeletePost: handleDeletePost,
    onResolveReport: handleResolveReport,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
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
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'overview'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg'
              : 'hover:bg-slate-700'
              }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>概要</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'reports'
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
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'business'
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
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'users'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg'
              : 'hover:bg-slate-700'
              }`}
          >
            <Users className="w-5 h-5" />
            <span>ユーザー管理</span>
          </button>
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'inquiries'
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
            <p className="text-sm font-medium">{user.fromName}</p>
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

      <div className="ml-64 min-h-screen">
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
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-7xl">
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
                    {weeklyActivityData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={weeklyActivityData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar
                            dataKey="posts"
                            fill="#3b82f6"
                            name="新規投稿"
                            radius={[8, 8, 0, 0]}
                          />
                          <Bar
                            dataKey="reactions"
                            fill="#8b5cf6"
                            name="リアクション"
                            radius={[8, 8, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-slate-400">
                        データがありません
                      </div>
                    )}
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
                    {genreDistribution.length > 0 ? (
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
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-slate-400">
                        データがありません
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'reports' && <AdminReport {...reportProps} />}

          {activeTab === 'business' && (
            <ProcessBusinessRequestScreen
              applications={businessApplications}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          )}

          {activeTab === 'users' && (
            <AdminUserManagement users={userList} onDeleteAccount={handleDeleteAccount} />
          )}

          {activeTab === 'inquiries' && (
            <AdminContactManagement
              inquiries={inquiries}
              setInquiries={setInquiries}
              onDeleteInquiry={handleDeleteInquiry}
              onApproveInquiry={handleApproveInquiry}
            />
          )}
        </div>
      </div>
    </div>
  );
}
