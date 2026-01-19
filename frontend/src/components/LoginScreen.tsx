import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MapPin, Loader2, AlertCircle } from 'lucide-react';
import { exchangeGoogleTokenForJWT, storeJWT, storeUser } from '../lib/auth';

type UserRole = 'general' | 'business' | 'admin';

interface GoogleSignInResponse {
  credential: string;
}

type GoogleButtonOptions = {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  width?: string;
};

type GoogleAccountsId = {
  initialize: (args: {
    client_id: string;
    callback: (response: GoogleSignInResponse) => void;
    ux_mode?: 'popup' | 'redirect';
  }) => void;
  renderButton: (target: HTMLElement, options?: GoogleButtonOptions) => void;
};

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: GoogleAccountsId;
      };
    };
  }
}

interface LoginScreenProps {
  onLogin: (role: UserRole, googleId: string) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  // GoogleIDはフロントでは使用しないためstate管理を削除
  const [error, setError] = useState<string | null>(null);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const googleInitializedRef = useRef(false);

  // Google Identity Services スクリプトが読み込まれたかを検知
  useEffect(() => {
    const timer = setInterval(() => {
      if (window.google?.accounts?.id) {
        setGoogleReady(true);
        clearInterval(timer);
      }
    }, 200);

    return () => clearInterval(timer);
  }, []);

  // 利用規約に同意後、Google ボタンを初期化
  useEffect(() => {
    if (!agreedToTerms) return;
    if (!googleReady) return;
    if (googleInitializedRef.current) return;

    if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      setError('環境変数 VITE_GOOGLE_CLIENT_ID を設定してください');
      return;
    }

    setError(null);

    window.google?.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleGoogleSignInCallback,
      ux_mode: 'popup',
    });

    const target = googleButtonRef.current;
    if (target) {
      target.innerHTML = '';
      window.google.accounts.id.renderButton(target, {
        theme: 'outline',
        size: 'large',
        width: '100%',
      });
    }

    googleInitializedRef.current = true;
  }, [agreedToTerms, googleReady, handleGoogleSignInCallback]);

  const handleGoogleSignInCallback = useCallback(
    async (response: GoogleSignInResponse) => {
      setIsLoading(true);
      setError(null);
      try {
        if (response.credential) {
          const token = response.credential;

          // トークンをデコード（署名検証はバックエンドで行う）
          // base64url形式をbase64に正規化してからデコード
          const base64url = token.split('.')[1];
          const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(atob(base64));

          // すべての新規会員は一般会員として登録する
          const result = await exchangeGoogleTokenForJWT(token, 'general');

          storeJWT(result.jwt_token);
          storeUser(result.user);

          if (payload.sub) {
            onLogin('general', payload.sub);
          }
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'トークン取得に失敗しました';
        setError(errorMsg);
        console.error('Callback Error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [onLogin]
  );

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
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

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
                <p>本サービスはGoogle IDを利用した認証を行います。</p>
                <p>あなたの基本的なプロフィール情報（メールアドレス等）が使用されます。</p>
              </div>
            )}

            <div className="flex justify-center">
              {!agreedToTerms && (
                <Button className="w-full bg-white border-2 border-gray-300 text-gray-800" disabled>
                  利用規約に同意してください
                </Button>
              )}

              {agreedToTerms && !googleReady && (
                <Button className="w-full bg-white border-2 border-gray-300 text-gray-800" disabled>
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Google を読み込み中
                  </span>
                </Button>
              )}

              {agreedToTerms && googleReady && (
                <div ref={googleButtonRef} className="w-full flex justify-center" />
              )}
            </div>

            {isLoading && (
              <div className="flex justify-center">
                <span className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  ログイン処理中です...
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
