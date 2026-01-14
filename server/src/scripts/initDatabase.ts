import { pool } from '../lib/db';

// 创建所有必要的数据库表
const initDatabase = async () => {
  try {
    console.log('开始初始化数据库...');

    // 创建用户表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS auth_users (
        id VARCHAR(50) PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(20) UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      );
    `);

    console.log('✅ 用户表 (auth_users) 创建成功');

    // 创建运势历史表 (fortune_history) - 匹配 controllers/fortuneController.ts
    await pool.query(`
      CREATE TABLE IF NOT EXISTS fortune_history (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) REFERENCES auth_users(id),
        fortunetype VARCHAR(50) NOT NULL,
        game_type VARCHAR(50) NOT NULL,
        prediction_date VARCHAR(50) NOT NULL,
        direction VARCHAR(10) NOT NULL,
        summary TEXT NOT NULL,
        lucky_color VARCHAR(50),
        best_time VARCHAR(100),
        energy_value VARCHAR(20),
        lucky_numbers INTEGER[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ 运势历史表 (fortune_history) 创建成功');

    // 创建个人资料表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id VARCHAR(50) PRIMARY KEY REFERENCES auth_users(id) ON DELETE CASCADE,
        nickname TEXT,
        signature TEXT,
        birthday DATE,
        gender TEXT CHECK (gender IN ('male', 'female', 'other')),
        avatar_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ 个人资料表 (profiles) 创建成功');

    console.log('🎉 数据库初始化完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    process.exit(1);
  }
};

// 执行初始化
initDatabase();
