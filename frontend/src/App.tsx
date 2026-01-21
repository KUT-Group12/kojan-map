import { useState, useEffect } from 'react';
import { LoadingScreen } from './components/LoadingScreen';
import { LoginScreen } from './components/LoginScreen';
import { MainApp } from './components/MainApp';
import { AdminDashboard } from './components/AdminDashboard';
import { Toaster } from './components/ui/sonner';
import { UserRole, User, Business } from './types';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // 引数として受け取ったデータをそのままステートにセットする
  const handleLogin = (role: UserRole, googleId: string) => {
    // 1. Userオブジェクトを組み立てる
    const userData: User = {
      googleId: googleId,
      gmail: `${googleId}@example.com`, // 便宜上のメールアドレス
      role: role,
      registrationDate: new Date().toLocaleDateString(),
    };

    // 2. ステートを更新する
    setUser(userData);

    // ビジネスロールの場合は初期状態をセット（必要に応じて）
    if (role === 'business') {
      setBusiness({
        businessId: 0, // 仮のID
        businessName: '',
        kanaBusinessName: '',
        zipCode: '',
        address: '',
        phone: '',
        registDate: new Date().toLocaleDateString(),
        userId: googleId,
        placeId: 0,
      });
    } else {
      setBusiness(null);
    }
  };

  const handleLogout = () => {
<<<<<<< HEAD
    setUser(null);
    setBusiness(null);
  };

  const handleUpdateUser = (updatedData: User | Business) => {
    if ('businessId' in updatedData) {
      setBusiness(updatedData as Business);
    } else {
      setUser(updatedData as User);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  // 1. 未ログイン時
  if (!user) {
    // LoginScreen側で「ログイン成功時にUserオブジェクトを作って渡す」ようにします
    return <LoginScreen onLogin={handleLogin} />;
  }

  // 2. 管理者画面
  if (user.role === 'admin') {
    return (
      <>
        <AdminDashboard user={user} onLogout={handleLogout} />
        <Toaster />
      </>
    );
  }

  // 3. メインアプリ（一般/事業者）
  return (
    <>
      <MainApp
        user={user}
        business={business}
        onLogout={handleLogout}
        onUpdateUser={handleUpdateUser}
      />
      <Toaster />
    </>
=======
    // ローカルストレージから JWT とユーザー情報を削除
    authLogout();
    setUser(null);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (user.role === 'admin') {
    return (
      <Suspense fallback={<div className="p-4">読み込み中...</div>}>
        <AdminDashboard user={user} onLogout={handleLogout} />
        <Toaster />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<div className="p-4">読み込み中...</div>}>
      <MainApp user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />
      <Toaster />
    </Suspense>
>>>>>>> origin/main
  );
}
