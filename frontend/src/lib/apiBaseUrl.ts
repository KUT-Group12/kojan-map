// APIベースURLを環境ごとに切り替え
export const API_BASE_URL =
  typeof process !== 'undefined' && process.env.NODE_ENV === 'test'
    ? 'http://localhost:8080'
    : (import.meta.env.VITE_API_URL ??
      import.meta.env.VITE_API_BASE_URL ??
      '');
