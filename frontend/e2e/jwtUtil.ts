// JWT認証用ユーティリティ（テスト用）
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET_KEY || 'dev-secret-key-please-change-in-production';

export function generateJWT(googleId: string, email: string, role: string) {
  return jwt.sign({ googleId, email, role }, SECRET_KEY, { expiresIn: '1h' });
}
