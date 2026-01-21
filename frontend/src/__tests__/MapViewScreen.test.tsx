import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MapViewScreen } from '../components/MapViewScreen';
import { Post, Place, User } from '../types';

// Leafletのコンテナサイズエラーを回避するためのモック
vi.mock('react-leaflet', async () => {
  const actual = await vi.importActual('react-leaflet');
  return {
    ...actual,
    MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
    TileLayer: () => <div data-testid="tile-layer" />,
    Marker: ({ position, eventHandlers, icon }: any) => (
      <div
        data-testid="map-marker"
        data-position={JSON.stringify(position)}
        onClick={eventHandlers.click}
        onMouseOver={eventHandlers.mouseover}
        onMouseOut={eventHandlers.mouseout}
      >
        {/* L.divIconのhtmlは通常テストで直接見えないため、
            必要に応じて内部のHTML構造をシミュレート */}
        <div dangerouslySetInnerHTML={{ __html: icon.options.html }} />
      </div>
    ),
  };
});

vi.mock('../components/GetLocation', () => ({
  GetLocation: () => <div data-testid="get-location-mock" />,
}));

describe('MapViewScreen', () => {
  const mockUser: User = {
    id: 'u1',
    role: 'general',
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date(),
  };

  const mockPlaces: Place[] = [{ placeId: 10, numPost: 10, latitude: 33.6, longitude: 133.6 }];

  const mockPosts: Post[] = [
    {
      postId: 1,
      title: '地図上の投稿',
      text: '本文',
      genreId: 1,
      genreName: 'グルメ',
      genreColor: '#ff0000', // 赤色
      placeId: 10,
      userId: 'user-1',
      postDate: new Date().toISOString(),
      numReaction: 0,
      numView: 0,
    },
  ];

  const defaultProps = {
    user: mockUser,
    posts: mockPosts,
    places: mockPlaces,
    onPinClick: vi.fn(),
    onMapDoubleClick: vi.fn(),
  };

  it('地図と凡例が正しくレンダリングされること', () => {
    render(<MapViewScreen {...defaultProps} />);

    expect(screen.getByTestId('map-container')).toBeInTheDocument();
    expect(screen.getByText('ジャンル')).toBeInTheDocument();
    expect(screen.getByText('グルメ')).toBeInTheDocument();
  });

  it('DBから取得した色がピン（マーカー）に適用されていること', () => {
    render(<MapViewScreen {...defaultProps} />);

    const marker = screen.getByTestId('map-marker');

    // 修正案1: rgb 形式で探す (ブラウザ/JSDOMの挙動に合わせる)
    const iconContainer = marker.querySelector('div[style*="background-color: rgb(255, 0, 0)"]');

    // もし上記で見つからない場合は、より確実に「背景色が指定されている要素」を取得して、
    // 直接 style を検証するこの書き方が最も安全です：
    const coloredDiv = marker.querySelector('div[style*="background-color"]');
    expect(coloredDiv).toBeInTheDocument();
    expect(coloredDiv).toHaveStyle({ backgroundColor: '#ff0000' });
  });

  it('ピンをクリックしたときに onPinClick が呼ばれること', () => {
    render(<MapViewScreen {...defaultProps} />);

    const marker = screen.getByTestId('map-marker');
    fireEvent.click(marker);

    expect(defaultProps.onPinClick).toHaveBeenCalledWith(mockPosts[0]);
  });

  it('投稿が複数ある場合、カウントバッジが表示されること', () => {
    const multiPosts = [...mockPosts, { ...mockPosts[0], postId: 2, title: '2つ目の投稿' }];

    render(<MapViewScreen {...defaultProps} posts={multiPosts} />);

    // カウントバッジ "2" がHTML内に含まれているか
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('事業者ユーザーの場合、ピンの形状が異なる（rotate-45が含まれる）こと', () => {
    const businessUser: User = { ...mockUser, role: 'business' };

    render(<MapViewScreen {...defaultProps} user={businessUser} />);

    const marker = screen.getByTestId('map-marker');
    // 事業者用ピンに付与される CSS クラスを確認
    const businessPin = marker.querySelector('.rotate-45');
    expect(businessPin).toBeInTheDocument();
  });
});
