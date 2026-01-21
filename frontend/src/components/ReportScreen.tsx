import { Flag, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { useState } from 'react';
import { Report } from '../types';
import { getStoredJWT } from '../lib/auth';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8080';

interface ReportScreenProps {
  postId: Report['postId'];
  userId: Report['userId'];
  isReporting: boolean;
  setIsReporting: (value: boolean) => void;
  onReportComplete: () => void;
}

export function ReportScreen({
  postId,
  userId,
  isReporting,
  setIsReporting,
  onReportComplete,
}: ReportScreenProps) {
  const [reason, setReason] = useState<Report['reason']>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReport = async () => {
    if (!reason.trim()) {
      toast.error('通報理由を入力してください');
      return;
    }

    setIsSubmitting(true);

    try {
<<<<<<< HEAD
      // API仕様書(POST /api/report)のキー名に合わせて送信
      const token = getStoredJWT();
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

      const response = await fetch(`${API_BASE_URL}/api/report`, {
=======
      // API仕様書(POST /api/posts/report)のキー名に合わせて送信
      const response = await fetch(`${API_BASE_URL}/api/posts/report`, {
>>>>>>> origin/main
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          postId: postId,
          reason: reason, // バックエンドのキー名: reason
        }),
      });

      if (!response.ok) {
        throw new Error('通報の送信に失敗しました');
      }

      toast.success('通報を受け付けました。運営が確認いたします。');
      setReason('');
      setIsReporting(false);
      onReportComplete();
    } catch (error) {
      console.error('Report error:', error);
      toast.error('エラーが発生しました。再度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isReporting) {
    return (
      <Button onClick={() => setIsReporting(true)} variant="outline">
        <Flag className="w-4 h-4 mr-2" />
        通報
      </Button>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3 w-full animate-in fade-in">
      <p className="text-sm font-medium text-yellow-800">通報理由：</p>
      <Textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="理由を入力"
        rows={3}
        className="bg-white"
        disabled={isSubmitting}
      />
      <div className="flex gap-2">
        <Button
          onClick={handleReport}
          variant="destructive"
          size="sm"
          className="flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : '送信'}
        </Button>
        <Button
          onClick={() => setIsReporting(false)}
          variant="outline"
          size="sm"
          className="flex-1"
          disabled={isSubmitting}
        >
          キャンセル
        </Button>
      </div>
    </div>
  );
}
