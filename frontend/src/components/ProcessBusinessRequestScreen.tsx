import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { BusinessApplicationList } from './AdminDisplayBusinessApplicationList';
import { AdminDisplayBusinessRequest } from './AdminDisplayBusinessApplicationList';

// Props definition removed as it now manages its own data
// interface Props {}

export default function ProcessBusinessRequestScreen() {
  const [applications, setApplications] = useState<AdminDisplayBusinessRequest[]>([]);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await fetch('/api/admin/applications');
        if (!res.ok) throw new Error('Failed to fetch business requests');
        const data = await res.json();
        setApplications(data.requests || data);
      } catch (error) {
        console.error('Error fetching business applications:', error);
      }
    };
    fetchApplications();
  }, []);

  const handleApprove = async (requestId: number) => {
    if (!confirm('この事業者を承認しますか？')) return;
    try {
      const res = await fetch(`/api/applications/${requestId}/approve`, { method: 'PUT' });
      if (!res.ok) throw new Error('Approval failed');

      setApplications((prev) => prev.filter((app) => app.requestId !== requestId));
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

      setApplications((prev) => prev.filter((app) => app.requestId !== requestId));
      toast.error('申請を却下しました');
    } catch (error) {
      console.error(error);
      toast.error('却下に失敗しました');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">事業者申請の処理</h2>
          <p className="text-sm text-slate-500">
            M4-5 AdminGetBusinessApplications に基づく申請管理
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-600">
            未処理案件: <span className="text-blue-600 text-lg">{applications.length}</span> 件
          </p>
        </div>
      </div>

      <BusinessApplicationList
        applications={applications}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
