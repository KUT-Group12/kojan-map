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
export const roundCoord = (num: number): number => {
  return Math.round(num * 10000) / 10000;
};

/**
 * Handles map double-clicks to select a location on the map.
 *
 * Invokes `onLocationSelected` with the latitude and longitude rounded to four decimal places when the map is double-clicked and selection is enabled.
 *
 * @param onLocationSelected - Callback called with `(lat, lng)` when a location is selected.
 * @param enabled - When `true`, double-clicking the map triggers selection; when `false`, double-clicks are ignored.
 */
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

export const truncateCoord = (coord: number): number => {
  return Math.round(coord * 10000) / 10000;
};