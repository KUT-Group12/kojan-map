import { useState, useEffect } from 'react';
import { LoadingScreen } from './components/LoadingScreen';
import { LoginScreen } from './components/LoginScreen';
import { MainApp } from './components/MainApp';
import { AdminDashboard } from './components/AdminDashboard';
import { Toaster } from './components/ui/sonner';

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
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // ロード画面を2秒間表示
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (role: UserRole) => {
    // モックユーザーでログイン
    const mockUser: User = {
      id: `user_${Date.now()}`,
      email: 'user@example.com',
      // 一般会員はユーザー名を不要にするため空文字にする
      name: role === 'business' ? '山田商店' : role === 'admin' ? '管理者' : '',
      role,
      businessName: role === 'business' ? '山田商店' : undefined,
      businessIcon: role === 'business' ? 'https://images.unsplash.com/photo-1679050367261-d7a4a7747ef4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaG9wJTIwbG9nbyUyMGljb258ZW58MXx8fHwxNzYyMjQxOTQ0fDA&ixlib=rb-4.1.0&q=80&w=1080' : undefined,
      createdAt: new Date(),
    };
    setUser(mockUser);
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
