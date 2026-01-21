import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { User, Business } from '../types';
import { AlertTriangle, ArrowLeft, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8080';

interface DeleteAccountScreenProps {
  user: User;
  business?: Business;
  onBack: () => void;
  onDeleteAccount: () => void;
}

export function DeleteAccountScreen({
  user,
  business,
  onBack,
  onDeleteAccount,
}: DeleteAccountScreenProps) {
  const [confirmChecks, setConfirmChecks] = useState({
    dataLoss: false,
    noCancellation: false,
    postsDeleted: false,
  });
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false); // 通信状態管理

  //const canDelete = confirmChecks.dataLoss && confirmChecks.noCancellation && confirmChecks.postsDeleted;
  const canDelete =
    confirmChecks.dataLoss &&
    confirmChecks.noCancellation &&
    confirmChecks.postsDeleted &&
    !isDeleting;

  const handleDelete = async () => {
    if (!canDelete) return;

    /*
    if (confirm('本当にアカウントを削除してもよろしいですか？この操作は取り消せません。')) {
      toast.success('アカウントを削除しました');
      onDeleteAccount();
    }*/
    if (!window.confirm('本当にアカウントを削除してもよろしいですか？この操作は取り消せません。')) {
      return;
    }

    setIsDeleting(true);

    try {
      // API仕様: PUT /api/auth/withdrawal
      const response = await fetch(`${API_BASE_URL}/api/auth/withdrawal`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          googleId: user.googleId, // 仕様書のリクエストパラメータ
          reason: deleteReason,
        }),
      });

      if (!response.ok) {
        throw new Error('退会処理に失敗しました');
      }

      await response.json();
      // toast.success(data.message);
      // レスポンス: { "message": "user deleted" }

      toast.success('アカウントを削除しました。ご利用ありがとうございました。');

      // 親コンポーネントで定義された退会後の処理（セッション破棄、トップへ遷移など）を実行
      onDeleteAccount();
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast.error('エラーが発生しました。時間を置いて再度お試しください。');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* 戻るボタン */}
        <Button variant="ghost" onClick={onBack} disabled={isDeleting}>
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
                <p>{user.role === 'business' ? business?.businessName || '事業者' : '匿名'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">メールアドレス</p>
                <p>{user.gmail}</p>
              </div>
              {user.role === 'business' && business?.businessName && (
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
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                削除処理中...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                アカウントを削除する
              </>
            )}
            {/*
            <Trash2 className="w-4 h-4 mr-2" />
            アカウントを削除する*/}
          </Button>
          <Button variant="outline" onClick={onBack} disabled={isDeleting} className="flex-1">
            キャンセル
          </Button>
        </div>
      </div>
    </div>
  );
}
