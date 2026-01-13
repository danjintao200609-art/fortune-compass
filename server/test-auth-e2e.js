/**
 * 完整的认证API端到端测试
 * 测试注册、登录、密码验证等功能
 */

const API_BASE = 'http://localhost:3000/api/auth';

// 生成随机用户数据
const randomNum = Math.floor(Math.random() * 100000);
const testUser = {
    username: `testuser_${randomNum}`,
    email: `test_${randomNum}@example.com`,
    password: 'Test@123456'
};

console.log('🧪 开始端到端认证测试...\n');
console.log('测试用户信息:');
console.log(JSON.stringify(testUser, null, 2));
console.log('');

/**
 * 测试1: 用户注册
 */
async function testRegister() {
    console.log('1️⃣ 测试用户注册...');

    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });

        const data = await response.json();

        if (response.ok) {
            console.log('   ✅ 注册成功');
            console.log(`   用户ID: ${data.user.id}`);
            console.log(`   用户名: ${data.user.username}`);
            console.log(`   Token: ${data.token.substring(0, 20)}...`);
            return { success: true, token: data.token, user: data.user };
        } else {
            console.log(`   ❌ 注册失败: ${data.error}`);
            return { success: false, error: data.error };
        }
    } catch (error) {
        console.log(`   ❌ 网络错误: ${error.message}`);
        return { success: false, error: error.message };
    }
}

/**
 * 测试2: 重复用户名注册
 */
async function testDuplicateRegister() {
    console.log('\n2️⃣ 测试重复用户名注册（应该失败）...');

    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...testUser,
                email: `different_${Date.now()}@example.com` // 不同的邮箱
            })
        });

        const data = await response.json();

        if (!response.ok && data.error.includes('用户名已被使用')) {
            console.log('   ✅ 正确拒绝了重复用户名');
            return { success: true };
        } else {
            console.log(`   ❌ 应该拒绝重复用户名，但是: ${data.error || '注册成功'}`);
            return { success: false };
        }
    } catch (error) {
        console.log(`   ❌ 网络错误: ${error.message}`);
        return { success: false };
    }
}

/**
 * 测试3: 正确密码登录
 */
async function testLoginWithCorrectPassword() {
    console.log('\n3️⃣ 测试使用正确密码登录...');

    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                identifier: testUser.email,
                password: testUser.password // 正确的密码
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('   ✅ 登录成功');
            console.log(`   用户名: ${data.user.username}`);
            console.log(`   Token: ${data.token.substring(0, 20)}...`);
            return { success: true, token: data.token };
        } else {
            console.log(`   ❌ 登录失败: ${data.error}`);
            return { success: false, error: data.error };
        }
    } catch (error) {
        console.log(`   ❌ 网络错误: ${error.message}`);
        return { success: false };
    }
}

/**
 * 测试4: 错误密码登录
 */
async function testLoginWithWrongPassword() {
    console.log('\n4️⃣ 测试使用错误密码登录（应该失败）...');

    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                identifier: testUser.email,
                password: 'WrongPassword123' // 错误的密码
            })
        });

        const data = await response.json();

        if (!response.ok && (data.error.includes('密码错误') || data.error.includes('邮箱/手机号或密码错误'))) {
            console.log('   ✅ 正确拒绝了错误密码');
            return { success: true };
        } else {
            console.log(`   ❌ 应该拒绝错误密码，但是: ${data.error || '登录成功'}`);
            return { success: false };
        }
    } catch (error) {
        console.log(`   ❌ 网络错误: ${error.message}`);
        return { success: false };
    }
}

/**
 * 测试5: 不存在的用户登录
 */
async function testLoginNonExistentUser() {
    console.log('\n5️⃣ 测试不存在的用户登录（应该失败）...');

    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                identifier: 'nonexistent@example.com',
                password: 'SomePassword123'
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.log('   ✅ 正确拒绝了不存在的用户');
            return { success: true };
        } else {
            console.log(`   ❌ 应该拒绝不存在的用户，但是登录成功了`);
            return { success: false };
        }
    } catch (error) {
        console.log(`   ❌ 网络错误: ${error.message}`);
        return { success: false };
    }
}

/**
 * 测试6: Token验证
 */
async function testTokenVerification(token) {
    console.log('\n6️⃣ 测试Token验证...');

    try {
        const response = await fetch(`${API_BASE}/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            console.log('   ✅ Token验证成功');
            console.log(`   用户: ${data.user.username}`);
            return { success: true };
        } else {
            console.log(`   ❌ Token验证失败: ${data.error}`);
            return { success: false };
        }
    } catch (error) {
        console.log(`   ❌ 网络错误: ${error.message}`);
        return { success: false };
    }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
    console.log('============================================\n');

    const results = [];

    // 测试1: 注册
    const registerResult = await testRegister();
    results.push({ name: '用户注册', ...registerResult });

    if (!registerResult.success) {
        console.log('\n⚠️ 注册失败，跳过后续测试');
        printSummary(results);
        return;
    }

    // 测试2: 重复注册
    const duplicateResult = await testDuplicateRegister();
    results.push({ name: '重复用户名拒绝', ...duplicateResult });

    // 测试3: 正确密码登录
    const loginResult = await testLoginWithCorrectPassword();
    results.push({ name: '正确密码登录', ...loginResult });

    // 测试4: 错误密码登录
    const wrongPasswordResult = await testLoginWithWrongPassword();
    results.push({ name: '错误密码拒绝', ...wrongPasswordResult });

    // 测试5: 不存在的用户
    const nonExistentResult = await testLoginNonExistentUser();
    results.push({ name: '不存在用户拒绝', ...nonExistentResult });

    // 测试6: Token验证
    if (registerResult.token) {
        const tokenResult = await testTokenVerification(registerResult.token);
        results.push({ name: 'Token验证', ...tokenResult });
    }

    printSummary(results);
}

function printSummary(results) {
    console.log('\n============================================');
    console.log('📊 测试结果汇总:');
    console.log('============================================\n');

    results.forEach((result, index) => {
        const icon = result.success ? '✅' : '❌';
        console.log(`${icon} ${index + 1}. ${result.name}`);
    });

    const passed = results.filter(r => r.success).length;
    const total = results.length;

    console.log('\n============================================');
    console.log(`总计: ${passed}/${total} 测试通过`);

    if (passed === total) {
        console.log('🎉 所有测试通过！认证系统工作正常！');
    } else {
        console.log('⚠️ 部分测试失败，请检查代码');
    }
    console.log('============================================\n');
}

// 运行测试
runAllTests().catch(error => {
    console.error('\n❌ 测试运行出错:', error);
    console.error('\n💡 确保：');
    console.error('   1. 后端服务器正在运行 (npm run dev)');
    console.error('   2. 数据库表已创建 (node setup-auth-db.js)');
    console.error('   3. .env 文件配置正确\n');
    process.exit(1);
});
