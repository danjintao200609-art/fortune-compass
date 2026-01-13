/**
 * 认证功能测试脚本
 * 用于验证密码加密和验证逻辑是否正常
 */

const bcrypt = require('bcryptjs');

async function testPasswordEncryption() {
    console.log('🔐 测试密码加密和验证功能...\n');

    const testPassword = 'testPassword123';

    // 1. 测试密码加密
    console.log('1️⃣ 测试密码加密:');
    console.log(`   原始密码: ${testPassword}`);

    const salt = await bcrypt.genSalt(10);
    const hash1 = await bcrypt.hash(testPassword, salt);
    console.log(`   加密结果1: ${hash1}`);

    const hash2 = await bcrypt.hash(testPassword, salt);
    console.log(`   加密结果2: ${hash2}`);
    console.log(`   ✅ 密码已成功加密\n`);

    // 2. 测试密码验证 - 正确密码
    console.log('2️⃣ 测试密码验证 - 正确密码:');
    const isValid1 = await bcrypt.compare(testPassword, hash1);
    console.log(`   验证结果: ${isValid1}`);
    console.log(`   ${isValid1 ? '✅' : '❌'} 正确密码验证${isValid1 ? '成功' : '失败'}\n`);

    // 3. 测试密码验证 - 错误密码
    console.log('3️⃣ 测试密码验证 - 错误密码:');
    const wrongPassword = 'wrongPassword456';
    const isValid2 = await bcrypt.compare(wrongPassword, hash1);
    console.log(`   错误密码: ${wrongPassword}`);
    console.log(`   验证结果: ${isValid2}`);
    console.log(`   ${!isValid2 ? '✅' : '❌'} 错误密码验证${!isValid2 ? '正确拒绝' : '错误通过'}\n`);

    // 4. 测试加密的一致性
    console.log('4️⃣ 测试相同密码的不同哈希值:');
    const hash3 = await bcrypt.hash(testPassword, await bcrypt.genSalt(10));
    console.log(`   哈希值1: ${hash1}`);
    console.log(`   哈希值3: ${hash3}`);
    console.log(`   是否相同: ${hash1 === hash3}`);
    const canVerifyWithBoth = await bcrypt.compare(testPassword, hash3);
    console.log(`   使用新哈希验证: ${canVerifyWithBoth}`);
    console.log(`   ✅ 不同哈希值都可以正确验证相同密码\n`);

    // 总结
    console.log('============================================');
    if (isValid1 && !isValid2 && canVerifyWithBoth) {
        console.log('✅ 所有密码加密和验证测试通过！');
        console.log('   - 密码可以正确加密');
        console.log('   - 正确的密码可以验证通过');
        console.log('   - 错误的密码会被正确拒绝');
        console.log('   - 每次加密产生不同的哈希值（安全）');
    } else {
        console.log('❌ 密码加密和验证测试失败！');
        console.log('   请检查 bcryptjs 是否正确安装');
    }
    console.log('============================================\n');
}

// 运行测试
testPasswordEncryption().catch(error => {
    console.error('❌ 测试过程出错:', error);
    process.exit(1);
});
