import { Button } from './ui/button';
import { MapPin, User as UserIcon, LogOut, LayoutDashboard, Mail } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  user: User;
  //onLogout: () => void;
  onNavigate: (view: 'map' | 'mypage' | 'dashboard' | 'logout') => void;
  currentView: 'map' | 'mypage' | 'dashboard' | 'logout' | 'deleteAccount';
  onContact: () => void;
}

export function Header({ user, onNavigate, currentView, onContact }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-gray-900">こじゃんとやまっぷ</h1>
            <p className="text-sm text-gray-600">
              {user.role === 'business' ? '事業者アカウント' : '一般アカウント'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={currentView === 'map' ? 'default' : 'outline'}
            onClick={() => onNavigate('map')}
          >
            <MapPin className="w-4 h-4 mr-2" />
            地図
          </Button>

          <Button
            variant={currentView === 'mypage' ? 'default' : 'outline'}
            onClick={() => onNavigate('mypage')}
          >
            <UserIcon className="w-4 h-4 mr-2" />
            マイページ
          </Button>

          {user.role === 'business' && (
            <Button
              variant={currentView === 'dashboard' ? 'default' : 'outline'}
              onClick={() => onNavigate('dashboard')}
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              ダッシュボード
            </Button>
          )}

          <Button variant="outline" onClick={onContact}>
            <Mail className="w-4 h-4 mr-2" />
            お問い合わせ
          </Button>

          <div className="border-l pl-2 ml-2">
            {/* 一般会員はユーザー名を表示しない */}
            {user.role !== 'general' && (
              <span className="text-sm text-gray-700 mr-3">{user.name}</span>
            )}
            <Button variant="outline" onClick={() => onNavigate('logout')}>
              <LogOut className="w-4 h-4 mr-2" />
              ログアウト
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
