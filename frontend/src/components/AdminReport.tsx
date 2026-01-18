import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Trash2, CheckCircle } from 'lucide-react';
import { Report } from '../types';

export interface AdminReportProps {
  reports: Report[];
  onDeletePost: (postId: number) => void;
  onResolveReport: (reportId: number) => void;
}

export default function AdminReport({ reports, onDeletePost, onResolveReport }: AdminReportProps) {
  // 表示用のリストを作成：reportFlag が false（未対応）を先頭、true（対応済み）を最後尾にする
  const sortedReports = [...reports].sort((a, b) => {
    if (!a.reportFlag && b.reportFlag) return -1;
    if (a.reportFlag && !b.reportFlag) return 1;
    // 同じステータスの場合は、日付の新しい順にする
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="max-w-5xl space-y-4">
      {sortedReports.map((report) => (
        <Card
          key={report.reportId}
          className={`shadow-lg border-slate-200 transition-all ${
            report.reportFlag ? 'opacity-60 bg-slate-50' : 'hover:shadow-xl'
          }`}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* ステータスバッジ部分 */}
                <div className="flex items-center space-x-3 mb-3">
                  <Badge className={!report.reportFlag ? 'bg-red-500' : 'bg-slate-400'}>
                    {!report.reportFlag ? '未処理' : '処理済み'}
                  </Badge>
                  <span className="text-sm text-slate-500">{report.date}</span>
                  {/* 削除フラグが立っている場合の追加バッジ */}
                  {report.removeFlag && (
                    <Badge variant="outline" className="text-red-500 border-red-500">
                      投稿削除済み
                    </Badge>
                  )}
                </div>

                {/* 通報詳細 */}
                <div className="space-y-2">
                  <p className="flex items-center">
                    <span className="text-sm text-slate-600 w-24">通報者(ID):</span>
                    <span className="font-mono text-xs bg-slate-100 px-1 rounded">
                      {report.userId}
                    </span>
                  </p>

                  <p className="flex items-center">
                    <span className="text-sm text-slate-600 w-24">理由:</span>
                    <span className={!report.reportFlag ? 'text-red-600' : 'text-slate-500'}>
                      {report.reason}
                    </span>
                  </p>
                  <p className="flex items-center">
                    <span className="text-sm text-slate-600 w-24">対象投稿ID:</span>
                    <span className="text-sm font-semibold text-slate-700">{report.postId}</span>
                  </p>
                </div>
              </div>

              {/* 未処理の場合のみアクションボタンを表示 */}
              {!report.reportFlag && (
                <div className="flex space-x-2 ml-4">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDeletePost(report.postId)}
                    className="shadow-md"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    投稿削除
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onResolveReport(report.reportId)}
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

      {reports.length === 0 && (
        <div className="text-center py-10 text-slate-500">現在、未処理の通報はありません。</div>
      )}
    </div>
  );
}
