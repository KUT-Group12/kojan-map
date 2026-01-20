if (typeof window.TextEncoder === 'undefined') {
  (window as any).TextEncoder = class {
    encode() {
      return new Uint8Array();
    }
  };
  (window as any).TextDecoder = class {
    decode() {
      return '';
    }
  };
}
import { render, screen, fireEvent } from '@testing-library/react';
import { MapViewScreen } from '../components/MapViewScreen';

// 1. Leafletのタイルレイヤーや地図のサイズ計算によるエラーを回避するためのモック
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  // Marker に eventHandlers を通すように修正
  Marker: ({ children, eventHandlers }: any) => (
    <div data-testid="marker" onClick={eventHandlers?.click} onMouseOver={eventHandlers?.mouseover}>
      {children}
    </div>
  ),
  // ⚠ ここを追加：GetLocation が壊れないように空の関数（または最小限のモック）を返す
  useMapEvents: (events: any) => {
    // events.dblclick などのハンドラが渡されますが、
    // テスト中に地図のダブルクリックをシミュレートしない限り、空の関数でOKです。
    return null;
  },
}));

// 2. L.divIcon などの Leaflet 本体関数のモック
jest.mock('leaflet', () => ({
  divIcon: jest.fn(() => ({})),
  Icon: { Default: { imagePath: '' } },
}));

describe('MapViewScreen コンポーネント', () => {
  const mockUser = { role: 'general' };
  const mockPlaces = [
    { placeId: 1, latitude: 33.6, longitude: 133.6 },
    { placeId: 2, latitude: 33.7, longitude: 133.7 },
  ];
  const mockPosts = [
    { postId: 101, placeId: 1, genreId: 1, title: 'ポスト1' },
    { postId: 102, placeId: 1, genreId: 1, title: 'ポスト2（同じ場所）' },
    { postId: 103, placeId: 2, genreId: 2, title: 'ポスト3' },
  ];

  const mockOnPinClick = jest.fn();
  const mockOnMapDoubleClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('凡例が正しく表示されていること', () => {
    render(
      <MapViewScreen
        user={mockUser as any}
        posts={mockPosts as any}
        places={mockPlaces as any}
        onPinClick={mockOnPinClick}
        onMapDoubleClick={mockOnMapDoubleClick}
      />
    );

    expect(screen.getByText('凡例')).toBeInTheDocument();
    expect(screen.getByText('グルメ')).toBeInTheDocument();
    expect(screen.getByText('一般投稿')).toBeInTheDocument();
  });

  test('場所ごとにグループ化されたマーカーが描画されること', () => {
    render(
      <MapViewScreen
        user={mockUser as any}
        posts={mockPosts as any}
        places={mockPlaces as any}
        onPinClick={mockOnPinClick}
        onMapDoubleClick={mockOnMapDoubleClick}
      />
    );

    // placeId が 1 と 2 の 2箇所にピンがあるため、マーカーは2つになるはず
    const markers = screen.getAllByTestId('marker');
    expect(markers).toHaveLength(2);
  });

  test('マーカーをクリックすると onPinClick が呼ばれること', () => {
    render(
      <MapViewScreen
        user={mockUser as any}
        posts={mockPosts as any}
        places={mockPlaces as any}
        onPinClick={mockOnPinClick}
        onMapDoubleClick={mockOnMapDoubleClick}
      />
    );

    const markers = screen.getAllByTestId('marker');
    fireEvent.click(markers[0]);

    expect(mockOnPinClick).toHaveBeenCalledWith(expect.objectContaining({ placeId: 1 }));
  });

  test('事業者ユーザーの場合、事業者向けの凡例が表示されること', () => {
    const bizUser = { role: 'business' };
    render(
      <MapViewScreen
        user={bizUser as any}
        posts={mockPosts as any}
        places={mockPlaces as any}
        onPinClick={mockOnPinClick}
        onMapDoubleClick={mockOnMapDoubleClick}
        business={{ businessName: 'カフェ' } as any}
      />
    );

    expect(screen.getByText('事業者投稿')).toBeInTheDocument();
  });
});
