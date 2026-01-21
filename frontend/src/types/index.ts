export type UserRole = 'general' | 'business' | 'admin';

export type PinGenre = 'food' | 'event' | 'scenery' | 'shop' | 'emergency' | 'other';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  blockedUsers?: string[];
  // 事業者会員向けプロパティ
  businessId?: number;
  businessName?: string;
  kanaBusinessName?: string;
  zipCode?: string;
  address?: string;
  phone?: string;
  businessIcon?: string;
  profileImage?: string;
  placeId?: number;
  registDate?: string;
}

export interface Pin {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  businessName?: string;
  businessIcon?: string;
  latitude: number;
  longitude: number;
  title: string;
  description: string;
  genre: PinGenre;
  images: string[];
  reactions: number;
  createdAt: Date;
  viewCount?: number;
  isHot?: boolean; // 投稿数がしきい値を超えたかどうか
}

export interface Reaction {
  id: string;
  pinId: string;
  userId: string;
  createdAt: Date;
}

export interface Report {
  id: string;
  pinId: string;
  reporterId: string;
  reason: string;
  createdAt: Date;
  status: 'pending' | 'resolved' | 'dismissed';
}
