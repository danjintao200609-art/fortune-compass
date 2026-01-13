const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.SUPABASE_URL || 'https://vmnzlweewtzadycwnojg.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_Nrib8caZKDo4IURRf5DMzQ_Kw7mCitv';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupProfilesTable() {
    console.log('🔧 开始创建个人资料表...\n');

    try {
        // 检查 profiles 表
        console.log('1️⃣ 检查 profiles 表...');

        const { data: existingProfiles, error: checkError } = await supabase
            .from('profiles')
            .select('id')
            .limit(1);

        if (checkError && checkError.code === 'PGRST116') {
            console.log('   ❌ profiles 表不存在');
            console.log('\n📋 请手动在 Supabase Dashboard 中执行以下 SQL：\n');
            console.log('   打开：https://supabase.com/dashboard/project/' + supabaseUrl.split('//')[1].split('.')[0] + '/sql/new\n');

            const sql = fs.readFileSync('profiles_schema.sql', 'utf-8');
            console.log('='.repeat(80));
            console.log(sql);
            console.log('='.repeat(80));
            console.log('\n执行完成后，重新运行此脚本验证。\n');
            process.exit(1);
        } else {
            console.log('   ✅ profiles 表已存在');
        }

        console.log('\n============================================');
        console.log('✅ 个人资料表配置完成！');
        console.log('============================================\n');

    } catch (error) {
        console.error('❌ 错误:', error.message);
        process.exit(1);
    }
}

setupProfilesTable();
