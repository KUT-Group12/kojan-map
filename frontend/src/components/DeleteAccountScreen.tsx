import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { User, Business } from '../types';
import { AlertTriangle, ArrowLeft, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface DeleteAccountScreenProps {
  business: Business;
  user: User;
  onBack: () => void;
  onDeleteAccount: () => void;
}

export function DeleteAccountScreen({ business, user, onBack, onDeleteAccount }: DeleteAccountScreenProps) {
  const [confirmChecks, setConfirmChecks] = useState({
    dataLoss: false,
    noCancellation: false,
    postsDeleted: false,
  });
  const [deleteReason, setDeleteReason] = useState('');

  const canDelete =
    confirmChecks.dataLoss && confirmChecks.noCancellation && confirmChecks.postsDeleted;

  const handleDelete = () => {
    if (!canDelete) return;

    if (confirm('本当にアカウントを削除してもよろしいですか？この操作は取り消せません。')) {
      toast.success('アカウントを削除しました');
      onDeleteAccount();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* 戻るボタン */}
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          マイページに戻る
        </Button>

        {/* 警告カード */}
        <Card className="border-red-300 bg-red-50">
          <CardHeader>
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              <CardTitle>アカウント削除の確認</CardTitle>
            </div>
            <CardDescription className="text-red-700">
              この操作は取り消すことができません。慎重にご確認ください。
            </CardDescription>
          </CardHeader>
        </Card>

        {/* アカウント情報 */}
        <Card>
          <CardHeader>
            <CardTitle>削除されるアカウント情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">ユーザー名</p>
                <p>{user.role === 'business' ? business.businessName : '匿名'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">メールアドレス</p>
                <p>{user.gmail}</p>
              </div>
              {user.role === 'business' && business.businessName && (
                <div>
                  <p className="text-sm text-gray-600">事業者名</p>
                  <p>{business.businessName}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 削除内容の確認 */}
        <Card>
          <CardHeader>
            <CardTitle>削除される内容</CardTitle>
            <CardDescription>
              アカウントを削除すると、以下のすべてのデータが完全に削除されます
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                すべての投稿とピン情報
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                リアクション履歴
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                アカウント設定とプロフィール情報
              </li>
              {user.role === 'business' && (
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  事業者情報とアイコン画像
                </li>
              )}
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                ブロックリストとその他の設定
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* 退会理由（任意） */}
        <Card>
          <CardHeader>
            <CardTitle>退会理由（任意）</CardTitle>
            <CardDescription>
              サービス改善のため、よろしければ退会理由をお聞かせください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder="退会理由をご記入ください（任意）"
              rows={4}
            />
          </CardContent>
        </Card>

        {/* 確認チェックボックス */}
        <Card>
          <CardHeader>
            <CardTitle>削除の確認</CardTitle>
            <CardDescription>以下のすべての項目を確認し、チェックを入れてください</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="dataLoss"
                  checked={confirmChecks.dataLoss}
                  onCheckedChange={(checked) =>
                    setConfirmChecks({ ...confirmChecks, dataLoss: checked as boolean })
                  }
                />
                <Label htmlFor="dataLoss" className="cursor-pointer leading-relaxed">
                  すべてのデータが完全に削除されることを理解しました
                </Label>
              </div>
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="noCancellation"
                  checked={confirmChecks.noCancellation}
                  onCheckedChange={(checked) =>
                    setConfirmChecks({ ...confirmChecks, noCancellation: checked as boolean })
                  }
                />
                <Label htmlFor="noCancellation" className="cursor-pointer leading-relaxed">
                  この操作は取り消すことができないことを理解しました
                </Label>
              </div>
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="postsDeleted"
                  checked={confirmChecks.postsDeleted}
                  onCheckedChange={(checked) =>
                    setConfirmChecks({ ...confirmChecks, postsDeleted: checked as boolean })
                  }
                />
                <Label htmlFor="postsDeleted" className="cursor-pointer leading-relaxed">
                  投稿したすべてのピンが削除されることを理解しました
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* アクションボタン */}
        <div className="flex space-x-4 pb-8">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!canDelete}
            className="flex-1"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            アカウントを削除する
          </Button>
          <Button variant="outline" onClick={onBack} className="flex-1">
            キャンセル
          </Button>
        </div>
      </div>
    </div>
  );
}
