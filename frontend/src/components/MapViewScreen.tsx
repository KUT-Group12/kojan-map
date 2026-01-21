import { useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Post, Place, User, Business } from '../types';
import { MapPin as MapPinIcon, Building2 } from 'lucide-react';
import { renderToString } from 'react-dom/server';
import { GetLocation } from './GetLocation';

// mockDataからのgenreColors等のインポートを削除

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

  const groupedPosts = (posts || []).reduce(
    (acc, post) => {
      const key = `${post.placeId}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(post);
      return acc;
    },
    {} as Record<string, Post[]>
  );

  const getPinSizeClass = (count: number) => {
    if (count >= 50) return 'w-12 h-12';
    if (count > 1) return 'w-11 h-11';
    return 'w-10 h-10';
  };

  const createCustomIcon = (groupPosts: Post[], isHovered: boolean) => {
    const post = groupPosts[0];
    const count = groupPosts.length;

    // --- 修正箇所: DBからきた色を直接使用 ---
    const color = post.genreColor || '#94a3b8';
    const sizeClass = getPinSizeClass(count);

    const iconHtml = renderToString(
      <div
        className={`relative transition-all duration-300 ${isHovered ? 'scale-110 -translate-y-2' : ''}`}
      >
        {user.role === 'business' ? (
          <div className="relative">
            <div
              className={`${sizeClass} transform rotate-45 shadow-2xl overflow-hidden border-4 border-white transition-all`}
              style={{ backgroundColor: color, boxShadow: `0 8px 20px -5px ${color}80` }}
            >
              <div className="transform -rotate-45 w-full h-full flex items-center justify-center">
                {business?.profileImage ? (
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
              style={{ backgroundColor: color, boxShadow: `0 8px 20px -5px ${color}80` }}
            >
              <MapPinIcon className="w-5 h-5 text-white" />
            </div>
          </div>
        )}

        {count > 1 && (
          <div className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center shadow-lg border-2 border-white z-20 text-[10px] font-black">
            {count}
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
      {/* 凡例エリア: 本来的にはここもDBから取得したリストでmap回すのが理想です */}
      <div className="absolute bottom-6 left-6 pointer-events-auto" style={{ zIndex: 999 }}>
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-4 border border-slate-200 w-40">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
            ジャンル
          </div>
          <div className="space-y-2.5">
            {/* TODO: DBからジャンルマスタを取得して、ここを動的に生成するようにすると完璧です。
              現状は代表的な色をハードコードしていますが、ピン自体はDBの色で表示されます。
            */}
            {[
              { label: 'グルメ', color: '#EF4444' },
              { label: 'イベント', color: '#F59E0B' },
              { label: '景色', color: '#10B981' },
              { label: 'お店', color: '#3B82F6' },
              { label: '緊急', color: '#8B5CF6' },
            ].map((item) => (
              <div key={item.label} className="flex items-center space-x-2.5">
                <div
                  className="w-3 h-3 rounded-full shadow-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[11px] font-bold text-slate-600">{item.label}</span>
              </div>
            ))}

            <div className="border-t border-slate-100 my-2 pt-2">
              <div className="flex items-center space-x-2.5 opacity-70">
                <div className="w-3 h-3 rounded-full bg-slate-400" />
                <span className="text-[11px] text-slate-500 font-medium">一般投稿</span>
              </div>
              <div className="flex items-center space-x-2.5 mt-1.5 opacity-70">
                <div className="w-3 h-3 rotate-45 bg-slate-400" />
                <span className="text-[11px] text-slate-500 font-medium">事業者投稿</span>
              </div>
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
      </MapContainer>
    </div>
  );
}
