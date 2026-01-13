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

    // 创建运势记录表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS fortune_records (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) REFERENCES auth_users(id),
        fortune_type VARCHAR(50) NOT NULL,
        fortune_content JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ 运势记录表 (fortune_records) 创建成功');

    // 创建运势模板表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS fortune_templates (
        id VARCHAR(50) PRIMARY KEY,
        fortune_type VARCHAR(50) NOT NULL,
        template_content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ 运势模板表 (fortune_templates) 创建成功');

    // 创建个人资料表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id VARCHAR(50) PRIMARY KEY REFERENCES auth_users(id) ON DELETE CASCADE,
        nickname TEXT,
        signature TEXT,
        birthday DATE,
        gender TEXT CHECK (gender IN ('male', 'female', 'other')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ 个人资料表 (profiles) 创建成功');

    // 创建初始运势模板数据
    await pool.query(`
      INSERT INTO fortune_templates (id, fortune_type, template_content)
      VALUES
        ('1', 'daily', '今天是你的幸运日，祝你一切顺利！'),
        ('2', 'weekly', '本周你的运势整体不错，适合制定长期计划。'),
        ('3', 'monthly', '本月你的事业运势较为稳定，注意保持良好的人际关系。')
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log('✅ 初始运势模板数据插入成功');

    console.log('🎉 数据库初始化完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    process.exit(1);
  }
};

// 执行初始化
initDatabase();
