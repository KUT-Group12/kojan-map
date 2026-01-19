import { useState, useEffect } from 'react';
import { LoadingScreen } from './components/LoadingScreen';
import { LoginScreen } from './components/LoginScreen';
import { MainApp } from './components/MainApp';
import { AdminDashboard } from './components/AdminDashboard';
import { Toaster } from './components/ui/sonner';
import { UserRole, User } from './types';
/*
type UserRole = 'general' | 'business' | 'admin';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  businessName?: string;
  businessIcon?: string;
  createdAt: Date;
}*/

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

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
      gmail: `${googleId}@example.com`, // 本来はGoogleから取得するが、今は仮のメール
      // name: role === 'business' ? '山田商店' : role === 'admin' ? '管理者' : '一般ユーザー',
      role: role,
      // businessName: role === 'business' ? '山田商店' : undefined,
      // businessIcon:
      // role === 'business'
      // ? 'https://images.unsplash.com/photo-1679050367261-d7a4a7747ef4?w=100'
      // : undefined,
      registrationDate: new Date().toLocaleDateString(),
    };

    // userDataをセットすることで、!user の条件が外れ、画面が切り替わります
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
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
      <MainApp user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />
      <Toaster />
    </>
  );
}
