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
 * Renders a report UI that toggles between a trigger button and an inline reporting form.
 *
 * When not reporting, renders a "通報" button that enables the reporting form. When reporting,
 * renders a textarea for the report reason and "送信"/"キャンセル" actions. Submitting with an
 * empty or whitespace-only reason shows an error toast; a valid submission shows a success toast,
 * clears the input, closes the form, and invokes `onReportComplete`.
 *
 * @param isReporting - Whether the reporting form is currently shown
 * @param setIsReporting - Function to open or close the reporting form
 * @param onReportComplete - Callback invoked after a successful report submission
 * @returns A JSX element: either the report trigger button or the reporting form
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