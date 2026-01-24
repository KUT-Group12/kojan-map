import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { User, Post, Business } from '../types';
import { Upload, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { SelectPostHistory } from './SelectPostHistory';
import { SelectUserSetting } from './SelectUserSetting';
import { updateBusinessName, uploadBusinessIcon, getStoredJWT } from '../lib/auth';

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
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingNameValue, setEditingNameValue] = useState(business.businessName || '');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const token = getStoredJWT();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleNameUpdate = async () => {
    if (!token) return;
    try {
      await updateBusinessName(token, editingNameValue);
      onUpdateUser({ ...business, businessName: editingNameValue });
      setIsEditingName(false);
      toast.success('事業者名を更新しました');
    } catch {
      toast.error('更新に失敗しました');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('画像サイズは5MB以下にしてください');
      return;
    }

    setIsUploading(true);
    try {
      const profileImage = await uploadBusinessIcon(token, file);
      onUpdateUser({ ...business, profileImage });
      toast.success('アイコンを更新しました');
    } catch {
      toast.error('アイコンの更新に失敗しました');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>事業者マイページ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* アイコン設定 */}
            <div className="flex items-center space-x-4">
              <div className="relative w-24 h-24">
                {business.profileImage ? (
                  <img
                    src={business.profileImage}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover border"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center border">
                    <Building2 className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <label
                  htmlFor="icon-upload"
                  className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow cursor-pointer hover:bg-gray-100 border"
                >
                  <Upload className="w-4 h-4 text-gray-600" />
                  <input
                    id="icon-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    ref={fileInputRef}
                  />
                </label>
              </div>
              <div>
                <p className="font-semibold text-lg">{business.businessName || '事業者名未設定'}</p>
                <div className="mt-1">
                  <p className="text-sm text-gray-500">アイコンをクリックして変更</p>
                </div>
              </div>
            </div>

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
                      <Button size="sm" onClick={handleNameUpdate}>
                        保存
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingNameValue(business.businessName || '');
                          setIsEditingName(false);
                        }}
                      >
                        キャンセル
                      </Button>
                    </>
                  ) : (
                    <>
                      <p>{business.businessName}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingNameValue(business.businessName || '');
                          setIsEditingName(true);
                        }}
                      >
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
