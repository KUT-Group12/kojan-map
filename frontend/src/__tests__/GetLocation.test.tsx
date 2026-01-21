import { render } from '@testing-library/react';
<<<<<<< HEAD
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetLocation } from '../components/GetLocation';
import { useMapEvents } from 'react-leaflet';

// react-leaflet をモック化する
vi.mock('react-leaflet', () => ({
  useMapEvents: vi.fn(),
}));

describe('GetLocation', () => {
  const mockOnLocationSelected = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ダブルクリックしたときに、座標が小数点4桁で丸められて呼ばれること', () => {
    // useMapEvents が呼ばれた時の「イベントハンドラ」をキャプチャする変数
    let capturedEvents: any;
    (useMapEvents as any).mockImplementation((events: any) => {
=======
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
>>>>>>> main
      capturedEvents = events;
    });

    render(<GetLocation onLocationSelected={mockOnLocationSelected} enabled={true} />);

<<<<<<< HEAD
    // 擬似的なダブルクリックイベントを実行
    // 小数点以下が長い座標を渡す
    capturedEvents.dblclick({
      latlng: { lat: 35.1234567, lng: 135.9876543 },
    });

    // 期待値: 4桁に丸められていること
    expect(mockOnLocationSelected).toHaveBeenCalledWith(35.1235, 135.9877);
  });

  it('enabled が false のときは onLocationSelected が呼ばれないこと', () => {
    let capturedEvents: any;
    (useMapEvents as any).mockImplementation((events: any) => {
=======
    // キャプチャした dblclick ハンドラを直接実行（Leafletの内部ズーム処理をバイパス）
    capturedEvents.dblclick({
      latlng: { lat: 35.68123456, lng: 139.76712345 },
    });

    expect(mockOnLocationSelected).toHaveBeenCalledWith(35.6812, 139.7671);
  });

  test('enabledがfalseのとき、ダブルクリックしても呼ばれないこと', () => {
    let capturedEvents: any = {};
    (useMapEvents as jest.Mock).mockImplementation((events) => {
>>>>>>> main
      capturedEvents = events;
    });

    render(<GetLocation onLocationSelected={mockOnLocationSelected} enabled={false} />);

    capturedEvents.dblclick({
<<<<<<< HEAD
      latlng: { lat: 35.0, lng: 135.0 },
    });

    // 呼ばれていないことを確認
=======
      latlng: { lat: 35.6812, lng: 139.7671 },
    });

>>>>>>> main
    expect(mockOnLocationSelected).not.toHaveBeenCalled();
  });
});
