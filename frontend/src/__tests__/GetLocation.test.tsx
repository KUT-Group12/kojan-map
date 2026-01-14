import { render } from '@testing-library/react';
import { GetLocation, roundCoord } from '../components/GetLocation'; // パスは適宜調整してください
import { useMapEvents } from 'react-leaflet';

// react-leaflet のフックをモック化する
jest.mock('react-leaflet', () => ({
  useMapEvents: jest.fn(),
}));

describe('GetLocation コンポーネント', () => {
  const mockOnLocationSelected = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('座標の丸め処理 (roundCoord) が正しく動作すること', () => {
    expect(roundCoord(33.559722)).toBe(33.5597);
    expect(roundCoord(133.531111)).toBe(133.5311);
    expect(roundCoord(33.5)).toBe(33.5);
  });

  test('enabledがtrueのとき、ダブルクリックで座標が渡されること', () => {
    // useMapEventsが呼ばれた際の引数（イベント設定オブジェクト）をキャプチャする
    let capturedEvents: any;
    (useMapEvents as jest.Mock).mockImplementation((events) => {
      capturedEvents = events;
    });

    render(
      <GetLocation onLocationSelected={mockOnLocationSelected} enabled={true} />
    );

    // キャプチャした dblclick イベントを擬似的に実行する
    const mockEvent = {
      latlng: { lat: 33.559722, lng: 133.531111 },
    };
    
    capturedEvents.dblclick(mockEvent);

    // 期待通りに丸められた座標でコールバックが呼ばれたか確認
    expect(mockOnLocationSelected).toHaveBeenCalledWith(33.5597, 133.5311);
  });

  test('enabledがfalseのとき、ダブルクリックしても座標が渡されないこと', () => {
    let capturedEvents: any;
    (useMapEvents as jest.Mock).mockImplementation((events) => {
      capturedEvents = events;
    });

    render(
      <GetLocation onLocationSelected={mockOnLocationSelected} enabled={false} />
    );

    const mockEvent = {
      latlng: { lat: 33.559722, lng: 133.531111 },
    };
    
    capturedEvents.dblclick(mockEvent);

    // コールバックが呼ばれていないことを確認
    expect(mockOnLocationSelected).not.toHaveBeenCalled();
  });
});