const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ 缺少 SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY 环境变量');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignaturePersistence() {
    console.log('🧪 开始测试签名 (signature) 字段持久化...\n');

    try {
        // 1. 获取一个存在的用户（如果没有用户，这个测试会失败，但我们假设您已经注册过）
        // 我们直接查询 auth.users 表可能需要权限，所以我们查询 profiles 表看看有没有数据
        const { data: existingProfiles, error: fetchError } = await supabase
            .from('profiles')
            .select('id, nickname, signature')
            .limit(1);

        if (fetchError) {
            throw new Error(`无法查询 profiles 表: ${fetchError.message}`);
        }

        if (!existingProfiles || existingProfiles.length === 0) {
            console.log('⚠️ profiles 表为空，无法进行更新测试。请先在应用中注册一个用户。');
            return;
        }

        const testUser = existingProfiles[0];
        console.log(`👤 找到测试用户: ${testUser.nickname || 'Unknown'} (ID: ${testUser.id})`);
        console.log(`   当前签名: "${testUser.signature || '(空)'}"`);

        // 2. 尝试更新签名
        const newSignature = `自动化测试签名_${Date.now()}`;
        console.log(`\n✏️ 正在尝试更新签名为: "${newSignature}"...`);

        const { data: updatedData, error: updateError } = await supabase
            .from('profiles')
            .update({ signature: newSignature })
            .eq('id', testUser.id)
            .select()
            .single();

        if (updateError) {
            console.log('❌ 更新失败！可能是 signature 字段不存在。');
            console.error('   错误详情:', updateError.message);
            console.log('\n💡 建议：请确认您已在 Supabase 中执行了 ALTER TABLE 语句。');
        } else {
            console.log('✅ 更新成功！');
            console.log(`   数据库返回的新签名: "${updatedData.signature}"`);

            if (updatedData.signature === newSignature) {
                console.log('\n🎉 验证通过：signature 字段读写正常！');
            } else {
                console.log('\n❌ 验证失败：写入的数据与读取的数据不一致。');
            }
        }

    } catch (error) {
        console.error('❌ 测试发生异常:', error.message);
    }
}

testSignaturePersistence();
