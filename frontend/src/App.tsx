import { useState, lazy, Suspense } from 'react';
import { LoginScreen } from './components/LoginScreen';
const MainApp = lazy(() => import('./components/MainApp').then((m) => ({ default: m.MainApp })));
const AdminDashboard = lazy(() =>
  import('./components/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);
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
  const [user, setUser] = useState<User | null>(() => {
    // コンポーネント作成時に一度だけ実行される
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        const storedUser = JSON.parse(saved);
        return {
          ...storedUser,
          createdAt: new Date(storedUser.createdAt),
        };
      } catch (e) {
        console.error('Failed to parse user from storage', e);
        return null;
      }
    }
    return null;
  });

  const handleLogin = () => {
    // JWT とユーザー情報は LoginScreen で既に保存済み
    const token = getStoredJWT();
    const storedUserData = getStoredUser();

    if (token && storedUserData) {
      const appUser: User = {
        // id: storedUserData.id,
        id: storedUserData.googleId || storedUserData.id,
        email: storedUserData.email,
        name: storedUserData.email ? storedUserData.email.split('@')[0] : 'ユーザー',
        role: storedUserData.role as UserRole,
        businessName: storedUserData.businessName,
        businessIcon: storedUserData.businessIcon,
        createdAt: new Date(storedUserData.createdAt),
      };
      setUser(appUser);
    }
  };

  const handleLogout = () => {
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
  );
}
