import { PinGenre } from '../types';

export const GENRE_MAP: Record<PinGenre, number> = {
  food: 0,
  event: 1,
  scene: 2,
  store: 3,
  emergency: 4,
  other: 5,
};

/*
export const GENRE_MAP: Record<PinGenre, number> = {
  food: 0,
  event: 1,
  scene: 2,
  store: 3,
  emergency: 4,
  other: 5,
};*/

/*
export const genreColors: Record<PinGenre, string> = {
  food: '#EF4444', // 赤
  event: '#F59E0B', // オレンジ
  scene: '#10B981', // 緑
  store: '#3B82F6', // 青
  emergency: '#8B5CF6', // 紫
  other: '#6B7280', // グレー
};*/

export const genreLabels: Record<PinGenre, string> = {
  food: 'グルメ',
  event: 'イベント',
  scene: '景色',
  store: 'お店',
  emergency: '緊急情報',
  other: 'その他',
};

// モックピンデータ
/*
export const mockPins: Post[] = [
  {
    id: 'pin1',
    userId: 'user1',
    userName: '匿名',
    userRole: 'general',
    latitude: 33.6762,
    longitude: 133.6503,
    title: '美味しいラーメン店発見！',
    description: '駅近くに新しくできたラーメン店。味噌ラーメンがとても美味しかったです！',
    genre: 'food',
    images: [],
    reactions: 24,
    createdAt: new Date('2025-11-03T10:30:00'),
    viewCount: 145,
  },
  {
    id: 'pin2',
    userId: 'business1',
    userName: '山田商店',
    userRole: 'business',
    businessName: '山田商店',
    businessIcon:
      'https://images.unsplash.com/photo-1679050367261-d7a4a7747ef4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaG9wJTIwbG9nbyUyMGljb258ZW58MXx8fHwxNzYyMjQxOTQ0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    latitude: 33.6712,
    longitude: 133.6553,
    title: '週末セール開催中！',
    description: '今週末限定で全商品20%オフ！ぜひお越しください。',
    genre: 'shop',
    images: [],
    reactions: 67,
    createdAt: new Date('2025-11-02T09:00:00'),
    viewCount: 289,
  },
  {
    id: 'pin3',
    userId: 'user2',
    userName: '匿名',
    userRole: 'general',
    latitude: 33.6812,
    longitude: 133.6453,
    title: '桜が満開です',
    description: '公園の桜が見頃を迎えています。お花見におすすめです！',
    genre: 'scenery',
    images: [],
    reactions: 89,
    createdAt: new Date('2025-11-01T15:20:00'),
    viewCount: 312,
  },
  {
    id: 'pin4',
    userId: 'user3',
    userName: '匿名',
    userRole: 'general',
    latitude: 33.6662,
    longitude: 133.6603,
    title: '地域イベント開催のお知らせ',
    description: '来週土曜日に商店街でお祭りが開催されます！',
    genre: 'event',
    images: [],
    reactions: 156,
    createdAt: new Date('2025-10-31T12:00:00'),
    viewCount: 478,
  },
  {
    id: 'pin5',
    userId: 'business2',
    userName: 'カフェ山田',
    userRole: 'business',
    businessName: 'カフェ山田',
    businessIcon:
      'https://images.unsplash.com/photo-1622988694527-0991e80c2587?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWZlJTIwY29mZmVlJTIwbG9nb3xlbnwxfHx8fDE3NjIyMTQyMTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    latitude: 33.6762,
    longitude: 133.6403,
    title: '新メニュー登場',
    description: '秋の新作パフェをご用意しました。栗とさつまいもの贅沢な味わいです。',
    genre: 'food',
    images: [],
    reactions: 45,
    createdAt: new Date('2025-10-30T08:30:00'),
    viewCount: 201,
  },
  {
    id: 'pin6',
    userId: 'user4',
    userName: '匿名',
    userRole: 'general',
    latitude: 33.6712,
    longitude: 133.6653,
    title: '道路工事のお知らせ',
    description: '明日から1週間、メインストリートで道路工事が行われます。迂回路をご利用ください。',
    genre: 'emergency',
    images: [],
    reactions: 34,
    createdAt: new Date('2025-10-29T17:45:00'),
    viewCount: 523,
  },
];

// モック問い合わせデータ
export type Inquiry = {
  id: string;
  fromName: string;
  email: string;
  role: 'general' | 'business';
  message: string;
  date: string;
  status: 'open' | 'responded';
  draft?: string;
};*/
