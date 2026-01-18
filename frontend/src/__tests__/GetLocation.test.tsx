import { render } from '@testing-library/react';
import { useMapEvents } from 'react-leaflet';
import { GetLocation } from '../components/GetLocation';

// react-leaflet をモック化
jest.mock('react-leaflet', () => ({
  useMapEvents: jest.fn(),
}));

describe('GetLocation コンポーネント', () => {
  const mockOnLocationSelected = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('enabledがtrueのとき、ダブルクリックで座標が丸められて呼ばれること', () => {
    let capturedEvents: any = {};

    // useMapEvents が呼ばれたときに、渡されたイベントハンドラをキャプチャする
    (useMapEvents as jest.Mock).mockImplementation((events) => {
      capturedEvents = events;
    });

    render(<GetLocation onLocationSelected={mockOnLocationSelected} enabled={true} />);

    // キャプチャした dblclick ハンドラを直接実行（Leafletの内部ズーム処理をバイパス）
    capturedEvents.dblclick({
      latlng: { lat: 35.68123456, lng: 139.76712345 },
    });

    expect(mockOnLocationSelected).toHaveBeenCalledWith(35.6812, 139.7671);
  });

  test('enabledがfalseのとき、ダブルクリックしても呼ばれないこと', () => {
    let capturedEvents: any = {};
    (useMapEvents as jest.Mock).mockImplementation((events) => {
      capturedEvents = events;
    });

    render(<GetLocation onLocationSelected={mockOnLocationSelected} enabled={false} />);

    capturedEvents.dblclick({
      latlng: { lat: 35.6812, lng: 139.7671 },
    });

    expect(mockOnLocationSelected).not.toHaveBeenCalled();
  });
});
