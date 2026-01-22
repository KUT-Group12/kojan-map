import { useState, useEffect } from 'react';
import { LoadingScreen } from './components/LoadingScreen';
import { LoginScreen } from './components/LoginScreen';
import { MainApp } from './components/MainApp';
import { AdminDashboard } from './components/AdminDashboard';
import { Toaster } from './components/ui/sonner';
import { UserRole, User, Business } from './types';
import { getStoredUser } from './lib/auth';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = getStoredUser();
    if (!storedUser) return null;

    const googleId = storedUser.googleId || storedUser.id;
    return {
      googleId,
      gmail: storedUser.email,
      role: storedUser.role,
      registrationDate: storedUser.createdAt,
    };
  });

  const [business, setBusiness] = useState<Business | null>(() => {
    const storedUser = getStoredUser();
    if (!storedUser) return null;
    if (storedUser.role !== 'business') return null;

    const googleId = storedUser.googleId || storedUser.id;
    return {
      businessId: 0,
      businessName: storedUser.businessName || '',
      kanaBusinessName: '',
      zipCode: '',
      address: '',
      phone: '',
      registDate: storedUser.createdAt,
      userId: googleId,
      placeId: 0,
      profileImage: storedUser.businessIcon,
    };
  });

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
  );
}
