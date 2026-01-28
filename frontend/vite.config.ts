import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // 外部からのアクセス許可（これは既にあるはず）
    
    // 【ここを追加】nip.io からのアクセスを許可する
    allowedHosts: true, 
  },
})
