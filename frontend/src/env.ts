// src/env.ts (名前は任意です)

export const getEnv = (key: string): string => {
    // 1. Vite (ブラウザ環境) 用のチェック
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      return import.meta.env[key] || '';
    }
  
    // 2. Jest (Node.js環境) 用のチェック
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || '';
    }
  
    return '';
  };