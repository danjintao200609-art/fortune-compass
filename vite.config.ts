import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  return {
    server: {
      host: '0.0.0.0', // 监听所有网络接口，包括 IPv4
      port: 5173, // 前端固定在 5173
      proxy: {
        '/api': {
          target: 'http://localhost:3000', // 将所有 API 请求转给 3000 端口的后端
          changeOrigin: true,
        }
      }
    },
    plugins: [react()],
    define: {
      // 使用import.meta.env访问环境变量，避免process未定义错误
      'import.meta.env.VITE_LAF_APP_ID': JSON.stringify(env.VITE_LAF_APP_ID),
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    }
  };
});