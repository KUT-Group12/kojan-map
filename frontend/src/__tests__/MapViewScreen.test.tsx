import { render, screen, fireEvent } from '@testing-library/react';
import { MapViewScreen } from '../components/MapViewScreen';
import { Pin } from '../types';
import { mockPins } from '../lib/mockData';

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
  // 集約テスト用にカスタマイズしたmockPinsを作成（同じ座標のピンを含む）
  const testMockPins: Pin[] = [
    mockPins[0], // 最初のピン
    {
      ...mockPins[1],
      latitude: mockPins[0].latitude, // 最初のピンと同じ座標に変更
      longitude: mockPins[0].longitude,
      id: 'pin-same-location',
      title: 'ピン2',
    },
    mockPins[2], // 別の座標のピン
  ];

  const mockOnPinClick = jest.fn();
  const mockOnMapDoubleClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('凡例が正しく表示されていること', () => {
    render(
      <MapViewScreen 
        pins={testMockPins} 
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
        pins={testMockPins} 
        onPinClick={mockOnPinClick} 
        onMapDoubleClick={mockOnMapDoubleClick} 
      />
    );

    // testMockPinsは3つあるが、座標が2種類なのでマーカーは2つになるはず
    const markers = screen.getAllByTestId('map-marker');
    expect(markers).toHaveLength(2);
  });

  test('マーカーをクリックしたときに onPinClick が呼ばれること', () => {
    render(
      <MapViewScreen 
        pins={testMockPins} 
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
        pins={testMockPins} 
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