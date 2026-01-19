import { useState, useEffect } from 'react';
import { LoadingScreen } from './components/LoadingScreen';
import { LoginScreen } from './components/LoginScreen';
import { MainApp } from './components/MainApp';
import { AdminDashboard } from './components/AdminDashboard';
import { Toaster } from './components/ui/sonner';
import { getStoredJWT, getStoredUser, logout as authLogout } from './lib/auth';

type UserRole = 'general' | 'business' | 'admin';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  businessName?: string;
  businessIcon?: string;
  createdAt: Date;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // 初期化：ローカルストレージから JWT とユーザー情報を復元
    const token = getStoredJWT();
    const storedUser = getStoredUser();

    if (token && storedUser) {
      // ストレージのユーザー情報を App の User 型に変換
      const appUser: User = {
        id: storedUser.id,
        email: storedUser.email,
        name: storedUser.email ? storedUser.email.split('@')[0] : 'ユーザー',
        role: storedUser.role as UserRole,
        createdAt: new Date(storedUser.createdAt),
      };
      setUser(appUser);
    }
  }, []);

  const handleLogin = () => {
    // JWT とユーザー情報は LoginScreen で既に保存済み
    const token = getStoredJWT();
    const storedUserData = getStoredUser();

    if (token && storedUserData) {
      const appUser: User = {
        id: storedUserData.id,
        email: storedUserData.email,
        name: storedUserData.email ? storedUserData.email.split('@')[0] : 'ユーザー',
        role: storedUserData.role as UserRole,
        createdAt: new Date(storedUserData.createdAt),
      };
      setUser(appUser);
    }
  };

  const handleLogout = () => {
    // ローカルストレージから JWT とユーザー情報を削除
    authLogout();
    setJwtToken(null);
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
      <>
        <AdminDashboard user={user} onLogout={handleLogout} />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <MainApp user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />
      <Toaster />
    </>
  );
}
