// 事業者申請一覧表示 M4-5-2
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import { BusinessRequest } from '../types';

export interface AdminDisplayBusinessRequest extends BusinessRequest {
  fromName: string; // 申請者氏名
  gmail: string; // 申請者メールアドレス
  applicationDate: string; // 申請日時
}

interface Props {
  applications: AdminDisplayBusinessRequest[];
  onApprove: (requestId: number) => void;
  onReject: (requestId: number) => void;
}

export function BusinessApplicationList({ applications, onApprove, onReject }: Props) {
  if (applications.length === 0) {
    return <div className="text-center p-8 text-gray-500">現在、未処理の申請はありません。</div>;
  }

  return (
    <div className="max-w-5xl space-y-4">
      {applications.map((app) => (
        <Card
          key={app.requestId}
          className="shadow-lg border-slate-200 hover:shadow-xl transition-shadow"
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">事業者名</p>
                  <p className="font-semibold text-slate-900">{app.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">申請者 (Google ID)</p>
                  <p className="text-sm">{app.userId}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">メールアドレス (gmail)</p>
                  <p className="text-sm">{app.gmail}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">電話番号</p>
                  <p>{app.phone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-500">所在地</p>
                  <p>{app.address}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">申請日時</p>
                  <p className="text-sm text-slate-600">{app.applicationDate}</p>
                </div>
              </div>

              <div className="flex flex-col space-y-2 ml-6">
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 shadow-md text-white"
                  onClick={() => onApprove(app.requestId)}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  承認
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="shadow-md border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => onReject(app.requestId)}
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
  );
}
