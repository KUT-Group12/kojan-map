const JWT_STORAGE_KEY = 'kojanmap_jwt';
const USER_STORAGE_KEY = 'kojanmap_user';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8080';

type UserRole = 'general' | 'business' | 'admin';

type BackendUser = {
  id: string;
  googleId?: string;
  gmail?: string;
  email?: string;
  role: string;
  registrationDate?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type StoredUser = {
  id: string;
  googleId?: string;
  email: string;
  role: UserRole;
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
    role: (user.role as UserRole) || 'general',
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
  zipCode: number;
  address: string;
  phone: string;
  profileImage?: string;
  userId: string;
  placeId?: number;
  registDate: string;
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
export async function uploadBusinessIcon(
  token: string,
  file: File
): Promise<{ success: boolean; profileImage: string }> {
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
    throw new Error('アイコンのアップロードに失敗しました');
  }

  return response.json() as Promise<{ success: boolean; profileImage: string }>;
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
export async function updateBusinessName(token: string, businessName: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/business/name`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ businessName }),
  });

  if (!response.ok) {
    throw new Error('事業者名の更新に失敗しました');
  }
}

// 事業者の住所を更新
export async function updateBusinessAddress(
  token: string,
  address: string,
  zipCode: number
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
