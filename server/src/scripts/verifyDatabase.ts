import { pool } from '../lib/db';

/**
 * 验证数据库连接和表结构
 */
async function verifyDatabase() {
    console.log('🔍 Starting database verification...\n');

    try {
        // 1. 测试基本连接
        console.log('1️⃣ Testing database connection...');
        const client = await pool.connect();
        console.log('✅ Database connection successful\n');

        // 2. 检查 PostgreSQL 版本
        console.log('2️⃣ Checking PostgreSQL version...');
        const versionResult = await client.query('SELECT version()');
        console.log(`✅ PostgreSQL version: ${versionResult.rows[0].version.split(',')[0]}\n`);

        // 3. 检查所有表
        console.log('3️⃣ Checking existing tables...');
        const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

        if (tablesResult.rows.length === 0) {
            console.log('⚠️  No tables found. Please run initDatabase.ts\n');
        } else {
            console.log('✅ Found tables:');
            tablesResult.rows.forEach(row => {
                console.log(`   - ${row.table_name}`);
            });
            console.log('');
        }

        // 4. 检查必需的表
        console.log('4️⃣ Verifying required tables...');
        const requiredTables = ['auth_users', 'profiles', 'fortune_history'];

        for (const tableName of requiredTables) {
            const checkResult = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )
      `, [tableName]);

            if (checkResult.rows[0].exists) {
                console.log(`   ✅ ${tableName} - exists`);
            } else {
                console.log(`   ❌ ${tableName} - MISSING`);
            }
        }
        console.log('');

        // 5. 检查用户数量
        const userCountResult = await client.query('SELECT COUNT(*) FROM auth_users');
        console.log(`5️⃣ Total users in database: ${userCountResult.rows[0].count}\n`);

        client.release();

        console.log('✅ Database verification completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Database verification failed!');
        if (error instanceof Error) {
            console.error(`Error: ${error.message}`);
            // @ts-ignore
            if (error.code) console.error(`Code: ${error.code}`);
        }
        process.exit(1);
    }
}

verifyDatabase();
