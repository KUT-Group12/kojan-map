export type UserRole = 'general' | 'business' | 'admin';

export type PinGenre = 'food' | 'event' | 'scenery' | 'shop' | 'emergency' | 'other';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  businessName?: string;
  businessIcon?: string;
  createdAt: Date;
  blockedUsers?: string[];
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
