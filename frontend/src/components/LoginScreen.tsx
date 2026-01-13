import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { useState } from 'react';
import { MapPin, User, Building2, Loader2 } from 'lucide-react';

type UserRole = 'general' | 'business' | 'admin';

interface LoginScreenProps {
  // ログイン成功時に Google ID と 選択した役割 を親コンポーネントに渡す
  onLogin: (role: UserRole, googleId: string) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isSelectingRole, setIsSelectingRole] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // 取得した Google ID を一時保存
  const [googleId, setGoogleId] = useState<string | null>(null);

  const handleGoogleLoginClick = async () => {
    if (!agreedToTerms) {
      alert('利用規約に同意してください');
      return;
    }

    setIsLoading(true);
    try {
      // --- フロントエンドでの Google ID 取得処理のイメージ ---
      // const response = await window.google.accounts.id.prompt(); 
      // もしくは Firebase の場合は user.uid
      
      // デモ用：1秒後に一意の識別子を取得したと仮定
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockGoogleId = "user_google_123456789"; 
      
      setGoogleId(mockGoogleId);
      setIsSelectingRole(true); // ID取得成功後に役割選択へ
    } catch (error) {
      console.error("Auth Error:", error);
      alert("Google認証に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    if (googleId) {
      onLogin(role, googleId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <MapPin className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle>こじゃんとやまっぷ</CardTitle>
          <CardDescription>地域特化SNS</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {!isSelectingRole ? (
            /* ステップ1: 利用規約同意 & Google認証 */
            <div className="space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                />
                <label htmlFor="terms" className="text-sm leading-none cursor-pointer">
                  <button
                    type="button"
                    onClick={() => setShowTerms(!showTerms)}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    利用規約
                  </button>
                  に同意する
                </label>
              </div>

              {showTerms && (
                <div className="border rounded-lg p-4 bg-gray-50 max-h-40 overflow-y-auto text-xs text-gray-600 animate-in fade-in">
                  <p className="font-bold">【利用規約】</p>
                  <p>本サービスはGoogle IDを利用した認証を行います...</p>
                </div>
              )}

              <Button 
                onClick={handleGoogleLoginClick} 
                className="w-full"
                disabled={!agreedToTerms || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span className="flex items-center">
                    <GoogleIcon />
                    Googleでログイン
                  </span>
                )}
              </Button>
            </div>
          ) : (
            /* ステップ2: 認証済みユーザーの役割選択 */
            <div className="space-y-4 text-center animate-in slide-in-from-bottom-4 duration-500">
              <p className="text-sm font-bold text-gray-700">認証が完了しました</p>
              <p className="text-xs text-gray-500 mb-4">登録するアカウント種別を選択してください</p>
              
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="h-28 flex flex-col space-y-2 border-2 hover:border-blue-500"
                  onClick={() => handleRoleSelect('general')}
                >
                  <User className="w-8 h-8 text-blue-500" />
                  <span>一般会員</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-28 flex flex-col space-y-2 border-2 hover:border-purple-500"
                  onClick={() => handleRoleSelect('business')}
                >
                  <Building2 className="w-8 h-8 text-purple-500" />
                  <span>事業者会員</span>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// アイコンをコンポーネント化してスッキリさせる
function GoogleIcon() {
  return (
    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}