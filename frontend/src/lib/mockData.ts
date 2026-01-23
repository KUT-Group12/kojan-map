import { PinGenre } from '../types';

export const genreLabels: Record<PinGenre, string> = {
  food: 'グルメ',
  event: 'イベント',
  scene: '景色',
  store: 'お店',
  emergency: '緊急情報',
  other: 'その他',
};

export const genreColors: Record<PinGenre, string> = {
  food: '#EF4444', // 赤
  event: '#F59E0B', // オレンジ
  scene: '#10B981', // 緑
  store: '#3B82F6', // 青
  emergency: '#8B5CF6', // 紫
  other: '#6B7280', // グレー
};

export const GENRE_MAP: Record<PinGenre, number> = {
  food: 0,
  event: 1,
  scene: 2,
  store: 3,
  emergency: 4,
  other: 5,
};
