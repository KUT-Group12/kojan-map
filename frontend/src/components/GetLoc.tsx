/**
 * Leafletを活用して地図を表示して座標を取得する
 * インストール方法
 * npm install react-leaflet@^4.2.1 leaflet lucide-react
 * npm install --save-dev @types/leaflet
 */

import { useMapEvents } from 'react-leaflet';

interface GetLocationProps {
  onLocationSelected: (lat: number, lng: number) => void;
  enabled: boolean;
}

export const roundCoord = (num: number): number => {
  // 10000倍して四捨五入し、10000で割ることで4桁に固定
  return Math.round(num * 10000) / 10000;
};

/**
 * 地図上での操作から座標を取得するコンポーネント
 */
export function GetLocation({ onLocationSelected, enabled }: GetLocationProps) {
  useMapEvents({
    dblclick(e) {
      // 別の画面が開いている（enabled === false）時は動作しないように制御
      if (!enabled) return;

      const roundedLat = roundCoord(e.latlng.lat);
      const roundedLng = roundCoord(e.latlng.lng);

      console.log(`Rounded Location: ${roundedLat}, ${roundedLng}`);

      // 丸めた数値を親コンポーネントに渡す
      onLocationSelected(roundedLat, roundedLng);
    },
  });

  // このコンポーネント自体は何も描画しない
  return null;
}

/**
 * 座標を丸めるなどの補助関数が必要な場合はここに定義
 */
export const truncateCoord = (coord: number): number => {
  return Math.round(coord * 10000) / 10000;
};
