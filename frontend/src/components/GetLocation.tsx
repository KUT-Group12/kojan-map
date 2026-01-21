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

// 座標を小数点以下4桁に丸め込む
const roundCoord = (num: number): number => {
  return Math.round(num * 10000) / 10000;
};

export function GetLocation({ onLocationSelected, enabled }: GetLocationProps) {
  useMapEvents({
    dblclick(e) {
      if (!enabled) return;

      // 取得した座標
      const roundedLat = roundCoord(e.latlng.lat);
      const roundedLng = roundCoord(e.latlng.lng);

      console.log(`Rounded Location: ${roundedLat}, ${roundedLng}`);

      onLocationSelected(roundedLat, roundedLng);
    },
  });

  return null;
}
