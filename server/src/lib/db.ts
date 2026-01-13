import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// 从环境变量获取数据库连接URL
const databaseUrl = process.env.DATABASE_URL || '';

if (!databaseUrl) {
  console.error('❌ 未找到 DATABASE_URL 环境变量');
  process.exit(1);
}

// 创建连接池
export const pool = new Pool({ connectionString: databaseUrl });

// 测试连接
pool.connect()
  .then(client => {
    console.log('✅ 数据库连接成功');
    client.release();
  })
  .catch(error => {
    console.error('❌ 数据库连接失败:', error.message);
  });
