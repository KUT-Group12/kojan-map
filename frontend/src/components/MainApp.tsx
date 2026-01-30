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
import { Post, Place, User, Business, Genre } from '../types';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
// import { PinGenre } from '../types'

import { API_BASE_URL } from '../lib/apiBaseUrl';

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
  const [createTargetPlaceId, setCreateTargetPlaceId] = useState<number | undefined>(undefined); // ★追加
  const [currentView, setCurrentView] = useState<
    'map' | 'mypage' | 'dashboard' | 'logout' | 'deleteAccount'
  >('map');
  const [previousView, setPreviousView] = useState<'map' | 'mypage' | 'dashboard'>('map');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [reactedPosts, setReactedPosts] = useState<Set<number>>(new Set());
  const [detailData, setDetailData] = useState<PinDetailExtra | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userReactedPosts, setUserReactedPosts] = useState<Post[]>([]);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);

  // ジャンル一覧をAPIから取得
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/genres`);
        if (!res.ok) throw new Error('ジャンル取得失敗');
        const data = await res.json();
        setGenres(data.genres || []);
      } catch (e) {
        setGenres([]);
        console.error('ジャンル取得エラー:', e);
      }
    };
    fetchGenres();
  }, []);

  // ★追加: ユーザー専用データの取得関数
  const fetchUserData = useCallback(async () => {
    setIsLoadingUserData(true);
    try {
      const token = getStoredJWT();
      if (!token) {
        setUserPosts([]);
        setUserReactedPosts([]);
        return;
      }
      const API_BASE_URL =
        import.meta.env.VITE_API_URL ??
        import.meta.env.VITE_API_BASE_URL ??
        'http://127.0.0.1:8080';

      const postsRes = await fetch(`${API_BASE_URL}/api/posts/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!postsRes.ok) throw new Error('posts history fetch failed');
      const postsData = await postsRes.json();
      setUserPosts(postsData.posts || []);

      const reactionsRes = await fetch(`${API_BASE_URL}/api/posts/history/reactions`, {
        // Backend reuse
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!reactionsRes.ok) throw new Error('reactions history fetch failed');
      const reactionsData = await reactionsRes.json();
      setUserReactedPosts(reactionsData.posts || []);
    } catch (error) {
      console.error('ユーザーデータ取得エラー:', error);
    } finally {
      setIsLoadingUserData(false);
    }
  }, []);

  // 初期データ（投稿と場所）の取得
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const postsRes = await fetch(`${API_BASE_URL}/api/posts`);
        const postsData = await postsRes.json();
        const rawPosts = (postsData.posts ?? postsData ?? []) as (Post & {
          latitude: number;
          longitude: number;
        })[];

        if (rawPosts.length === 0) return;

        const placeIds = rawPosts.map((p) => p.placeId);
        let scaleMap: Record<number, number> = {};
        try {
          const scaleRes = await fetch(`${API_BASE_URL}/api/posts/pin/scales`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ placeIds }),
          });
          if (scaleRes.ok) {
            const scaleData = await scaleRes.json();
            scaleMap = scaleData.pinSizes || {};
          }
        } catch (e) {
          console.error('ピンサイズ取得失敗', e);
        }

        const displayPosts: PostDetail[] = rawPosts.map((p) => ({
          ...p,
          pinScale: scaleMap[p.postId] ?? 1.0,
        }));

        setPosts(displayPosts);
        setFilteredPosts(displayPosts);
        // postsの全placeId/緯度経度を必ずplacesに反映
        const placeMap = new Map<number, Place>();
        for (const dp of displayPosts) {
          if (
            typeof dp.placeId === 'number' &&
            typeof dp.latitude === 'number' &&
            typeof dp.longitude === 'number'
          ) {
            if (placeMap.has(dp.placeId)) {
              // 既存placeの投稿数をインクリメント
              const prev = placeMap.get(dp.placeId)!;
              placeMap.set(dp.placeId, { ...prev, numPost: prev.numPost + 1 });
            } else {
              // 新規place
              placeMap.set(dp.placeId, {
                placeId: dp.placeId,
                latitude: dp.latitude,
                longitude: dp.longitude,
                numPost: 1,
              });
            }
          }
        }
        const placesArr = Array.from(placeMap.values());
        setPlaces(placesArr);
      } catch (error) {
        console.error('データ取得失敗:', error);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (currentView === 'mypage' && user) {
      fetchUserData();
    }
  }, [currentView, user, fetchUserData]);

  const handlePinClick = async (post: Post) => {
    setSelectedPost(post as DisplayPost);
    setIsDetailOpen(true);
    setDetailData(null);

    const relatedPlace = places.find((p) => p.placeId === post.placeId);
    setSelectedPlace(relatedPlace || null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/detail?postId=${post.postId}`);
      if (!response.ok) throw new Error('詳細取得に失敗しました');
      if (response.ok) {
        const data = await response.json();
        setSelectedPost(data.post || data);
        setDetailData({
          isReacted: data.isReacted || false,
          // Backend doesn't return postsAtLocation, so compute it client-side
          postsAtLocation: posts.filter(
            (p) => p.placeId === post.placeId && p.postId !== post.postId
          ),
        });
      }
    } catch (error) {
      console.error('詳細取得エラー:', error);
      setDetailData({
        isReacted: reactedPosts.has(post.postId),
        postsAtLocation: posts.filter(
          (p) => p.placeId === post.placeId && p.postId !== post.postId
        ),
      });
    }
  };

  const handleReaction = (postId: number) => {
    const wasReacted = reactedPosts.has(postId);
    const delta = wasReacted ? -1 : 1;

    const updateList = (prev: Post[]) =>
      prev.map((p) => (p.postId === postId ? { ...p, numReaction: p.numReaction + delta } : p));

    setPosts(updateList);
    setFilteredPosts(updateList);
    setSelectedPost((prev) =>
      prev && prev.postId === postId ? { ...prev, numReaction: prev.numReaction + delta } : prev
    );

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

  // ★統合: 非同期通信を考慮した投稿処理
  const handleCreatePin = async (newPost: {
    latitude: number;
    longitude: number;
    title: string;
    text: string;
    genre: Genre;
    images: string[];
    postId?: number; // Backend ID
    placeId?: number; // Backend Place ID
  }) => {
    const { genreId, genreName, color } = newPost.genre;

    // もし引数にpostIdやplaceIdがない場合（既存コード互換など）、temporary IDを使う
    const sharedId = Date.now();
    // ★変更: createTargetPlaceId があればそれを優先 (既存ピンからの追加)
    const resolvedPlaceId = newPost.placeId ?? createTargetPlaceId ?? sharedId;
    const resolvedPostId = newPost.postId ?? sharedId;

    try {
      // クライアント側の表示用オブジェクト
      const post: Post = {
        postId: resolvedPostId,
        placeId: resolvedPlaceId,
        userId: user.googleId,
        postDate: new Date().toISOString(),
        title: newPost.title,
        text: newPost.text,
        postImage: newPost.images,
        numReaction: 0,
        numView: 0,
        genreId: genreId,
        genreName: genreName,
        genreColor: color,
      };

      const place: Place = {
        placeId: resolvedPlaceId,
        latitude: newPost.latitude,
        longitude: newPost.longitude,
        numPost: 1, // 既存ならインクリメント処理が必要だが、ここでは簡易的に1 or 更新
      };

      // ステート更新
      setPosts((prev) => {
        const next = [post, ...prev];
        return next;
      });
      setPlaces((prev) => {
        // 既存の場所があるかIDで検索
        const existingIdx = prev.findIndex((p) => p.placeId === resolvedPlaceId);
        let next;
        if (existingIdx >= 0) {
          const newPlaces = [...prev];
          newPlaces[existingIdx] = {
            ...newPlaces[existingIdx],
            latitude: place.latitude, // 必ず最新値で上書き
            longitude: place.longitude, // 必ず最新値で上書き
            numPost: newPlaces[existingIdx].numPost + 1,
          };
          next = newPlaces;
        } else {
          next = [place, ...prev];
        }
        return next;
      });
      setFilteredPosts((prev) => {
        const next = [post, ...prev];
        return next;
      });
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Create post error:', error);
      alert('投稿の表示更新に失敗しました。');
    }
  };

  const handleDeletePin = (postId: number) => {
    setPosts(posts.filter((p) => p.postId !== postId));
    setFilteredPosts(filteredPosts.filter((p) => p.postId !== postId));
    setSelectedPost(null);
  };

  const handleUpdateUser = (updatedUser: User | Business) => {
    onUpdateUser(updatedUser);
    if ('businessId' in updatedUser) {
      const bizUser = updatedUser as Business;

      const updatePins = (pinsArray: DisplayPost[]) =>
        pinsArray.map((p) =>
          p.userId === bizUser.userId
            ? {
              ...p,
              businessName: bizUser.businessName,
              // 事業者の場合は userName ではなく businessName を優先
            }
            : p
        );
      setPosts(updatePins(posts as DisplayPost[]));
      setFilteredPosts(updatePins(filteredPosts as DisplayPost[]));
    }
  };

  const handleNavigate = (view: 'map' | 'mypage' | 'dashboard' | 'logout') => {
    if (currentView !== 'logout') {
      setPreviousView(currentView as 'map' | 'mypage' | 'dashboard');
    }
    setCurrentView(view);
  };

  const handleBlockUser = (userId: string) => {
    // ユーザーをブロックした後の処理
    setPosts((prev) => prev.filter((post) => post.userId !== userId));
    setFilteredPosts((prev) => prev.filter((post) => post.userId !== userId));
    setDetailData((prev) => ({
      ...prev,
      postsAtLocation: prev?.postsAtLocation.filter((post) => post.userId !== userId) || [],
    }));
    toast.success('ユーザーをブロックしました');
  };

  return (
    <div className="h-screen flex flex-col">
      <Header
        user={user}
        business={business}
        onNavigate={handleNavigate}
        currentView={currentView}
        onContact={() => setIsContactModalOpen(true)}
      />
      <div className="flex-1 flex overflow-hidden">
        {currentView === 'map' && (
          <>
            <Sidebar
              user={user}
              posts={posts}
              onFilterChange={setFilteredPosts}
              onPinClick={handlePinClick}
            />
            <MapViewScreen
              user={user}
              posts={posts}
              places={places}
              onPinClick={handlePinClick}
              onMapDoubleClick={(lat, lng) => {
                setCreateInitialLatitude(lat);
                setCreateInitialLongitude(lng);
                setCreateTargetPlaceId(undefined); // ★追加: 新規場所なのでIDなし
                setIsCreateModalOpen(true);
              }}
            />
          </>
        )}

        {currentView === 'mypage' &&
          (user.role === 'business' && business ? (
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

        {currentView === 'dashboard' && user.role === 'business' && (
          <BusinessDashboard
            user={user}
            business={business}
            posts={posts.filter((p) => p.userId === user.googleId)}
            onPinClick={handlePinClick}
          />
        )}

        {currentView === 'logout' && (
          <LogoutScreen
            user={user}
            onBack={() => setCurrentView(previousView)}
            onLogout={onLogout}
          />
        )}
        {currentView === 'deleteAccount' && (
          <DeleteAccountScreen
            user={user}
            onBack={() => setCurrentView('mypage')}
            onDeleteAccount={onLogout}
          />
        )}
      </div>

      {isDetailOpen && selectedPost && (
        <DisplayPostList
          post={selectedPost}
          place={selectedPlace || { placeId: 0, latitude: 0, longitude: 0, numPost: 0 }}
          currentUser={user}
          isReacted={detailData?.isReacted ?? reactedPosts.has(selectedPost.postId)}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedPost(null);
          }}
          onReaction={handleReaction}
          onDelete={handleDeletePin}
          onBlockUser={handleBlockUser}
          postsAtLocation={detailData?.postsAtLocation || []}
          onOpenCreateAtLocation={(lat, lng, placeId) => {
            setCreateInitialLatitude(lat);
            setCreateInitialLongitude(lng);
            setCreateTargetPlaceId(placeId); // ★追加
            setIsCreateModalOpen(true);
          }}
          onSelectPin={handlePinClick}
        />
      )}

      {isCreateModalOpen && (
        <NewPostScreen
          user={user}
          businessData={business}
          genres={genres}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreatePin}
          initialLatitude={createInitialLatitude}
          initialLongitude={createInitialLongitude}
          targetPlaceId={createTargetPlaceId} // ★追加
        />
      )}
      {isContactModalOpen && (
        <ContactModal user={user} onClose={() => setIsContactModalOpen(false)} />
      )}
    </div>
  );
}
