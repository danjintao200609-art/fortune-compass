import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    server: {
      host: '0.0.0.0', // 监听所有网络接口，包括 IPv4
      port: 5173, // 前端固定在 5173
      proxy: {
        '/api': {
          target: 'http://localhost:3001', // 将所有 API 请求转给 3001 端口的后端
          changeOrigin: true,
        }
      }
    },
    plugins: [react()],
    define: {
      // 移除process.env定义，避免浏览器环境中出现process未定义错误
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    }
  };
});