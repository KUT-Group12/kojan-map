import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { User, Post, Business } from '../types';
import { Upload, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { SelectPostHistory } from './SelectPostHistory';
import { SelectUserSetting } from './SelectUserSetting';

interface BusinessDisplayMyPageProps {
  user: User;
  business: Business;
  posts: Post[];
  onPinClick: (post: Post) => void;
  onDeletePin: (postId: number) => void;
  onUpdateUser: (updatedUser: User | Business) => void;
  onNavigateToDeleteAccount: () => void;
}

export function BusinessDisplayMyPage({
  user,
  business,
  posts,
  onPinClick,
  onUpdateUser,
  onNavigateToDeleteAccount,
}: BusinessDisplayMyPageProps) {
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingNameValue, setEditingNameValue] = useState(business.businessName || '');

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('5MB以下にしてください');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => setSelectedIcon(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveIcon = () => {
    if (!selectedIcon) return;
    setIsUploadingIcon(true);
    onUpdateUser({ ...business, profileImage: selectedIcon });
    toast.success('アイコンを更新しました');
    setIsUploadingIcon(false);
    setSelectedIcon(null);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>事業者マイページ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">店舗・事業者名</p>
                <div className="flex items-center space-x-2">
                  {isEditingName ? (
                    <>
                      <input
                        className="px-2 py-1 border rounded"
                        value={editingNameValue}
                        onChange={(e) => setEditingNameValue(e.target.value)}
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          onUpdateUser({ ...business, businessName: editingNameValue });
                          setIsEditingName(false);
                        }}
                      >
                        保存
                      </Button>
                    </>
                  ) : (
                    <>
                      <p>{business.businessName}</p>
                      <Button size="sm" variant="outline" onClick={() => setIsEditingName(true)}>
                        編集
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">アカウント種別</p>
                <Badge>事業者</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">メールアドレス</p>
                <p>{user.gmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">登録日</p>
                <p>{formatDate(new Date(user.registrationDate))}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* アイコン設定セクション */}
        <Card>
          <CardHeader>
            <CardTitle>事業者アイコン設定</CardTitle>
            <CardDescription>地図上のピンに表示されるアイコン</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-6">
              <div className="w-32 h-32 rounded-lg border-2 overflow-hidden bg-gray-50 flex items-center justify-center">
                {selectedIcon || business.profileImage ? (
                  <img
                    src={selectedIcon || business.profileImage}
                    alt="Icon"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="text-gray-400" />
                )}
              </div>
              <div className="flex-1 space-y-3">
                <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-blue-400">
                  <label htmlFor="icon-upload" className="cursor-pointer">
                    <Upload className="mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">画像を選択 (最大5MB)</p>
                    <input
                      id="icon-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleIconUpload}
                    />
                  </label>
                </div>
                {selectedIcon && (
                  <div className="flex space-x-2">
                    <Button onClick={handleSaveIcon} disabled={isUploadingIcon} className="flex-1">
                      {isUploadingIcon ? '保存中...' : 'アイコンを保存'}
                    </Button>
                    <Button onClick={() => setSelectedIcon(null)} variant="outline">
                      キャンセル
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="posts">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="posts">投稿履歴 ({posts.length})</TabsTrigger>
            <TabsTrigger value="settings">設定</TabsTrigger>
          </TabsList>
          {/* 投稿一覧 */}
          <TabsContent value="posts" className="space-y-4">
            <SelectPostHistory user={user} onPinClick={onPinClick} />
          </TabsContent>
          {/* 設定 */}
          <TabsContent value="settings" className="space-y-4">
            <SelectUserSetting
              user={user}
              onUpdateUser={onUpdateUser}
              onNavigateToDeleteAccount={onNavigateToDeleteAccount}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
