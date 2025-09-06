import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/yjfc/',  // ✅ 리포 이름 정확히
  plugins: [react()],
})
