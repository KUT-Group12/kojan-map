import { Flag } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { useState } from 'react';

interface ReportScreenProps {
  isReporting: boolean;
  setIsReporting: (value: boolean) => void;
  onReportComplete: () => void;
}

/**
 * Renders the report UI: a trigger button when reporting is inactive, or a textarea with Send/Cancel actions when active.
 *
 * When the Send action is invoked with a non-empty reason, the component shows a success toast, clears the input, closes the reporting UI, and calls `onReportComplete`. If the reason is empty, it shows an error toast and keeps the UI open.
 *
 * @param isReporting - Whether the reporting UI is currently active.
 * @param setIsReporting - Function to enable or disable the reporting UI.
 * @param onReportComplete - Callback invoked after a report is successfully submitted.
 * @returns The report UI as a React element.
 */
export function ReportScreen({ isReporting, setIsReporting, onReportComplete }: ReportScreenProps) {
  const [reportReason, setReportReason] = useState('');

  const handleReport = () => {
    if (!reportReason.trim()) {
      toast.error('通報理由を入力してください');
      return;
    }
    toast.success('通報を受け付けました。運営が確認いたします。');
    setReportReason('');
    setIsReporting(false);
    onReportComplete();
  };

  if (!isReporting) {
    return (
      <Button
        onClick={() => setIsReporting(true)}
        variant="outline"
        // w-full を削除して、元のサイズ感に戻す
      >
        <Flag className="w-4 h-4 mr-2" />
        通報
      </Button>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3 w-full animate-in fade-in">
      <p className="text-sm font-medium text-yellow-800">通報理由：</p>
      <Textarea
        value={reportReason}
        onChange={(e) => setReportReason(e.target.value)}
        placeholder="理由を入力"
        rows={3}
        className="bg-white"
      />
      <div className="flex gap-2">
        <Button onClick={handleReport} variant="destructive" size="sm" className="flex-1">
          送信
        </Button>
        <Button
          onClick={() => setIsReporting(false)}
          variant="outline"
          size="sm"
          className="flex-1"
        >
          キャンセル
        </Button>
      </div>
    </div>
  );
}