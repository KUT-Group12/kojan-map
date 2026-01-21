import { render } from '@testing-library/react';
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
      capturedEvents = events;
    });

    render(<GetLocation onLocationSelected={mockOnLocationSelected} enabled={true} />);
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
      capturedEvents = events;
    });

    render(<GetLocation onLocationSelected={mockOnLocationSelected} enabled={false} />);

    capturedEvents.dblclick({
      latlng: { lat: 35.0, lng: 135.0 },
    });

    // 呼ばれていないことを確認
    expect(mockOnLocationSelected).not.toHaveBeenCalled();
  });
});
