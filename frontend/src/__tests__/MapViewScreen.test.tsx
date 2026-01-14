import { render, screen, fireEvent } from '@testing-library/react';
import { MapViewScreen } from '../components/MapViewScreen';
import { Pin } from '../types';

// LeafletとReact-Leafletのモック化
// 地図のレンダリングをスキップし、マーカーの数やイベントだけを追えるようにします
// LeafletとReact-Leafletのモック化
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => null,
  // ★ useMapEvents を追加（何もしない関数を返す）
  useMapEvents: () => ({
    locate: jest.fn(),
  }),
  // ★ useMap も追加しておくとより安全です
  useMap: () => ({
    setView: jest.fn(),
    getZoom: () => 13,
  }),
  Marker: ({ eventHandlers, position }: any) => (
    <div 
      data-testid="map-marker" 
      onClick={eventHandlers?.click}
      onMouseOver={eventHandlers?.mouseover}
      onMouseOut={eventHandlers?.mouseout}
      data-position={JSON.stringify(position)}
    />
  ),
}));

// react-dom/server の renderToString をモック化（アイコンのHTML生成用）
jest.mock('react-dom/server', () => ({
  renderToString: (element: any) => 'mocked-icon-html',
}));

describe('MapViewScreen コンポーネント', () => {
  const mockPins: Pin[] = [
    {
      id: '1',
      latitude: 33.6071,
      longitude: 133.6823,
      genre: 'グルメ',
      userRole: 'general',
      isHot: false,
      title: 'ピン1',
    } as any,
    {
      id: '2',
      latitude: 33.6071, // ピン1と同じ座標
      longitude: 133.6823,
      genre: 'グルメ',
      userRole: 'general',
      isHot: false,
      title: 'ピン2',
    } as any,
    {
      id: '3',
      latitude: 33.7000, // 別の座標
      longitude: 133.8000,
      genre: '景色',
      userRole: 'business',
      isHot: true,
      title: 'ピン3',
    } as any,
  ];

  const mockOnPinClick = jest.fn();
  const mockOnMapDoubleClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('凡例が正しく表示されていること', () => {
    render(
      <MapViewScreen 
        pins={mockPins} 
        onPinClick={mockOnPinClick} 
        onMapDoubleClick={mockOnMapDoubleClick} 
      />
    );
    expect(screen.getByText('凡例')).toBeInTheDocument();
    expect(screen.getByText('グルメ')).toBeInTheDocument();
    expect(screen.getByText('事業者投稿')).toBeInTheDocument();
  });

  test('同じ座標のピンが正しくグループ化され、マーカーの数が集約されること', () => {
    render(
      <MapViewScreen 
        pins={mockPins} 
        onPinClick={mockOnPinClick} 
        onMapDoubleClick={mockOnMapDoubleClick} 
      />
    );

    // mockPinsは3つあるが、座標が2種類なのでマーカーは2つになるはず
    const markers = screen.getAllByTestId('map-marker');
    expect(markers).toHaveLength(2);
  });

  test('マーカーをクリックしたときに onPinClick が呼ばれること', () => {
    render(
      <MapViewScreen 
        pins={mockPins} 
        onPinClick={mockOnPinClick} 
        onMapDoubleClick={mockOnMapDoubleClick} 
      />
    );

    const markers = screen.getAllByTestId('map-marker');
    fireEvent.click(markers[0]);

    expect(mockOnPinClick).toHaveBeenCalled();
  });

  test('オーバーレイが開いているときは、地図のz-indexが調整されること', () => {
    const { container } = render(
      <MapViewScreen 
        pins={mockPins} 
        onPinClick={mockOnPinClick} 
        onMapDoubleClick={mockOnMapDoubleClick} 
        isOverlayOpen={true}
      />
    );

    // 外側のdivを取得してz-indexを確認
    const mapWrapper = container.firstChild as HTMLElement;
    expect(mapWrapper.style.zIndex).toBe('0');
  });
});