//事業者申請 M2-7-1
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Shield } from 'lucide-react';

interface UserInputBusinessApplicationProps {
  onUpdateUser: (data: BusinessData) => void; //申請処理
  onCancel: () => void; //キャンセル処理
}

// データ型の定義
interface BusinessData {
  ShopName: string;
  PhoneNumber: string;
  address: string;
}

export function UserInputBusinessApplication({
  onUpdateUser,
  onCancel,
}: UserInputBusinessApplicationProps) {
  //状態管理の追加
  const [formData, setFormData] = useState<BusinessData>({
    ShopName: '',
    PhoneNumber: '',
    address: '',
  });

  // 送信ハンドラ
  const handleSubmit = () => {
    // バリデーション（任意）
    if (!formData.ShopName || !formData.PhoneNumber || !formData.address) {
      alert('すべての項目を入力してください');
      return;
    }
    onUpdateUser(formData);
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
          value={formData.ShopName}
          onChange={(e) => setFormData({ ...formData, ShopName: e.target.value })}
        />
        <input
          type="tel"
          placeholder="電話番号"
          className="w-full px-3 py-2 border rounded-lg"
          value={formData.PhoneNumber}
          onChange={(e) => setFormData({ ...formData, PhoneNumber: e.target.value })}
        />
        <input
          type="text"
          placeholder="住所"
          className="w-full px-3 py-2 border rounded-lg"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
      </div>

      <div className="flex space-x-2">
        <Button size="sm" onClick={handleSubmit}>
          申請する
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
      </div>
    </div>
  );
}
