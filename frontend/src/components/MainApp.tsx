import { useState, useEffect } from 'react';
import { Header } from './Header';
import { MapViewScreen } from './MapViewScreen';
import { Sidebar } from './Sidebar';
import { DisplayPostList } from './DisplayPostList';
import { NewPostScreen } from './NewPostScreen';
import { UserDisplayMyPage } from './UserDisplayMyPage';
import { BusinessDisplayMyPage } from './BusinessDisplayMyPage';
import { BusinessDashboard } from './BusinessDashboard';
import { ContactModal } from './ContactModal';
import { DeleteAccountScreen } from './DeleteAccountScreen';
import { LogoutScreen } from './LogoutScreen';
import { Pin, User, PinGenre } from '../types';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8080';

interface MainAppProps {
  user: User;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
}

interface PinDetailExtra {
  isReacted: boolean;
  pinsAtLocation: Pin[];
}

export function MainApp({ user, onLogout, onUpdateUser }: MainAppProps) {
  const [pins, setPins] = useState<Pin[]>([]);
  const [filteredPins, setFilteredPins] = useState<Pin[]>([]);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createInitialLatitude, setCreateInitialLatitude] = useState<number | undefined>(undefined);
  const [createInitialLongitude, setCreateInitialLongitude] = useState<number | undefined>(
    undefined
  );
  const [currentView, setCurrentView] = useState<
    'map' | 'mypage' | 'dashboard' | 'logout' | 'deleteAccount'
  >('map');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [reactedPins, setReactedPins] = useState<Set<string>>(new Set());
  // APIからのデータを保持する
  const [detailData, setDetailData] = useState<PinDetailExtra | null>(null);

  useEffect(() => {
    const fetchPins = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/posts`);
        if (!response.ok) throw new Error('ピンの取得に失敗しました');
        const data: Pin[] = await response.json();

        // 1回のレスポンスに含まれるフィールドをそのまま利用（N+1回の /threshold 呼び出しを削除）
        const normalizedPins = data.map((pin) => ({
          ...pin,
          createdAt: new Date(pin.createdAt),
          isHot: pin.isHot ?? false,
        }));

        setPins(normalizedPins);
        setFilteredPins(normalizedPins);
      } catch (error) {
        console.error('Fetch pins error:', error);
        // エラー時はモックデータなどを入れる、もしくは空にする
        setPins([]);
        setFilteredPins([]);
      }
    };

    fetchPins();
  }, []);

  const handleMapDoubleClick = (lat: number, lng: number) => {
    console.log(`緯度: ${lat}, 経度: ${lng}`);
    // 既存の関数を呼び出してモーダルを開く
    handleOpenCreateAtLocation(lat, lng);
  };

  const handlePinClick = async (pin: Pin) => {
    setSelectedPin(pin);
    setDetailData(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/detail?id=${pin.id}`);
      if (!response.ok) throw new Error('詳細の取得に失敗しました');

      const data = await response.json();
      if (!data?.pin) throw new Error('詳細データが不正です');

      // 取得したデータを正規化して設定
      const normalizedPin: Pin = {
        ...data.pin,
        createdAt: new Date(data.pin.createdAt),
      };
      setSelectedPin(normalizedPin);
      setDetailData({
        isReacted: data.isReacted ?? reactedPins.has(pin.id),
        pinsAtLocation: (data.pinsAtLocation ?? []).map((p: Pin) => ({
          ...p,
          createdAt: new Date(p.createdAt),
        })),
      });
      // 詳細パネルはselectedPinの有無で制御するため、フラグは不要
    } catch (error) {
      console.error('Fetch error:', error);
      setDetailData(null);
    }
  };

  const handleOpenCreateAtLocation = (lat: number, lng: number) => {
    setCreateInitialLatitude(lat);
    setCreateInitialLongitude(lng);
    setIsCreateModalOpen(true);
  };

  const handleReaction = (pinId: string) => {
    if (reactedPins.has(pinId)) {
      // リアクション取り消し
      setPins(pins.map((p) => (p.id === pinId ? { ...p, reactions: p.reactions - 1 } : p)));
      setFilteredPins(
        filteredPins.map((p) => (p.id === pinId ? { ...p, reactions: p.reactions - 1 } : p))
      );
      setReactedPins((prev) => {
        const next = new Set(prev);
        next.delete(pinId);
        return next;
      });
    } else {
      // リアクション追加
      setPins(pins.map((p) => (p.id === pinId ? { ...p, reactions: p.reactions + 1 } : p)));
      setFilteredPins(
        filteredPins.map((p) => (p.id === pinId ? { ...p, reactions: p.reactions + 1 } : p))
      );
      setReactedPins((prev) => new Set(prev).add(pinId));
    }

    if (selectedPin && selectedPin.id === pinId) {
      setSelectedPin({
        ...selectedPin,
        reactions: reactedPins.has(pinId) ? selectedPin.reactions - 1 : selectedPin.reactions + 1,
      });
    }
  };

  const handleDeletePin = (pinId: string) => {
    setPins(pins.filter((p) => p.id !== pinId));
    setFilteredPins(filteredPins.filter((p) => p.id !== pinId));
    setSelectedPin(null);
  };

  const handleCreatePin = async (newPinData: {
    latitude: number;
    longitude: number;
    title: string;
    description: string;
    genre: string;
    images: string[];
  }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPinData),
      });

      if (!response.ok) throw new Error('投稿に失敗しました');
      const result = await response.json();

      const pin: Pin = {
        latitude: newPinData.latitude,
        longitude: newPinData.longitude,
        title: newPinData.title,
        description: newPinData.description,
        genre: newPinData.genre as PinGenre,
        images: newPinData.images,
        id: result.id,
        userId: user.id,
        userName: user.role === 'business' ? user.name : '匿名',
        userRole: user.role,
        businessName: user.businessName || '',
        businessIcon: user.businessIcon || '',
        reactions: 0,
        createdAt: new Date(),
        viewCount: 0,
        isHot: false,
      };

      setPins((prev) => [pin, ...prev]);
      setFilteredPins((prev) => [pin, ...prev]);
      setIsCreateModalOpen(false);
      setCreateInitialLatitude(undefined);
      setCreateInitialLongitude(undefined);
    } catch (error) {
      console.error('Create pin error:', error);
      throw error;
    }
  };

  const handleUpdateUser = (updatedUser: User) => {
    // Appレベルのユーザー情報を更新
    onUpdateUser(updatedUser);

    // 既存のピンも更新（名前／事業者名／アイコン）
    const updatePins = (pinsArray: Pin[]) =>
      pinsArray.map((p) =>
        p.userId === updatedUser.id
          ? {
              ...p,
              businessIcon: updatedUser.businessIcon,
              businessName: updatedUser.businessName,
              userName: updatedUser.name,
            }
          : p
      );

    setPins(updatePins(pins));
    setFilteredPins(updatePins(filteredPins));

    if (selectedPin && selectedPin.userId === updatedUser.id) {
      setSelectedPin({
        ...selectedPin,
        businessIcon: updatedUser.businessIcon,
        businessName: updatedUser.businessName,
        userName: updatedUser.name,
      });
    }
  };

  const handleBlockUser = (blockUserId: string) => {
    const nextBlocked = Array.from(new Set([...(user.blockedUsers || []), blockUserId]));
    const updatedUser: User = { ...user, blockedUsers: nextBlocked };
    onUpdateUser(updatedUser);
  };

  const handleNavigate = (view: 'map' | 'mypage' | 'dashboard' | 'logout') => {
    setCurrentView(view);
  };

  return (
    <div className="h-screen flex flex-col">
      <Header
        user={user}
        onNavigate={handleNavigate}
        currentView={currentView}
        onContact={() => setIsContactModalOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        {currentView === 'map' && (
          <>
            <Sidebar
              user={user}
              pins={pins}
              onFilterChange={setFilteredPins}
              onCreatePin={() => setIsCreateModalOpen(true)}
              onPinClick={handlePinClick}
            />
            <MapViewScreen
              pins={filteredPins}
              onPinClick={handlePinClick}
              onMapDoubleClick={handleMapDoubleClick}
            />
          </>
        )}

        {currentView === 'mypage' &&
          (user.role === 'business' ? (
            <BusinessDisplayMyPage
              user={user}
              pins={pins.filter((p) => p.userId === user.id)}
              onPinClick={handlePinClick}
              onDeletePin={handleDeletePin}
              onUpdateUser={handleUpdateUser}
              onNavigateToDeleteAccount={() => setCurrentView('deleteAccount')}
            />
          ) : (
            <UserDisplayMyPage
              user={user}
              pins={pins.filter((p) => p.userId === user.id)}
              reactedPins={Array.from(reactedPins)
                .map((id) => pins.find((p) => p.id === id)!)
                .filter(Boolean)}
              onPinClick={handlePinClick}
              onDeletePin={handleDeletePin}
              onUpdateUser={handleUpdateUser}
              onNavigateToDeleteAccount={() => setCurrentView('deleteAccount')}
            />
          ))}

        {currentView === 'dashboard' && user.role === 'business' && (
          <div className="flex-1 h-full">
            <BusinessDashboard
              user={user}
              pins={pins.filter((p) => p.userId === user.id)}
              onPinClick={handlePinClick}
            />
          </div>
        )}

        {currentView === 'logout' && <LogoutScreen user={user} onLogout={onLogout} />}

        {currentView === 'deleteAccount' && (
          <DeleteAccountScreen
            user={user}
            onBack={() => setCurrentView('mypage')}
            onDeleteAccount={onLogout}
          />
        )}
      </div>
      {/*
      {selectedPin && (
        <PinDetailModal
          pin={selectedPin}
          currentUser={user}
          isReacted={reactedPins.has(selectedPin.id)}
          onClose={() => setSelectedPin(null)}
          onReaction={handleReaction}
          onDelete={handleDeletePin}
            onBlockUser={handleBlockUser}
            pinsAtLocation={pins.filter(p => Math.abs(p.latitude - selectedPin.latitude) < 0.0001 && Math.abs(p.longitude - selectedPin.longitude) < 0.0001)}
            onOpenCreateAtLocation={handleOpenCreateAtLocation}
        />
      )}*/}

      {selectedPin && (
        <DisplayPostList
          pin={selectedPin}
          currentUser={user}
          // APIからのデータを優先し、なければフロントの状態を使う
          isReacted={detailData ? detailData.isReacted : reactedPins.has(selectedPin.id)}
          onClose={() => {
            setSelectedPin(null);
            setDetailData(null);
          }}
          onReaction={handleReaction}
          onDelete={handleDeletePin}
          onBlockUser={handleBlockUser}
          // APIから取得した周辺情報を渡す
          pinsAtLocation={detailData?.pinsAtLocation || []}
          onOpenCreateAtLocation={(lat, lng) => {
            setCreateInitialLatitude(lat);
            setCreateInitialLongitude(lng);
            setIsCreateModalOpen(true);
          }}
          onSelectPin={handlePinClick}
        />
      )}

      {isCreateModalOpen && (
        <NewPostScreen
          user={user}
          onClose={() => {
            setIsCreateModalOpen(false);
            setCreateInitialLatitude(undefined);
            setCreateInitialLongitude(undefined);
          }}
          onCreate={handleCreatePin}
          initialLatitude={createInitialLatitude}
          initialLongitude={createInitialLongitude}
        />
      )}

      {isContactModalOpen && (
        <ContactModal user={user} onClose={() => setIsContactModalOpen(false)} />
      )}
    </div>
  );
}
