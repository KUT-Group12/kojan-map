import { useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Post, Place, User, Business } from '../types';
// import { genreColors, genreLabels } from '../lib/mockData';
import { genreColors, genreLabels, GENRE_MAP } from '../lib/mockData';
import { MapPin as MapPinIcon, Building2 } from 'lucide-react';
import { renderToString } from 'react-dom/server';
import { GetLocation } from './GetLocation';

interface MapViewProps {
  user: User;
  business?: Business;
  posts: Post[];
  places: Place[];
  onPinClick: (post: Post) => void;
  onMapDoubleClick: (lat: number, lng: number) => void;
  isOverlayOpen?: boolean;
}

export function MapViewScreen({
  user,
  business,
  posts,
  places,
  onPinClick,
  onMapDoubleClick,
  isOverlayOpen,
}: MapViewProps) {
  const [hoveredPostId, setHoveredPostId] = useState<number | null>(null);

  // 1. 同じ位置のピンをグループ化するロジックを統合
<<<<<<< HEAD
  const groupedPosts = (posts || []).reduce(
    (acc, post) => {
      const key = `${post.placeId}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(post);
      return acc;
    },
    {} as Record<string, Post[]>
=======
  const groupedPins = pins.reduce(
    (acc, pin) => {
      const key = `${pin.latitude.toFixed(4)}_${pin.longitude.toFixed(4)}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(pin);
      return acc;
    },
    {} as Record<string, Pin[]>
>>>>>>> origin/main
  );

  // 2. ピンのサイズ決定ロジック
  const getPinSizeClass = (count: number) => {
    if (count >= 50) return 'w-12 h-12';
    if (count > 1) return 'w-11 h-11';
    return 'w-10 h-10';
  };

  const createCustomIcon = (groupPosts: Post[], isHovered: boolean) => {
    const post = groupPosts[0];
    const count = groupPosts.length;
    // const genreKeys = Object.keys(genreLabels);
    // const genreKey = genreKeys[post.genreId] || 'other';
    const genreKey =
      (Object.entries(GENRE_MAP).find(([, id]) => id === post.genreId)?.[0] as
        | keyof typeof genreLabels
        | undefined) ?? 'other';
    const color = genreColors[genreKey] || '#94a3b8';
    const sizeClass = getPinSizeClass(count);

    const iconHtml = renderToString(
      <div
        className={`relative transition-all duration-300 ${isHovered ? 'scale-110 -translate-y-2' : ''}`}
      >
        {/* ピン本体の描画 */}
        {user.role === 'business' ? (
          <div className="relative">
            <div
              className={`${sizeClass} transform rotate-45 shadow-2xl overflow-hidden border-4 border-white transition-all`}
              style={{ backgroundColor: color, boxShadow: `0 10px 25px -5px ${color}50` }}
            >
              <div className="transform -rotate-45 w-full h-full flex items-center justify-center">
                {business.profileImage ? (
                  <img src={business.profileImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-5 h-5 text-white" />
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div
              className={`${sizeClass} rounded-full shadow-2xl flex items-center justify-center transition-all border-4 border-white relative`}
              style={{ backgroundColor: color, boxShadow: `0 10px 25px -5px ${color}50` }}
            >
              <MapPinIcon className="w-5 h-5 text-white" />
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent 60%)`,
                }}
              />
            </div>
          </div>
        )}

        {/* 3. カウントバッジ */}
        {count > 1 && (
          <div className="absolute -top-2 -right-2 bg-gradient-to-br from-red-500 to-pink-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg border-2 border-white z-20">
            <span className="text-[10px] font-bold">{count}</span>
          </div>
        )}
      </div>
    );

    return L.divIcon({
      html: iconHtml,
      className: '',
      iconSize: [44, 44],
      iconAnchor: [22, 44],
    });
  };

  return (
    <div className="flex-1 w-full h-full relative" style={{ zIndex: isOverlayOpen ? 0 : 10 }}>
      {/* 凡例 (変更なし) */}
      <div
        className="absolute bottom-6 left-6 pointer-events-auto"
        style={{ zIndex: 99999 }} // Leafletの全レイヤー(最大1000程度)より上に配置
      >
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-4 border border-white/50">
          <div className="text-xs text-slate-700 mb-3 font-bold">凡例</div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center space-x-3">
              <div
                className="w-6 h-6 rounded-full shadow-md"
                style={{ backgroundColor: '#EF4444' }}
              />
              <span className="text-slate-700">グルメ</span>
            </div>
            <div className="flex items-center space-x-3">
              <div
                className="w-6 h-6 rounded-full shadow-md"
                style={{ backgroundColor: '#F59E0B' }}
              />
              <span className="text-slate-700">イベント</span>
            </div>
            <div className="flex items-center space-x-3">
              <div
                className="w-6 h-6 rounded-full shadow-md"
                style={{ backgroundColor: '#10B981' }}
              />
              <span className="text-slate-700">景色</span>
            </div>
            <div className="flex items-center space-x-3">
              <div
                className="w-6 h-6 rounded-full shadow-md"
                style={{ backgroundColor: '#3B82F6' }}
              />
              <span className="text-slate-700">お店</span>
            </div>
            <div className="flex items-center space-x-3">
              <div
                className="w-6 h-6 rounded-full shadow-md"
                style={{ backgroundColor: '#8B5CF6' }}
              />
              <span className="text-slate-700">緊急情報</span>
            </div>
            <div className="border-t border-slate-300 my-2" />
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 rounded-full shadow-md bg-blue-500 border-2 border-white flex items-center justify-center">
                <MapPinIcon className="w-3 h-3 text-white" />
              </div>
              <span className="text-slate-700">一般投稿</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 transform rotate-45 shadow-md bg-blue-500 border-2 border-white" />
              <span className="text-slate-700">事業者投稿</span>
            </div>
          </div>
        </div>
      </div>

      <MapContainer
        center={[33.6071, 133.6823]}
        zoom={17}
        style={{ height: '100%', width: '100%' }}
        doubleClickZoom={false}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <GetLocation onLocationSelected={onMapDoubleClick} enabled={!isOverlayOpen} />

        {/* 5. グループ化したピンをマーカーとして描画 */}
<<<<<<< HEAD
        {Object.entries(groupedPosts).map(([key, groupPosts]) => {
          const place = places.find((p) => p.placeId === groupPosts[0].placeId);
          if (!place) return null;

          return (
            <Marker
              key={key}
              position={[place.latitude, place.longitude]}
              icon={createCustomIcon(groupPosts, hoveredPostId === groupPosts[0].postId)}
              eventHandlers={{
                click: () => onPinClick(groupPosts[0]),
                mouseover: () => setHoveredPostId(groupPosts[0].postId),
                mouseout: () => setHoveredPostId(null),
              }}
            />
          );
        })}
=======
        {Object.entries(groupedPins).map(([key, groupPins]) => (
          <Marker
            key={key}
            position={[groupPins[0].latitude, groupPins[0].longitude]}
            icon={createCustomIcon(groupPins, hoveredPinId === key)}
            eventHandlers={{
              click: () => onPinClick(groupPins[0]),
              mouseover: () => setHoveredPinId(key),
              mouseout: () => setHoveredPinId(null),
            }}
          />
        ))}
>>>>>>> origin/main
      </MapContainer>
    </div>
  );
}
