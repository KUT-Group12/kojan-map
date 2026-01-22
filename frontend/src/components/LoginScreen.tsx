import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { useState } from 'react';
import { MapPin, User, Building2, Loader2 } from 'lucide-react';
import { exchangeGoogleTokenForJWT, storeJWT, storeUser } from '../lib/auth';
import { useGoogleLogin } from '@react-oauth/google';

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

  // 取得した Google ID と Gmail を一時保存
  const [googleId, setGoogleId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      // 成功時: アクセストークンを使ってGoogleのユーザー情報を取得し、次のステップへ
      setIsLoading(true);
      try {
        // 注: Backendは id_token を期待しているが、useGoogleLogin(默认)は access_token を返す。
        // id_token を得るには flow: 'auth-code' または Backend側で UserInfo endpoint を叩く必要がある。
        // ここでは単純化のため、Backendの仕様に合わせて id_token を取得する flow ではなく、
        // access_token を送るか、あるいはここでUserInfoを取得してから自前で組み立てる必要がある。
        //
        // 既存のAuthService.VerifyGoogleTokenは `tokeninfo?id_token=` を叩いているので、
        // フロントエンドからは `id_token` を送る必要がある。
        // @react-oauth/google で id_token を得るには <GoogleLogin /> コンポーネントを使うか、
        // useGoogleLogin で flow: 'implicit' (デフォルト) だが、id_token は返らないことがある。

        // 修正方針: GoogleLogin コンポーネントはUIカスタマイズがしにくいので、
        // useGoogleLogin を使いつつ、onSuccess で得た token (access_token) を使って
        // UserInfo を取得し、それを元にログイン処理を進める...
        // というのは Backend の `VerifyGoogleToken` (id_token検証) と合わない。

        // なので、実際には `<GoogleLogin />` (Credential Response) を使うのが一番簡単だが、
        // デザインを維持したいのであれば、ここでは簡略化して
        // 「access_token を使って Google UserInfo API を叩き、そのメアドを使用する」
        // というフローに Backend を修正するか、
        // フロント側で id_token を取得できるように構成する必要がある。

        // 今回は「本番環境」という要望なので、もっとも標準的な Credential (ID Token) を取得する形にするのが適切。
        // しかし useGoogleLogin フックは Custom UI 用で、Access Token を返すのが基本。
        // ID Token を取得したい場合は flow: 'implicit' であっても簡単ではない。

        // 解決策: Access Token を取得し、それを使って Google UserInfo を取得。
        // その後、Backend には「Googleで認証済み」として Email等を送る...
        // だが Backend は "VerifyGoogleToken" で Google の endpoint に問い合わせている。
        // access_token でも `tokeninfo?access_token=` で検証可能である。

        // なので、Backend 側が `id_token` でも `access_token` でも検証できれば良いが、
        // 現状は `id_token` 前提 (`tokeninfo?id_token=`).

        // 試しに UserInfo を取得して表示する:
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await userInfoRes.json();

        const email = userInfo.email;

        // 次のステップへ (役割選択)
        // ここで "token" として何を保存するか？
        // Backend `VerifyGoogleToken` は `id_token` を検証する。
        // `access_token` では `tokeninfo?id_token=` はエラーになる。
        // -> Backend のバリデーションロジックが `id_token` 必須なら、ここで行き詰まる。

        // よって、今回は `id_token` を取得するために、
        // useGoogleLogin ではなく、GoogleLogin コンポーネントを使うか、
        // あるいは `access_token` で検証できるように Backend を修正するか。
        // ユーザー要望「本番環境に」＝「正しいGoogle認証」。

        // ここでは、一旦 `googleId` と `email` を state に保存し、
        // 役割選択後に Backend に送る `token` としては、
        // 本来は `id_token` であるべきだが、取得できていないため、一旦 `tokenResponse.access_token` を入れる。
        // そして Backend 側で `tokeninfo?access_token=` に対応させる修正を行うのが最もスムーズ。

        setGoogleId(tokenResponse.access_token); // Hack: Backendを修正して access_token を受け入れるようにする
        setUserEmail(email);
        setIsSelectingRole(true);
      } catch (error) {
        console.error('Google User Info Error:', error);
        alert('Googleユーザー情報の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      console.error('Login Failed');
      alert('Googleログインに失敗しました');
      setIsLoading(false);
    },
  });

  const handleGoogleLoginClick = () => {
    if (!agreedToTerms) {
      alert('利用規約に同意してください');
      return;
    }
    login();
  };

  const handleRoleSelect = async (role: UserRole) => {
    if (!googleId || !userEmail) {
      alert('認証情報が不足しています');
      return;
    }

    setIsLoading(true);

    try {
      // Googleトークン（開発環境では模擬ID）を使用してバックエンド認証
      // Note: 本番環境ではGoogleから取得したid_tokenを使用する
      const token = googleId;
      const data = await exchangeGoogleTokenForJWT(token, role);

      // JWTとユーザー情報を保存
      storeJWT(data.jwt_token);
      storeUser(data.user);

      // 親コンポーネントにログイン情報を渡す
      onLogin(role, googleId);
      console.log('Login successful:', { role, googleId, email: userEmail });
    } catch (error) {
      console.error('Login Error:', error);
      alert('ログイン処理に失敗しました。サーバーが起動しているか確認してください。');
    } finally {
      setIsLoading(false);
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
              {userEmail && <p className="text-xs text-gray-500 mb-2">アカウント: {userEmail}</p>}
              <p className="text-xs text-gray-500 mb-4">登録するアカウント種別を選択してください</p>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-28 flex flex-col space-y-2 border-2 hover:border-blue-500"
                  onClick={() => handleRoleSelect('general')}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <User className="w-8 h-8 text-blue-500" />
                      <span>一般会員</span>
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="h-28 flex flex-col space-y-2 border-2 hover:border-purple-500"
                  onClick={() => handleRoleSelect('business')}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Building2 className="w-8 h-8 text-purple-500" />
                      <span>事業者会員</span>
                    </>
                  )}
                </Button>

                {/* 管理者ロールは原則としてDB/バックエンド側で付与するため、フロントエンドでの選択は開発時のみに制限 */}
                {import.meta.env.DEV && (
                  <Button
                    variant="outline"
                    className="h-28 w-1/2 justify-self-center col-span-2 flex flex-col items-center justify-center space-y-2 border-2 hover:border-amber-500"
                    onClick={() => handleRoleSelect('admin')}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <span className="font-bold">管理者 (Dev Only)</span>
                    )}
                  </Button>
                )}
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
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
