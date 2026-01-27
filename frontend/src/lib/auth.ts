const JWT_STORAGE_KEY = 'kojanmap_jwt';
const USER_STORAGE_KEY = 'kojanmap_user';

import { API_BASE_URL } from './apiBaseUrl';

type UserRole = 'user' | 'business' | 'admin';

type BackendUser = {
  id: string;
  googleId?: string;
  gmail?: string;
  email?: string;
  role: string;
  businessName?: string;
  businessIcon?: string;
  registrationDate?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type StoredUser = {
  id: string;
  googleId?: string;
  email: string;
  role: UserRole;
  businessName?: string;
  businessIcon?: string;
  createdAt: string;
};

export type ExchangeResponse = {
  jwt_token: string;
  user: BackendUser;
};

const toStoredUser = (user: BackendUser): StoredUser => {
  const email = user.gmail || user.email || '';
  const createdAt = user.createdAt || user.registrationDate || new Date().toISOString();

  return {
    id: user.id,
    googleId: user.googleId,
    email,
    role: (user.role as UserRole) || 'user',
    businessName: user.businessName,
    businessIcon: user.businessIcon,
    createdAt,
  };
};

export async function exchangeGoogleTokenForJWT(
  token: string,
  role: UserRole
): Promise<ExchangeResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/exchange-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      google_token: token,
      role,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Google認証に失敗しました');
  }

  const data = (await response.json()) as ExchangeResponse;
  return data;
}

export function storeJWT(token: string) {
  localStorage.setItem(JWT_STORAGE_KEY, token);
}

export function getStoredJWT(): string | null {
  return localStorage.getItem(JWT_STORAGE_KEY);
}

export function removeStoredJWT() {
  localStorage.removeItem(JWT_STORAGE_KEY);
}

export function storeUser(user: BackendUser) {
  const storedUser = toStoredUser(user);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(storedUser));
}

export function getStoredUser(): StoredUser | null {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredUser;
  } catch (error) {
    console.error('Failed to parse stored user', error);
    return null;
  }
}

export function removeStoredUser() {
  localStorage.removeItem(USER_STORAGE_KEY);
}

export function logout() {
  removeStoredJWT();
  removeStoredUser();
}

// ========== ビジネスユーザー向けAPI ==========

export interface BusinessStats {
  totalPosts: number;
  totalReactions: number;
  totalViews: number;
  averageReactions: number;
  weeklyData: Array<{
    date: string;
    reactions: number;
    views: number;
  }>;
}

export interface BusinessProfile {
  businessId: number;
  businessName: string;
  kanaBusinessName: string;
  zipCode: string;
  address: string;
  phone: string;
  registDate: string;
  profileImage?: string;
  userId: string;
  placeId: number;
}

// 事業者ダッシュボード統計情報を取得
export async function getBusinessStats(token: string): Promise<BusinessStats> {
  const response = await fetch(`${API_BASE_URL}/api/business/stats`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('ダッシュボード統計情報の取得に失敗しました');
  }

  return response.json() as Promise<BusinessStats>;
}

// 事業者プロフィール情報を取得
export async function getBusinessProfile(token: string): Promise<BusinessProfile> {
  const response = await fetch(`${API_BASE_URL}/api/business/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('事業者プロフィール情報の取得に失敗しました');
  }

  return response.json() as Promise<BusinessProfile>;
}

// 事業者プロフィール情報を更新
export async function updateBusinessProfile(
  token: string,
  profile: Partial<BusinessProfile>
): Promise<BusinessProfile> {
  const response = await fetch(`${API_BASE_URL}/api/business/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profile),
  });

  if (!response.ok) {
    throw new Error('事業者プロフィール情報の更新に失敗しました');
  }

  return response.json() as Promise<BusinessProfile>;
}

// 事業者アイコン画像をアップロード
export async function uploadBusinessIcon(token: string, file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/business/icon`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = 'アイコン画像のアップロードに失敗しました';
    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch (e) {
      console.error('Error parsing error response:', e);
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data.profileImage;
}

// 事業者の投稿数を取得
export async function getBusinessPostCount(token: string): Promise<number> {
  const response = await fetch(`${API_BASE_URL}/api/business/posts/count`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('投稿数の取得に失敗しました');
  }

  const data = (await response.json()) as { count: number };
  return data.count;
}

// 事業者の月間売上を取得
export async function getBusinessRevenue(
  token: string,
  year: number,
  month: number
): Promise<{ revenue: number; currency: string }> {
  const response = await fetch(`${API_BASE_URL}/api/business/revenue?year=${year}&month=${month}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('売上情報の取得に失敗しました');
  }

  return response.json() as Promise<{ revenue: number; currency: string }>;
}

// 事業者の名前を更新
export async function updateBusinessName(token: string, name: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/business/name`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw new Error('事業者名の更新に失敗しました');
  }
}

// 事業者の住所を更新
export async function updateBusinessAddress(
  token: string,
  address: string,
  zipCode?: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/business/address`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ address, zipCode }),
  });

  if (!response.ok) {
    throw new Error('住所の更新に失敗しました');
  }
}

// 事業者の電話番号を更新
export async function updateBusinessPhone(token: string, phone: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/business/phone`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ phone }),
  });

  if (!response.ok) {
    throw new Error('電話番号の更新に失敗しました');
  }
}
