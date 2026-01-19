export type UserRole = 'general' | 'business' | 'admin';

export type PinGenre = 'food' | 'event' | 'scene' | 'store' | 'emergency' | 'other';

// 会員情報
export interface User {
  googleId: string; // Google ID (PK)
  gmail: string; // Gmailアドレス
  role: UserRole; // 会員区分
  registrationDate: string; // 登録日
  // postCount?: number; // 投稿数
  fromName?: string; // 表示名
}

// セッション情報インターフェース (セッション管理用)
export interface UserSession {
  sessionId: string; // セッションID
  googleId: string; // Google ID
  expiry: string; // 有効期限
}

// 事業者情報インターフェース (事業者テーブル)
export interface Business {
  businessId: number; // 事業者ID
  businessName: string; // 事業者名
  kanaBusinessName: string; // 事業者名カナ
  zipCode: number; // 郵便番号
  address: string; // 住所
  phone: number; // 電話番号
  registDate: string; // 登録日
  profileImage?: string; // プロフィール画像
  userId: string; // Google ID
  placeId: number; // 場所ID
}

// ブロック情報インターフェース (ブロック管理テーブル)
export interface Block {
  blockId: number; // ブロックID
  blockerId: string; // ブロックしたユーザーID
  blockedId: string; // ブロックされたユーザーID
}

// お問い合わせ情報インターフェース (問い合わせ管理テーブル)
export interface Inquiry {
  askId: number; // お問い合わせID
  date: string; // お問い合わせ日時
  subject: string; // 件名
  text: string; // 内容
  userId: string; // ユーザーID
  askFlag: boolean; // 対応済みフラグ
}

// 投稿情報インターフェース (投稿管理テーブル)
export interface Post {
  postId: number; // 投稿ID
  placeId: number; // 場所ID
  userId: string; // ユーザーID
  postDate: string; // 投稿日時
  title: string; // タイトル
  text: string; // 内容
  postImage?: string[]; // 投稿画像
  numReaction: number; // リアクション数
  numView: number; // 閲覧数
  genreId: number; // ジャンルID
}

// 場所情報インターフェース (場所管理テーブル)
export interface Place {
  placeId: number; // 場所ID
  numPost: number; // 投稿数
  latitude: number; // 緯度
  longitude: number; // 経度
}

// ジャンル情報インターフェース (ジャンル管理テーブル)
export interface Genre {
  genreId: number; // ジャンルID
  genreName: PinGenre; // ジャンル名
  color: string; // 表示色
}

// 通報情報インターフェース (表15 通報情報)
export interface Report {
  reportId: number; // 通報ID
  userId: string; // 通報者ID (Google ID)
  postId: number; // 投稿ID
  reason: string; // 通報理由
  date: string; // 通報日時
  reportFlag: boolean; // 対応済みフラグ
  removeFlag: boolean; // 削除フラグ
}

// 事業者申請リクエストインターフェース (申請管理テーブル)
export interface BusinessRequest {
  requestId: number; // 申請ID
  name: string; // 氏名
  address: string; // 住所
  phone: number; // 電話番号
  userId: string; // ユーザーID
}

// リアクション情報インターフェース (リアクション管理テーブル)
export interface Reaction {
  reactionId: number; // リアクションID
  userId: string; // ユーザーID
  postId: number; // 投稿ID
}
