import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { useState, useEffect } from 'react';
import { MapPin, User, Building2, ShieldCheck, Loader2, ScrollText } from 'lucide-react';

interface GoogleAuth {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string;
        callback: (response: { credential: string }) => void;
      }) => void;
      renderButton: (
        element: HTMLElement,
        options: { theme: string; size: string; text: string }
      ) => void;
      prompt: () => void;
    };
  };
}

declare global {
  interface Window {
    google: GoogleAuth;
  }
}

type UserRole = 'general' | 'business' | 'admin';

interface LoginScreenProps {
  onLogin: (role: UserRole, idToken: string) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSelectingRole, setIsSelectingRole] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [idToken, setIdToken] = useState<string | null>(null);

  // --- 形式的なログイン処理 (デモ用) ---
  const handleFakeLoginClick = async () => {
    if (!agreedToTerms) {
      alert('利用規約に同意してください');
      return;
    }
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIdToken('dummy_jwt_token_for_development');
    setIsSelectingRole(true);
    setIsLoading(false);
  };

  const handleRoleSelect = (role: UserRole) => {
    if (idToken) {
      onLogin(role, idToken);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">こじゃんとやまっぷ</CardTitle>
          <CardDescription>高知県香美市土佐山田町 特化型SNS</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {!isSelectingRole ? (
            <div className="space-y-4">
              {/* 利用規約エリア */}
              <div className="flex items-center space-x-2 text-gray-700 mb-1">
                <ScrollText className="w-4 h-4" />
                <span className="text-sm font-bold">利用規約</span>
              </div>
              <div className="border rounded-md bg-white p-4 h-48 overflow-y-auto text-[11px] leading-relaxed text-gray-600 shadow-inner">
                <h4 className="font-bold text-gray-900 mb-2">「こじゃんとやまっぷ」利用規約</h4>
                <section className="space-y-3">
                  <p>
                    <strong>第1条（適用）</strong>
                    <br />
                    本規約は、株式会社YHY（以下「当社」といいます）が提供する地域特化型SNS「こじゃんとやまっぷ」（以下「本サービス」といいます）の利用条件を定めるものです。ユーザーは、本規約に同意の上、Googleアカウントを用いた認証を経て本サービスを利用するものとします。
                  </p>

                  <p>
                    <strong>第2条（会員区分と登録）</strong>
                    <br />
                    1.
                    一般会員：本サービスに登録し、投稿の閲覧、匿名での投稿、リアクション等の機能を利用するユーザーを指します。
                    <br />
                    2.
                    事業者会員：当社所定の審査を経て承認され、月額の事業者登録料を支払うことで、事業者名や専用アイコンを表示した情報発信を行うユーザーを指します。
                    <br />
                    ユーザーは、本規約に同意し、Googleアカウントによる認証を行うことで会員登録を完了します。
                  </p>

                  <p>
                    <strong>第3条（事業者会員の特則）</strong>
                    <br />
                    一般会員は「マイページ」より事業者登録を申請できます。申請には事業者名、電話番号、住所の入力が必要です。事業者会員は、別途定める事業者登録料を支払うものとし、支払い状況はダッシュボードから確認できます。退会手続きを行った場合、事業者プランの解約も同時に行われます。
                  </p>

                  <p>
                    <strong>第4条（投稿および情報の取り扱い）</strong>
                    <br />
                    ユーザーは、場所情報、タイトル、説明文、写真、ジャンル（food, event, scene,
                    store, emergency,
                    other等）を投稿できます。一般会員の投稿は匿名（共通ピン）で行われますが、事業者会員の投稿には事業者名と設定したアイコンが表示されます。不適切な投稿を発見した場合、ユーザーは通報機能を利用して当社に通知することができます。
                  </p>

                  <p>
                    <strong>第5条（位置情報の利用）</strong>
                    <br />
                    本サービスは地図情報を提供するため、端末から送信される位置情報（緯度・経度）を取得し、地図上へのピン表示や距離順の並び替えに利用します。
                  </p>

                  <p>
                    <strong>第6条（禁止事項）</strong>
                    <br />
                    ユーザーは、以下の行為を行ってはなりません：虚偽の情報や不適切なコンテンツの投稿、他者のプライバシー・権利侵害、運営の妨げ、その他当社が不適切と判断する行為。
                  </p>

                  <p>
                    <strong>第7条（情報の削除および利用制限）</strong>
                    <br />
                    当社は、通報があった場合や運営上必要と判断した場合、通知なく投稿を削除できるものとします。また、ユーザーは特定のユーザーをブロックし、その投稿を非表示にできます。
                  </p>

                  <p>
                    <strong>第8条（退会）</strong>
                    <br />
                    ユーザーは、マイページの設定からいつでも退会手続きを行うことができます。退会処理が完了した時点で、会員情報はデータベースから消去されます。
                  </p>

                  <p>
                    <strong>第9条（免責事項）</strong>
                    <br />
                    当社は、情報の正確性、安全性について保証しません。利用に関連したトラブルや、システム停止による損害について、当社は一切責任を負いません。
                  </p>

                  <p>
                    <strong>第10条（規約の変更）</strong>
                    <br />
                    当社は、必要に応じて本規約を変更できるものとします。変更後の規約は、本サービス上に表示された時点から効力を生じるものとします。
                  </p>
                </section>
              </div>

              <div className="flex items-start space-x-2 bg-blue-50 p-3 rounded-md border border-blue-100 shadow-sm">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                />
                <label
                  htmlFor="terms"
                  className="text-xs leading-tight cursor-pointer text-blue-900"
                >
                  上記の利用規約をすべて読み、内容に同意します。
                </label>
              </div>

              <Button
                onClick={handleFakeLoginClick}
                className="w-full h-12 text-md font-bold"
                disabled={!agreedToTerms || isLoading}
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Googleでログイン'}
              </Button>
            </div>
          ) : (
            /* ステップ2: 役割選択画面 */
            <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
              <div className="text-center mb-4">
                <p className="text-sm font-bold text-green-600">✓ 認証成功（デモモード）</p>
                <p className="text-xs text-gray-500">アカウントの種別を選択してください</p>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  className="h-16 flex justify-start space-x-4 border-2 hover:border-blue-500 transition-all"
                  onClick={() => handleRoleSelect('general')}
                >
                  <User className="w-5 h-5 text-blue-500" />
                  <div className="text-left">
                    <div className="font-bold text-sm">一般会員として開始</div>
                    <div className="text-[10px] text-gray-400 font-normal">
                      閲覧・匿名投稿・リアクション
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-16 flex justify-start space-x-4 border-2 hover:border-purple-500 transition-all"
                  onClick={() => handleRoleSelect('business')}
                >
                  <Building2 className="w-5 h-5 text-purple-500" />
                  <div className="text-left">
                    <div className="font-bold text-sm">事業者会員として開始</div>
                    <div className="text-[10px] text-gray-400 font-normal">
                      事業者名表示・専用アイコンでの発信
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-16 flex justify-start space-x-4 border-2 hover:border-amber-500 transition-all"
                  onClick={() => handleRoleSelect('admin')}
                >
                  <ShieldCheck className="w-5 h-5 text-amber-500" />
                  <div className="text-left">
                    <div className="font-bold text-sm">システム管理者</div>
                    <div className="text-[10px] text-gray-400 font-normal">
                      運営管理・コンテンツ監視
                    </div>
                  </div>
                </Button>
              </div>

              <Button
                variant="link"
                className="w-full text-[10px] text-gray-400 mt-2"
                onClick={() => setIsSelectingRole(false)}
              >
                ← 同意画面に戻る
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
