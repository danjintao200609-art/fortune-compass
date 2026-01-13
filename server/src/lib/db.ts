import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// 从环境变量获取数据库连接URL
const databaseUrl = process.env.DATABASE_URL || '';

// 创建连接池 - 允许空URL进行优雅错误处理
export const pool = new Pool(databaseUrl ? { connectionString: databaseUrl } : {});

// 测试连接（异步，不会阻塞应用启动）
let isDatabaseConnected = false;

export const testDatabaseConnection = async () => {
  try {
    if (!databaseUrl) {
      console.warn('⚠️ 未找到 DATABASE_URL 环境变量，数据库功能将不可用');
      return false;
    }
    
    const client = await pool.connect();
    console.log('✅ 数据库连接成功');
    client.release();
    isDatabaseConnected = true;
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error instanceof Error ? error.message : String(error));
    console.warn('⚠️ 应用将继续运行，但数据库功能将不可用');
    isDatabaseConnected = false;
    return false;
  }
};

// 获取数据库连接状态
export const getDatabaseStatus = () => isDatabaseConnected;
