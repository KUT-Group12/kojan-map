import { useState, useEffect, useCallback } from 'react';
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
import { Post, Place, User, Business } from '../types';
import { Loader2 } from 'lucide-react';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8080';

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
  const [detailData, setDetailData] = useState<PinDetailExtra | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userReactedPosts, setUserReactedPosts] = useState<Post[]>([]);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);

  // ユーザー専用データの取得
  const fetchUserData = useCallback(async () => {
    setIsLoadingUserData(true);
    try {
      const postsRes = await fetch(`${API_BASE_URL}/api/posts/history?googleId=${user.googleId}`);
      const postsData = await postsRes.json();
      setUserPosts(postsData.posts || []);

      const reactionsRes = await fetch(
        `${API_BASE_URL}/api/reactions/list?googleId=${user.googleId}`
      );
      const reactionsData = await reactionsRes.json();
      setUserReactedPosts(reactionsData.posts || []);
    } catch (error) {
      console.error('ユーザーデータ取得エラー:', error);
    } finally {
      setIsLoadingUserData(false);
    }
  }, [user.googleId]);

  // 初期データ（投稿と場所）の取得
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const postsRes = await fetch(`${API_BASE_URL}/api/posts`);
        const postsData = await postsRes.json();
        const rawPosts = (postsData.posts ?? []) as (Post & {
          latitude: number;
          longitude: number;
        })[];

        if (rawPosts.length === 0) return;

        const postIds = rawPosts.map((p) => p.postId).join(',');
        const scaleRes = await fetch(`${API_BASE_URL}/api/posts/pin/scales?postIds=${postIds}`);
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
            placeMap.set(dp.placeId, { ...existing, numPost: existing.numPost + 1 });
          } else {
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
          postsAtLocation: data.postsAtLocation || [],
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
    genreId: number; // 名前(string)ではなくID(number)を直接受け取る
    genreName: string; // 表示用に名前も受け取る
    genreColor: string; // 表示用に色も受け取る
    images: string[];
  }) => {
    const sharedId = Date.now();
    const existingPlace = places.find(
      (p) => p.latitude === newPost.latitude && p.longitude === newPost.longitude
    );
    const placeId = existingPlace?.placeId ?? sharedId;

    try {
      const response = await fetch(`${API_BASE_URL}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placeId,
          genreId: newPost.genreId, // モックを使わず、受け取ったIDをそのまま送る
          userId: user.googleId,
          title: newPost.title,
          text: newPost.text,
          postImage: newPost.images,
          latitude: newPost.latitude,
          longitude: newPost.longitude,
        }),
      });

      if (!response.ok) throw new Error('投稿の保存に失敗しました');
      const created = await response.json();
      const postId = created?.postId ?? sharedId;
      const resolvedPlaceId = created?.placeId ?? placeId;

      // クライアント側の表示用オブジェクト
      const post: Post = {
        postId,
        placeId: resolvedPlaceId,
        userId: user.googleId,
        postDate: new Date().toISOString(),
        title: newPost.title,
        text: newPost.text,
        postImage: newPost.images,
        numReaction: 0,
        numView: 0,
        genreId: newPost.genreId,
        genreName: newPost.genreName, // DBからきた名前を使用
        genreColor: newPost.genreColor, // DBからきた色を使用
      };

      const place: Place = {
        placeId: resolvedPlaceId,
        latitude: newPost.latitude,
        longitude: newPost.longitude,
        numPost: 1,
      };

      // ステート更新
      setPosts((prev) => [post, ...prev]);
      setPlaces((prev) => {
        if (existingPlace) {
          return prev.map((p) =>
            p.placeId === existingPlace.placeId ? { ...p, numPost: p.numPost + 1 } : p
          );
        }
        return [place, ...prev];
      });

      setFilteredPosts((prev) => [post, ...prev]);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Create post error:', error);
      alert('投稿に失敗しました。');
    }
  };

  const handleDeletePin = (postId: number) => {
    setPosts(posts.filter((p) => p.postId !== postId));
    setFilteredPosts(filteredPosts.filter((p) => p.postId !== postId));
    setSelectedPost(null);
  };

  const handleUpdateUser = (updatedUser: User | Business) => {
    onUpdateUser(updatedUser);
    if ('businessName' in updatedUser) {
      const biz = updatedUser as Business;
      const update = (list: Post[]) =>
        list.map((p) =>
          p.userId === biz.userId
            ? { ...p, businessIcon: biz.profileImage, businessName: biz.businessName }
            : p
        );
      setPosts(update(posts as DisplayPost[]));
      setFilteredPosts(update(filteredPosts as DisplayPost[]));
    }
  };

  const handleNavigate = (view: 'map' | 'mypage' | 'dashboard' | 'logout') => {
    if (currentView !== 'logout') {
      setPreviousView(currentView as 'map' | 'mypage' | 'dashboard');
    }
    setCurrentView(view);
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
              business={business}
              posts={posts}
              places={places}
              onPinClick={handlePinClick}
              onMapDoubleClick={(lat, lng) => {
                setCreateInitialLatitude(lat);
                setCreateInitialLongitude(lng);
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
          ) : isLoadingUserData ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <UserDisplayMyPage
              user={user}
              posts={userPosts}
              reactedPosts={userReactedPosts}
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
          businessData={business}
          onClose={() => setIsCreateModalOpen(false)}
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
