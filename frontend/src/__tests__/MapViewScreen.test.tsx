import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MapViewScreen } from '../components/MapViewScreen';

// 1. LeafletとReact-Leafletをまとめてモック化
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  // useMapEvents を追加（GetLocation がこれを呼ぶため）
  useMapEvents: vi.fn(),
  Marker: ({ position, eventHandlers, icon }: any) => (
    <div
      data-testid="map-marker"
      data-position={JSON.stringify(position)}
      data-icon-html={icon?.options?.html ?? ''}
      onClick={eventHandlers?.click}
      onMouseOver={eventHandlers?.mouseover}
    >
      <div data-testid="marker-html">{icon?.options?.html ?? ''}</div>
    </div>
  ),
}));

// 2. GetLocationもモック
vi.mock('./GetLocation', () => ({
  GetLocation: () => <div data-testid="get-location" />,
}));

describe('MapViewScreen', () => {
  const mockUser = { id: 'u1', role: 'user' } as any;
  const mockPlaces = [
    { placeId: 'p1', latitude: 33.6, longitude: 133.6 },
    { placeId: 'p2', latitude: 34.0, longitude: 134.0 },
  ] as any;
  const mockPosts = [
    { postId: 1, placeId: 'p1', genreId: 1, title: 'Post 1' },
    { postId: 2, placeId: 'p1', genreId: 1, title: 'Post 2' }, // p1に2つ目の投稿
    { postId: 3, placeId: 'p2', genreId: 2, title: 'Post 3' },
  ] as any;

  const mockOnPinClick = vi.fn();
  const mockOnMapDoubleClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('凡例が正しく表示されていること', () => {
    render(
      <MapViewScreen
        user={mockUser}
        posts={mockPosts}
        places={mockPlaces}
        onPinClick={mockOnPinClick}
        onMapDoubleClick={mockOnMapDoubleClick}
      />
    );
    expect(screen.getByText('凡例')).toBeInTheDocument();
    expect(screen.getByText('グルメ')).toBeInTheDocument();
  });

  it('正しい位置にマーカーが配置され、グループ化（カウントバッジ）が機能していること', () => {
    render(
      <MapViewScreen
        user={mockUser}
        posts={mockPosts}
        places={mockPlaces}
        onPinClick={mockOnPinClick}
        onMapDoubleClick={mockOnMapDoubleClick}
      />
    );

    const markers = screen.getAllByTestId('map-marker');
    // placeId は p1, p2 の2箇所なのでマーカーは2つのはず
    expect(markers).toHaveLength(2);

    // p1のマーカー（投稿が2つある方）にはカウントバッジ "2" が表示されているか
    const markerWithCount = markers.find((m) =>
      />(\s*2\s*)</.test(m.getAttribute('data-icon-html') ?? '')
    );
    expect(markerWithCount).toBeTruthy();
    expect(markerWithCount).toHaveAttribute('data-position', JSON.stringify([33.6, 133.6]));
  });

  it('マーカーをクリックしたときに onPinClick が呼ばれること', () => {
    render(
      <MapViewScreen
        user={mockUser}
        posts={mockPosts}
        places={mockPlaces}
        onPinClick={mockOnPinClick}
        onMapDoubleClick={mockOnMapDoubleClick}
      />
    );

    const markers = screen.getAllByTestId('map-marker');
    fireEvent.click(markers[0]);

    expect(mockOnPinClick).toHaveBeenCalled();
  });

  it('事業者ユーザーの場合、アイコンが四角形（rotate-45）のスタイルになること', () => {
    const businessUser = { id: 'b1', role: 'business' } as any;
    const businessData = { profileImage: '' } as any;

    render(
      <MapViewScreen
        user={businessUser}
        business={businessData}
        posts={[mockPosts[0]]}
        places={[mockPlaces[0]]}
        onPinClick={mockOnPinClick}
        onMapDoubleClick={mockOnMapDoubleClick}
      />
    );

    // 事業者用クラス 'rotate-45' が含まれているか確認
    const marker = screen.getByTestId('map-marker');
    expect(marker.innerHTML).toContain('rotate-45');
  });
});
