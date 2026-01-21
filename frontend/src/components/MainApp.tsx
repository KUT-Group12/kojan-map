import { useState, useEffect, useCallback } from 'react';
import { getStoredJWT } from '../lib/auth';
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
import { Loader2 } from 'lucide-react';

interface MainAppProps {
  user: User;
  business?: Business;
  onLogout: () => void;
  onUpdateUser: (user: User | Business) => void;
}

interface DisplayPost extends Post {
  userName?: string;
  businessName?: string;
  businessIcon?: string;
}

interface PinDetailExtra {
  isReacted: boolean;
  postsAtLocation: Post[];
}

export type PostDetail = Post & {
  latitude: number;
  longitude: number;
  pinScale?: number;
};

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
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // MainApp.tsx内で、既存のposts/placesステート付近に追加
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userReactedPosts, setUserReactedPosts] = useState<Post[]>([]);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);

  // ★追加: ユーザー専用データの取得関数
  // ★追加: ユーザー専用データの取得関数
  const fetchUserData = useCallback(async () => {
    setIsLoadingUserData(true);
    try {
      const token = getStoredJWT();
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

      const postsRes = await fetch(`${API_BASE_URL}/api/posts/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const postsData = await postsRes.json();
      setUserPosts(postsData.posts || []);

      const reactionsRes = await fetch(`${API_BASE_URL}/api/posts/history/reactions`, { // Backend reuse
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const reactionsData = await reactionsRes.json();
      setUserReactedPosts(reactionsData.posts || []);
    } catch (error) {
      console.error('ユーザーデータ取得エラー:', error);
    } finally {
      setIsLoadingUserData(false);
    }
  }, [user.googleId]); // user.googleId が変わったときだけ再生成

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const postsRes = await fetch(`/api/posts`);
        const postsData = await postsRes.json();

        const rawPosts = (postsData.posts ?? []) as (Post & {
          latitude: number;
          longitude: number;
        })[];

        if (rawPosts.length === 0) return;

        const postIds = rawPosts.map((p) => p.postId).join(',');
        const scaleRes = await fetch(`/api/posts/pin/scales?postIds=${postIds}`);
        const scaleMap: Record<number, number> = scaleRes.ok ? await scaleRes.json() : {};

        const displayPosts: PostDetail[] = rawPosts.map((p) => ({
          ...p,
          pinScale: scaleMap[p.postId] ?? 1.0,
        }));

        setPosts(displayPosts);
        setFilteredPosts(displayPosts);

        const placeMap = new Map<number, Place>();
        for (const dp of displayPosts) {
          const existing = placeMap.get(dp.placeId);
          if (existing) {
            // 既存のPlaceがあればnumPostをインクリメント
            placeMap.set(dp.placeId, { ...existing, numPost: existing.numPost + 1 });
          } else {
            // 新規Placeを作成
            placeMap.set(dp.placeId, {
              placeId: dp.placeId,
              latitude: dp.latitude,
              longitude: dp.longitude,
              numPost: 1,
            });
          }
        }
        setPlaces(Array.from(placeMap.values()));
      } catch (error) {
        console.error('データ取得失敗:', error);
      }
    };

    fetchInitialData();
  }, []);

  // ★追加: マイページを開いたときにユーザーデータを取得
  useEffect(() => {
    if (currentView === 'mypage' && user) {
      fetchUserData();
    }
  }, [currentView, user, fetchUserData]);

  const handleMapDoubleClick = (lat: number, lng: number) => {
    console.log(`緯度: ${lat}, 経度: ${lng}`);
    // 既存の関数を呼び出してモーダルを開く
    handleOpenCreateAtLocation(lat, lng);
  };

  const handlePinClick = async (post: Post) => {
    setSelectedPost(post as DisplayPost);
    setIsDetailOpen(true);
    setDetailData(null); // ローディング状態

    const relatedPlace = places.find((p) => p.placeId === post.placeId);
    if (relatedPlace) {
      setSelectedPlace(relatedPlace);
    } else {
      console.warn('対応する場所情報が見つかりませんでした。placeId:', post.placeId);
      setSelectedPlace(null);
    }

    try {
      // const apiBaseUrl = 'http://localhost:8080';
      const response = await fetch(`/api/posts/detail?postId=${post.postId}`);

      if (!response.ok) {
        throw new Error('サーバーからデータを取得できませんでした');
      }

      const data = await response.json();

      // バックエンドからの最新データをセット
      setSelectedPost(data.post || data); // レスポンス構造に応じて調整

      // 詳細データ（リアクション状態と周辺投稿）を設定
      setDetailData({
        isReacted: data.isReacted || false,
        postsAtLocation: data.postsAtLocation || [],
      });
    } catch (error) {
      console.error('詳細取得エラー:', error);
      alert('エラー：サーバーに接続できません。投稿を表示できませんでした。');

      // エラー時のフォールバック
      setDetailData({
        isReacted: reactedPosts.has(post.postId),
        postsAtLocation: posts.filter(
          (p) => p.placeId === post.placeId && p.postId !== post.postId
        ),
      });
    }
  };

  const handleOpenCreateAtLocation = (lat: number, lng: number) => {
    setCreateInitialLatitude(lat);
    setCreateInitialLongitude(lng);
    setIsCreateModalOpen(true);
  };

  const handleReaction = (postId: number) => {
    // 1. 現在の状態をチェック
    const wasReacted = reactedPosts.has(postId);
    const delta = wasReacted ? -1 : 1;

    // 2. 各ステートを関数型更新で独立に更新
    setPosts((prev) =>
      prev.map((p) => (p.postId === postId ? { ...p, numReaction: p.numReaction + delta } : p))
    );

    setFilteredPosts((prev) =>
      prev.map((p) => (p.postId === postId ? { ...p, numReaction: p.numReaction + delta } : p))
    );

    setSelectedPost((prev) =>
      prev && prev.postId === postId ? { ...prev, numReaction: prev.numReaction + delta } : prev
    );

    // 3. リアクション状態を更新
    setReactedPosts((prev) => {
      const next = new Set(prev);
      if (wasReacted) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  const handleCreatePin = (newPost: {
    latitude: number;
    longitude: number;
    title: string;
    text: string;
    genre: PinGenre;
    images: string[];
  }) => {
    // 1. 共通のIDを一度だけ生成して変数に置く (乱数生成)
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const sharedId = timestamp * 1000 + random;

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

    // 事業者会員のみ
    if ('businessName' in updatedUser) {
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
        business={business}
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
          ) : // ★変更: ローディング状態を追加し、取得したデータを渡す
            isLoadingUserData ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <UserDisplayMyPage
                user={user}
                posts={userPosts} // ★変更: MainAppで取得したデータ
                reactedPosts={userReactedPosts} // ★変更: MainAppで取得したデータ
                onPinClick={handlePinClick}
                onUpdateUser={handleUpdateUser}
                onNavigateToDeleteAccount={() => setCurrentView('deleteAccount')}
              />
            ))}

        {currentView === 'dashboard' && user.role === 'business' && business && (
          <div className="flex-1 h-full">
            <BusinessDashboard
              key={business.userId}
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

      {isDetailOpen && selectedPost && (
        <DisplayPostList
          post={selectedPost}
          place={selectedPlace || { placeId: 0, latitude: 0, longitude: 0, numPost: 0 }}
          currentUser={user}
          // detailData に値があればそれを優先し、なければ reactedPosts を参照する
          isReacted={
            detailData !== null ? detailData.isReacted : reactedPosts.has(selectedPost.postId)
          }
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedPost(null);
            setDetailData(null);
          }}
          onReaction={handleReaction}
          onDelete={handleDeletePin}
          onBlockUser={handleBlockUser}
          // detailData から周辺の投稿を渡す
          postsAtLocation={detailData?.postsAtLocation || []}
          onOpenCreateAtLocation={handleOpenCreateAtLocation}
          onSelectPin={(p) => handlePinClick(p)}
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
