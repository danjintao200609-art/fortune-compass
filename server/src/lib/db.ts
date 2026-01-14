import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// 从环境变量获取数据库连接URL
const databaseUrl = process.env.DATABASE_URL || '';

// 打印简化的连接信息（不包含密码）用于排查项目
const logDbConfig = () => {
  if (!databaseUrl) {
    console.error('[Database] ERROR: DATABASE_URL is not defined in environment variables.');
    return;
  }
  try {
    const url = new URL(databaseUrl);
    console.log(`[Database] Attempting to connect to: ${url.protocol}//${url.host}${url.pathname}`);
    console.log(`[Database] DB User: ${url.username}`);
  } catch (e) {
    console.error('[Database] ERROR: Invalid DATABASE_URL format.');
  }
};

logDbConfig();

// 创建连接池
export const pool = new Pool(databaseUrl ? {
  connectionString: databaseUrl,
  ssl: databaseUrl.includes('sealos') ? { rejectUnauthorized: false } : false // Sealos 通常需要 SSL
} : {});

let isDatabaseConnected = false;

export const testDatabaseConnection = async () => {
  try {
    if (!databaseUrl) {
      return false;
    }

    console.log('[Database] Testing connection and tables...');
    const client = await pool.connect();

    // Check if auth_users table exists
    const tableCheck = await client.query(`
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'auth_users'
        );
    `);

    if (tableCheck.rows[0].exists) {
      console.log('✅ [Database] Connection successful and auth_users table found.');
    } else {
      console.warn('⚠️ [Database] Connection successful but auth_users table is MISSING. Please run initialization script.');
    }

    const res = await client.query('SELECT NOW()');
    console.log('✅ [Database] Server time:', res.rows[0].now);
    client.release();
    isDatabaseConnected = true;
    return true;
  } catch (error) {
    console.error('❌ [Database] Connection failed!');
    if (error instanceof Error) {
      console.error(`[Database] Error Name: ${error.name}`);
      console.error(`[Database] Error Message: ${error.message}`);
      // @ts-ignore
      if (error.code) console.error(`[Database] Error Code: ${error.code}`);
    } else {
      console.error(`[Database] Unknown error: ${String(error)}`);
    }
    console.warn('⚠️ [Database] Application will continue but DB features will be disabled.');
    isDatabaseConnected = false;
    return false;
  }
};

export const getDatabaseStatus = () => isDatabaseConnected;
