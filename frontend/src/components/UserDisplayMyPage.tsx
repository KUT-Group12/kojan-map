import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { User, Post } from '../types';
import { Shield } from 'lucide-react';
import { toast } from 'sonner';
import { SelectPostHistory } from './SelectPostHistory';
import { UserReactionViewScreen } from './UserReactionViewScreen';
import { SelectUserSetting } from './SelectUserSetting';
import { UserInputBusinessApplication } from './UserInputBusinessApplication';

interface UserDisplayMyPageProps {
  user: User;
  posts: Post[];
  reactedPosts: Post[];
  onPostClick: (post: Post) => void;
  onDeletePost: (postId: number) => void;
  onUpdateUser: (user: User) => void;
  onNavigateToDeleteAccount: () => void;
}

export function UserDisplayMyPage({
  user,
  posts,
  reactedPosts,
  onPostClick,
  onDeletePost,
  onUpdateUser,
  onNavigateToDeleteAccount,
}: UserDisplayMyPageProps) {
  const [showBusinessRegistration, setShowBusinessRegistration] = useState(false);

  const handleBusinessRegistration = () => {
    toast.success('事業者登録申請を送信しました。運営からの承認をお待ちください。');
    setShowBusinessRegistration(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>マイページ</CardTitle>
            <CardDescription>アカウント情報と投稿履歴</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">ユーザー名</p>
                <p>匿名</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">メールアドレス</p>
                <p>{user.gmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">アカウント種別</p>
                <Badge variant="outline">一般</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">登録日</p>
                <p>{formatDate(user.registrationDate)}</p>
              </div>
            </div>

            {!showBusinessRegistration ? (
              <Button onClick={() => setShowBusinessRegistration(true)} variant="outline">
                <Shield className="w-4 h-4 mr-2" />
                事業者登録を申請
              </Button>
            ) : (
              <UserInputBusinessApplication
                onUpdateUser={(data) => {
                  console.log('申請データ:', data);
                  handleBusinessRegistration();
                }}
                onCancel={() => setShowBusinessRegistration(false)}
              />
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts">投稿履歴 ({posts.length})</TabsTrigger>
            <TabsTrigger value="reactions">リアクション ({reactedPosts.length})</TabsTrigger>
            <TabsTrigger value="settings">設定</TabsTrigger>
          </TabsList>

          {/* 投稿一覧 */}
          <TabsContent value="posts" className="space-y-4">
            <SelectPostHistory posts={posts} onPostClick={onPostClick} onDeletePost={onDeletePost} />
          </TabsContent>

          {/* リアクション履歴 */}
          <TabsContent value="reactions" className="space-y-4">
            <UserReactionViewScreen reactedPosts={reactedPosts} onPostClick={onPostClick} userNameMap={userNameMap} genre={currentGenre} />
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
