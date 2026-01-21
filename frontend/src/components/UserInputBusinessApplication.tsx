//事業者申請 M2-7-1
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Business, User } from '../types';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8080';

interface UserInputBusinessApplicationProps {
  user: User;
  onUpdateUser: (user: User) => void; //申請処理
  onCancel: () => void; //キャンセル処理
}

// データ型の定義
type BusinessApplicationData = Pick<Business, 'businessName' | 'address'> & {
  phone: string;
};

export function UserInputBusinessApplication({
  user,
  onUpdateUser,
  onCancel,
}: UserInputBusinessApplicationProps) {
  //状態管理の追加
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<BusinessApplicationData>({
    businessName: '',
    phone: '',
    address: '',
  });

  // 送信ハンドラ
  const handleSubmit = async () => {
    // バリデーション（任意）
    const phone = formData.phone.trim();
    if (!formData.businessName || !phone || !formData.address || !/^\d{10,11}$/.test(phone)) {
      toast.error('すべての項目を正しく入力してください');
      return;
    }

    setIsLoading(true);
    try {
      // 1. API仕様: POST /api/business/apply
      const response = await fetch(`${API_BASE_URL}/api/business/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          phone: phone,
          userId: user.googleId, // 申請者のGoogle ID
        }),
      });

      if (!response.ok) {
        throw new Error('申請に失敗しました');
      }

      // 2. 成功時の処理
      toast.success('事業者登録申請を送信しました。運営の承認をお待ちください。');

      // フロントエンド側の状態を「申請中」等に更新（必要であれば）
      onUpdateUser({ ...user });
      onCancel(); // フォームを閉じる
    } catch (error) {
      console.error('Business application error:', error);
      toast.error('通信エラーが発生しました。再度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
      <p className="text-sm flex items-center gap-2">
        <Shield className="w-4 h-4" />
        事業者登録申請
      </p>

      <p className="text-xs text-gray-600">
        事業者として登録すると、店舗名での投稿やダッシュボード機能が利用できます。
      </p>

      <div className="space-y-2">
        <input
          type="text"
          placeholder="店舗名"
          className="w-full px-3 py-2 border rounded-lg"
          value={formData.businessName}
          onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
          disabled={isLoading}
        />
        <input
          type="tel"
          placeholder="電話番号"
          className="w-full px-3 py-2 border rounded-lg"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          disabled={isLoading}
        />
        <input
          type="text"
          placeholder="住所"
          className="w-full px-3 py-2 border rounded-lg"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          disabled={isLoading}
        />
      </div>

      <div className="flex space-x-2">
        <Button size="sm" onClick={handleSubmit} disabled={isLoading} className="flex-1">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '申請する'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          キャンセル
        </Button>
      </div>
    </div>
  );
}
