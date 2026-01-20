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

  // LoginScreenから渡される引数に合わせて修正
  const handleLogin = (role: UserRole, googleId: string) => {
    // バックエンドと繋がるまでは、モックデータが必要
    const userData: User = {
      googleId: googleId, // Googleから取得したIDを使用
      gmail: `${googleId}@example.com`,
      role: role,
      registrationDate: new Date().toLocaleDateString(),
    };

    if (role === 'business') {
      const mockBusiness: Business = {
        businessId: 1,
        businessName: '山田商店',
        kanaBusinessName: 'ヤマダショウテン',
        zipCode: '123-4567',
        address: '東京都渋谷区...',
        phone: 9012345678,
        registDate: new Date().toLocaleDateString(),
        userId: googleId,
        placeId: 101,
      };
      setBusiness(mockBusiness);
    } else {
      setBusiness(null);
    }

    // userDataをセットすることで、!user の条件が外れ、画面が切り替わります
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setBusiness(null);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  // 1. まだログイン（userDataの生成）ができていない場合
  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // 2. ログイン完了後：管理者の場合
  if (user.role === 'admin') {
    return (
      <>
        <AdminDashboard user={user} onLogout={handleLogout} />
        <Toaster />
      </>
    );
  }

  // 3. ログイン完了後：一般・ビジネス会員の場合
  return (
    <>
      <MainApp
        user={user}
        onLogout={handleLogout}
        onUpdateUser={handleUpdateUser}
        business={business!}
      />
      <Toaster />
    </>
  );
}
