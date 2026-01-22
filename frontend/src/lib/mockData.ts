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
  food: '#ef4444',
  event: '#f59e0b',
  scene: '#10b981',
  store: '#3b82f6',
  emergency: '#ef4444',
  other: '#6b7280',
};

export const GENRE_MAP: Record<string, number> = {
  food: 1,
  event: 2,
  scene: 3,
  store: 4,
  emergency: 5,
  other: 6,
};
