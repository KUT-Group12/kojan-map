import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Trash2, CheckCircle } from 'lucide-react';

export interface Report {
  // exportを追加
  id: string;
  pinId: string;
  reporter: string;
  reason: string;
  status: 'pending' | 'resolved';
  date: string;
}

export interface AdminReportProps {
  // exportを追加
  reports: Report[];
  onDeletePost: (pinId: string) => void;
  onResolveReport: (reportId: string) => void;
}

export default function AdminReport({ reports, onDeletePost, onResolveReport }: AdminReportProps) {
  // 表示用のリストを作成：pending を先頭、resolved を最後尾にする
  const sortedReports = [...reports].sort((a, b) => {
    if (a.status === 'pending' && b.status === 'resolved') return -1;
    if (a.status === 'resolved' && b.status === 'pending') return 1;
    // ステータスが同じ場合は、日付の新しい順にする（任意）
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="max-w-5xl space-y-4">
      {sortedReports.map((report) => (
        <Card
          key={report.id}
          className={`shadow-lg border-slate-200 transition-all ${
            report.status === 'resolved' ? 'opacity-60 bg-slate-50' : 'hover:shadow-xl'
          }`}
        >
          {/* ... (内部のコンテンツは同じ) */}
          <CardContent className="p-6">
            {/* 処理済みの場合、背景を少し薄くすると視覚的に分かりやすくなります */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* ステータスバッジ部分 */}
                <div className="flex items-center space-x-3 mb-3">
                  <Badge className={report.status === 'pending' ? 'bg-red-500' : 'bg-slate-400'}>
                    {report.status === 'pending' ? '未処理' : '処理済み'}
                  </Badge>
                  <span className="text-sm text-slate-500">{report.date}</span>
                </div>

                {/* 通報詳細 */}
                <div className="space-y-2">
                  <p className="flex items-center">
                    <span className="text-sm text-slate-600 w-24">通報者:</span>
                    <span>{report.reporter}</span>
                  </p>
                  {/* ... (中略) ... */}
                  <p className="flex items-center">
                    <span className="text-sm text-slate-600 w-24">理由:</span>
                    <span
                      className={report.status === 'pending' ? 'text-red-600' : 'text-slate-500'}
                    >
                      {report.reason}
                    </span>
                  </p>
                  <p className="flex items-center">
                    <span className="text-sm text-slate-600 w-24">対象投稿ID:</span>
                    <span className="text-sm text-slate-700">{report.pinId}</span>
                  </p>
                </div>
              </div>

              {/* 未処理の場合のみアクションボタンを表示 */}
              {report.status === 'pending' && (
                <div className="flex space-x-2 ml-4">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDeletePost(report.pinId)}
                    className="shadow-md"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    投稿削除
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onResolveReport(report.id)}
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

      {/* ... (reports.length === 0 の表示) */}
    </div>
  );
}
