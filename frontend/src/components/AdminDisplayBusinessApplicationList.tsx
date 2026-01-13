//事業者申請一覧表示 M4-5-2
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle, XCircle } from 'lucide-react';

//データの型を定義
export interface UserInputBusiness{
  id: string;
  userName: string;
  email: string;
  ShopName: string;
  PhoneNumber: string;
  address: string;
  date: string;
}


interface Props {
  applications: UserInputBusiness[];//データの配列
  onApprove: (id: string) => void;//承諾ボタン
  onReject: (id: string) => void;//キャンセルボタン
}

export function BusinessApplicationList({
  applications,
  onApprove,
  onReject,
}: Props) {

    //もし申請がゼロ件の時
  if (applications.length === 0) {
    return <div className="text-center p-8 text-gray-500">現在、未処理の申請はありません。</div>;
  }

  return (
    <div className="max-w-5xl space-y-4">
      {applications.map((app) => (
        <Card
          key={app.id}
          className="shadow-lg border-slate-200 hover:shadow-xl transition-shadow"
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">事業者名</p>
                  <p>{app.ShopName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">申請者</p>
                  <p>{app.userName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">メールアドレス</p>
                  <p className="text-sm">{app.email}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">電話番号</p>
                  <p>{app.PhoneNumber}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-500">住所</p>
                  <p>{app.address}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">申請日</p>
                  <p className="text-sm">{app.date}</p>
                </div>
              </div>

              <div className="flex flex-col space-y-2 ml-6">
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 shadow-md"
                  onClick={() => onApprove(app.id)}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  承認
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="shadow-md"
                  onClick={() => onReject(app.id)}
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
