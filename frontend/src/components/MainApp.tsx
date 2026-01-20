import { useState } from 'react';
import { useEffect } from 'react';
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
import { Post, Place, User, PinGenre, Business, Block } from '../types';
import { genreLabels } from '../lib/mockData';

interface MainAppProps {
  user: User;
  business?: Business;
  onLogout: () => void;
  onUpdateUser: (user: User | Business) => void;
}

export interface DisplayPost extends Post {
  userName?: string;
  businessName?: string;
  businessIcon?: string;
}

interface PinDetailExtra {
  isReacted: boolean;
  postsAtLocation: Post[];
}

export function MainApp({ user, business, onLogout, onUpdateUser }: MainAppProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<DisplayPost | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
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
  const [reactedPosts, setReactedPosts] = useState<Set<number>>(new Set());
  // APIからのデータを保持する
  const [detailData, setDetailData] = useState<PinDetailExtra | null>(null);
  // const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // 投稿一覧を取得
        //const postsRes = await fetch('http://localhost:8080/api/posts');
        // const apiBaseUrl = 'http://localhost:8080';
        const postsRes = await fetch(`/api/posts`);
        const postsData = await postsRes.json();

        const posts = postsData.posts ?? [];
        if (posts.length === 0) return;

        // 各ピンに対して投稿数50以上かをチェック
        const postsWithStatus = await Promise.all(
          posts.map(async (post: Post) => {
            try {
              // 仕様書のパスとパラメータ名に合わせる
              // placeIdでは?
              const res = await fetch(`/api/posts/pin/scale?postId=${post.postId}`);
              if (!res.ok) return post;

              const scaleData = await res.json();
              // scaleData.pinSize が 1.3 なら大きいピン、1.0 なら通常
              return {
                ...post,
                pinScale: scaleData.pinSize,
              };
            } catch (e) {
              console.log(e);
              return post;
            }
          })
        );

        setPosts(postsWithStatus);
        setFilteredPosts(postsWithStatus);
        const derivedPlaces: Place[] = postsWithStatus.map((post: Place) => ({
          placeId: post.placeId,
          latitude: post.latitude ?? 0,
          longitude: post.longitude ?? 0,
          numPost: 1,
        }));
        setPlaces(derivedPlaces);
      } catch (error) {
        console.error('データ取得失敗:', error);
      }
    };

    fetchInitialData();
  }, []);

  const handleMapDoubleClick = (lat: number, lng: number) => {
    console.log(`緯度: ${lat}, 経度: ${lng}`);
    // 既存の関数を呼び出してモーダルを開く
    handleOpenCreateAtLocation(lat, lng);
  };

  const handlePinClick = async (post: Post) => {
    setSelectedPost(post);
    const relatedPlace = places.find((p) => p.placeId === post.placeId);

    if (relatedPlace) {
      setSelectedPlace(relatedPlace);
    } else {
      // もし見つからない場合のフォールバック（デバッグ用）
      console.warn('対応する場所情報が見つかりませんでした。placeId:', post.placeId);
    } /*
    try {
      // 1. まずバックエンドに詳細データを問い合わせる
      // const response = await fetch(`http://localhost:8080/api/posts/detail?postId=${post.postId}`);
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const response = await fetch(`${apiBaseUrl}/api/posts/detail?postId=${post.postId}`);

      if (!response.ok) {
        throw new Error('サーバーからデータを取得できませんでした');
      }

      const latestPostData = await response.json();

      // 2. 通信が成功した時だけ、Stateを更新して画面を開く
      setSelectedPost(latestPostData); // サーバーからの最新データをセット

      const relatedPlace = places.find((p) => p.placeId === post.placeId);
      if (relatedPlace) {
        setSelectedPlace(relatedPlace);
      }

      // APIから取得した詳細データ（閲覧数やリアクション状態など）をセット
      setDetailData(latestPostData.extra); // 必要に応じて
    } catch (error) {
      console.error('詳細取得エラー:', error);
      // 失敗した時はトースト通知などを出し、setSelectedPost(null) のままにする（＝開かない）
      alert('エラー：サーバーに接続できません。投稿を表示できませんでした。');
    }*/
  };

  const handleOpenCreateAtLocation = (lat: number, lng: number) => {
    setCreateInitialLatitude(lat);
    setCreateInitialLongitude(lng);
    setIsCreateModalOpen(true);
  };

  const handleReaction = (postId: number) => {
    if (reactedPosts.has(postId)) {
      // リアクション取り消し
      setPosts(
        posts.map((p) => (p.postId === postId ? { ...p, numReaction: p.numReaction - 1 } : p))
      );
      setFilteredPosts(
        filteredPosts.map((p) =>
          p.postId === postId ? { ...p, numReaction: p.numReaction - 1 } : p
        )
      );
      setReactedPosts((prev) => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    } else {
      // リアクション追加
      setPosts(
        posts.map((p) => (p.postId === postId ? { ...p, numReaction: p.numReaction + 1 } : p))
      );
      setFilteredPosts(
        filteredPosts.map((p) =>
          p.postId === postId ? { ...p, numReaction: p.numReaction + 1 } : p
        )
      );
      setReactedPosts((prev) => new Set(prev).add(postId));
    }

    if (selectedPost && selectedPost.postId === postId) {
      setSelectedPost({
        ...selectedPost,
        numReaction: reactedPosts.has(postId)
          ? selectedPost.numReaction - 1
          : selectedPost.numReaction + 1,
      });
    }
  };

  const handleCreatePin = (newPost: {
    latitude: number;
    longitude: number;
    title: string;
    text: string;
    genre: PinGenre;
    images: string[];
  }) => {
    // 1. 共通のIDを一度だけ生成して変数に置く
    const sharedId = Date.now();

    const post: Post = {
      postId: sharedId,
      placeId: sharedId,
      userId: user.googleId,
      postDate: new Date().toISOString(),
      title: newPost.title,
      text: newPost.text,
      postImage: newPost.images,
      numReaction: 0,
      numView: 0,
      genreId: Math.max(0, Object.keys(genreLabels).indexOf(newPost.genre)),
    };

    const place: Place = {
      placeId: sharedId, // postと同じIDにする
      latitude: newPost.latitude,
      longitude: newPost.longitude,
      numPost: 1,
    };

    // ステート更新（すべて一度に行う）
    // setPosts([post, ...posts]);
    // setPlaces([place, ...places]);
    // setFilteredPosts([post, ...filteredPosts]);
    setPosts((prev) => [post, ...prev]);
    setPlaces((prev) => [place, ...prev]);
    setFilteredPosts((prev) => [post, ...prev]);
    setIsCreateModalOpen(false);

    setCreateInitialLatitude(undefined);
    setCreateInitialLongitude(undefined);
  };

  const handleDeletePin = (postId: number) => {
    setPosts(posts.filter((p) => p.postId !== postId));
    setFilteredPosts(filteredPosts.filter((p) => p.postId !== postId));
    setSelectedPost(null);
  };

  const handleUpdateUser = (updatedUser: User | Business) => {
    onUpdateUser(updatedUser);

    // Post[] ではなく DisplayPost[] として扱う
    if ('businessName' in updatedUser) {
      // Business型であることをTypeScriptに確信させる（型絞り込み）
      const bizUser = updatedUser;

      const updatePins = (pinsArray: DisplayPost[]) =>
        pinsArray.map((p) =>
          p.userId === bizUser.userId
            ? {
                ...p,
                businessIcon: bizUser.profileImage,
                businessName: bizUser.businessName,
                // 事業者の場合は userName ではなく businessName を優先
              }
            : p
        );

      setPosts(updatePins(posts as DisplayPost[]));
      setFilteredPosts(updatePins(filteredPosts as DisplayPost[]));

      // 選択中のピンが更新対象の事業者のものなら、その詳細表示も更新
      if (selectedPost && selectedPost.userId === bizUser.userId) {
        setSelectedPost({
          ...(selectedPost as DisplayPost),
          businessIcon: bizUser.profileImage,
          businessName: bizUser.businessName,
        });
      }
    }
  };

  const handleBlockUser = (blockUserId: string) => {
    // 1. 新しい Block オブジェクトを作成
    const userWithBlocks = user as User & { blocks?: Block[] };

    // 2. もし user オブジェクト内に blocks という名前で持たせている場合
    const currentBlocks = userWithBlocks.blocks || [];

    // 重複チェックをしてから追加
    const isAlreadyBlocked = currentBlocks.some((b: Block) => b.blockedId === blockUserId);

    if (!isAlreadyBlocked) {
      const newBlock: Block = {
        blockId: Date.now(),
        blockerId: user.googleId,
        blockedId: blockUserId,
      };

      const updatedUser = {
        ...user,
        blocks: [...currentBlocks, newBlock],
      };

      // 親の onUpdateUser に渡す
      onUpdateUser(updatedUser as User);
    }
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
              posts={posts} // filteredPins ではなく全体を渡して Sidebar 内でフィルタリング
              onFilterChange={setFilteredPosts}
              //onCreatePin={() => setIsCreateModalOpen(true)}
              onPinClick={handlePinClick}
            />
            <MapViewScreen
              user={user} // 追加
              business={business} // (businessデータがあれば渡す)
              posts={posts} // pins={posts} から修正
              places={places} // 追加
              onPinClick={handlePinClick}
              onMapDoubleClick={handleMapDoubleClick}
            />
          </>
        )}

        {currentView === 'mypage' &&
          (user.role === 'business' ? (
            <BusinessDisplayMyPage
              user={user}
              business={business}
              posts={posts.filter((p) => p.userId === user.googleId)}
              onPinClick={handlePinClick}
              onDeletePin={handleDeletePin}
              onUpdateUser={handleUpdateUser}
              onNavigateToDeleteAccount={() => setCurrentView('deleteAccount')}
            />
          ) : (
            <UserDisplayMyPage
              user={user}
              posts={posts.filter((p) => p.userId === user.googleId)}
              reactedPosts={Array.from(reactedPosts)
                .map((id) => posts.find((p) => p.postId === id)!)
                .filter(Boolean)}
              onPinClick={handlePinClick}
              onUpdateUser={handleUpdateUser}
              onNavigateToDeleteAccount={() => setCurrentView('deleteAccount')}
            />
          ))}

        {currentView === 'dashboard' && user.role === 'business' && (
          <div className="flex-1 h-full">
            <BusinessDashboard
              user={user}
              business={business}
              posts={posts.filter((p) => p.userId === user.googleId)}
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

      {selectedPost && (
        <DisplayPostList
          post={selectedPost}
          place={selectedPlace || { placeId: 0, latitude: 0, longitude: 0, numPost: 0 }}
          currentUser={user}
          // APIからのデータを優先し、なければフロントの状態を使う
          isReacted={detailData ? detailData.isReacted : reactedPosts.has(selectedPost.postId)}
          onClose={() => {
            setSelectedPost(null);
            setSelectedPlace(null);
            setDetailData(null);
          }}
          onReaction={handleReaction}
          onDelete={handleDeletePin}
          onBlockUser={handleBlockUser}
          // APIから取得した周辺情報を渡す
          postsAtLocation={detailData?.postsAtLocation || []}
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
