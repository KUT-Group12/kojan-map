import { useState } from 'react';
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
import { Pin, User } from '../types';
//import type { Pin, User, PinGenre } from '../types';

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
  // const [pins, setPins] = useState<Pin[]>(mockPins);
  // const [filteredPins, setFilteredPins] = useState<Pin[]>(mockPins);
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
  const [previousView, setPreviousView] = useState<'map' | 'mypage' | 'dashboard'>('map');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [reactedPins, setReactedPins] = useState<Set<string>>(new Set());
  // APIからのデータを保持する
  const [detailData, setDetailData] = useState<PinDetailExtra | null>(null);
  // const [isDetailOpen, setIsDetailOpen] = useState(false);
  /*
  useEffect(() => {
    const fetchPins = async () => {
      try {
        // 全ピン取得
        const response = await fetch('http://127.0.0.1:8080/api/posts');
        if (!response.ok) throw new Error('ピンの取得に失敗しました');
        const data: Pin[] = await response.json();

        // 各ピンに対して「投稿数50以上(isHot)」の状態をチェック
        const pinsWithStatus = await Promise.all(
          data.map(async (pin) => {
            try {
              const res = await fetch(`http://127.0.0.1:8080/api/posts/threshold?id=${pin.id}`);
              const thresholdData = await res.json();
              return { 
                ...pin, 
                isHot: thresholdData.isHot,
                createdAt: new Date(pin.createdAt) // 日付の変換
              };
            } catch {
              return { ...pin, createdAt: new Date(pin.createdAt) };
            }
          })
        );

        setPins(pinsWithStatus);
        setFilteredPins(pinsWithStatus);
      } catch (error) {
        console.error("Fetch pins error:", error);
        // エラー時はモックデータなどを入れる、もしくは空にする
        setPins([]);
        setFilteredPins([]);
      }
    };

    fetchPins();
  }, []);*/

  const handleMapDoubleClick = (lat: number, lng: number) => {
    console.log(`緯度: ${lat}, 経度: ${lng}`);
    // 既存の関数を呼び出してモーダルを開く
    handleOpenCreateAtLocation(lat, lng);
  };

  const handlePinClick = (pin: Pin) => {
    setSelectedPin(pin);
  };

  /* 最新版
  const handlePinClick = async (pin: Pin) => {
    try {
      const response = await fetch(`http://localhost:8080/api/posts/detail?id=${pin.id}`);
      const data = await response.json();
      
      // 3. 取得したデータをステートに入れて、パネルを開く
      setSelectedPin(data.pin); // data.pin は Go側の PinDetailResponse 構造体の中身
      setIsDetailOpen(true);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };*/

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

  const handleCreatePin = (
    newPin: Omit<
      Pin,
      | 'id'
      | 'userId'
      | 'userName'
      | 'userRole'
      | 'reactions'
      | 'createdAt'
      | 'viewCount'
      | 'businessName'
      | 'businessIcon'
    >
  ) => {
    const pin: Pin = {
      ...newPin,
      id: `pin_${Date.now()}`,
      userId: user.id,
      userName: user.role === 'business' ? user.name : '匿名',
      userRole: user.role,
      businessName: user.businessName,
      businessIcon: user.businessIcon,
      reactions: 0,
      createdAt: new Date(),
      viewCount: 0,
    };
    setPins([pin, ...pins]);
    setFilteredPins([pin, ...filteredPins]);
    setIsCreateModalOpen(false);
  };

  const handleDeletePin = (pinId: string) => {
    setPins(pins.filter((p) => p.id !== pinId));
    setFilteredPins(filteredPins.filter((p) => p.id !== pinId));
    setSelectedPin(null);
  };
  /*
  const handleCreatePin = async (newPinData: {
    latitude: number;
    longitude: number;
    title: string;
    description: string;
    genre: string;
    images: string[];
  }) => {
    try {
      // 1. GoバックエンドへPOSTリクエスト
      const response = await fetch('http://127.0.0.1:8080/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newPinData,
          // 必要に応じてユーザー情報を追加で送る場合はここに入れる
        }),
      });

      if (!response.ok) {
        throw new Error('投稿に失敗しました');
      }

      const result = await response.json(); // { status: "success", id: "..." } が返ってくる想定

      // 2. サーバーから返ってきたID等を使ってフロントエンドのStateを更新
      const pin: Pin = {
        ...newPinData,
        genre: newPinData.genre as any, // または newPinData.genre as PinGenre
        id: result.id,
        userId: user.id,
        userName: user.role === 'business' ? user.name : '匿名',
        userRole: user.role,
        businessName: user.businessName || "",
        businessIcon: user.businessIcon || "",
        reactions: 0,
        createdAt: new Date(),
        viewCount: 0,
      };

      // 画面上のピン一覧に追加
      setPins((prev) => [pin, ...prev]);
      setFilteredPins((prev) => [pin, ...prev]);
      
      // モーダルを閉じる
      setIsCreateModalOpen(false);
      setCreateInitialLatitude(undefined);
      setCreateInitialLongitude(undefined);

    } catch (error) {
      console.error("Create pin error:", error);
      // CreatePinModal側でtoastを表示させるためにerrorを再送出するか、ここでtoastを出す
      throw error; 
    }
  };*/
  /*
  const handleCreatePin = async (newPinData: {
    latitude: number;
    longitude: number;
    title: string;
    description: string;
    genre: string;
    images: string[];
  }) => {
    try {
      const response = await fetch('http://127.0.0.1:8080/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPinData),
      });

      if (!response.ok) throw new Error('投稿に失敗しました');
      const result = await response.json();

      const pin: Pin = {
        ...newPinData,
        genre: newPinData.genre as any,
        id: result.id,
        userId: user.id,
        userName: user.role === 'business' ? user.name : '匿名',
        userRole: user.role,
        businessName: user.businessName || "",
        businessIcon: user.businessIcon || "",
        reactions: 0,
        createdAt: new Date(),
        viewCount: 0,
        isHot: false, // 新規投稿はまだHotではない
      };

      setPins((prev) => [pin, ...prev]);
      setFilteredPins((prev) => [pin, ...prev]);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Create pin error:", error);
      throw error; 
    }
  };*/

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
    if (view === 'logout') {
      // ログアウト画面に遷移する前に、現在の画面を保存
      if (currentView === 'map' || currentView === 'mypage' || currentView === 'dashboard') {
        setPreviousView(currentView);
      }
    }
    setCurrentView(view);
  };

  const handleLogoutBack = () => {
    setCurrentView(previousView);
  };

  return (
    <div className="h-screen flex flex-col">
      <Header
        user={user}
        // onLogout={onLogout}
        onNavigate={handleNavigate}
        currentView={currentView}
        onContact={() => setIsContactModalOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        {currentView === 'map' && (
          <>
            <Sidebar
              user={user}
              pins={pins} // filteredPins ではなく全体を渡して Sidebar 内でフィルタリング
              onFilterChange={setFilteredPins}
              //onCreatePin={() => setIsCreateModalOpen(true)}
              onPinClick={handlePinClick}
            />
            <MapViewScreen
              pins={pins}
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

        {currentView === 'logout' && (
          <LogoutScreen user={user} onBack={handleLogoutBack} onLogout={onLogout} />
        )}

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
