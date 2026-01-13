#!/usr/bin/env node

/**
 * 认证功能测试脚本
 * 用于测试未注册用户无法登录的功能
 */

const API_BASE = 'http://localhost:3000/api/auth';

// 颜色输出
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// 测试登录
async function testLogin(identifier, password, shouldSucceed = false) {
    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, password }),
        });

        const result = await response.json();

        if (response.ok && shouldSucceed) {
            log(`✅ 登录成功: ${identifier}`, 'green');
            return { success: true, data: result };
        } else if (!response.ok && !shouldSucceed) {
            log(`✅ 预期失败: ${result.error}`, 'green');
            return { success: true, error: result.error };
        } else if (response.ok && !shouldSucceed) {
            log(`❌ 意外成功: 未注册用户不应该能登录`, 'red');
            return { success: false };
        } else {
            log(`❌ 意外失败: ${result.error}`, 'red');
            return { success: false, error: result.error };
        }
    } catch (error) {
        log(`❌ 网络错误: ${error.message}`, 'red');
        return { success: false, error: error.message };
    }
}

// 测试注册
async function testRegister(username, email, phone, password) {
    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, phone, password }),
        });

        const result = await response.json();

        if (response.ok) {
            log(`✅ 注册成功: ${username}`, 'green');
            return { success: true, data: result };
        } else {
            log(`❌ 注册失败: ${result.error}`, 'red');
            return { success: false, error: result.error };
        }
    } catch (error) {
        log(`❌ 网络错误: ${error.message}`, 'red');
        return { success: false, error: error.message };
    }
}

// 主测试流程
async function runTests() {
    log('\n========================================', 'blue');
    log('🧪 开始测试认证功能', 'blue');
    log('========================================\n', 'blue');

    // 生成随机测试数据
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;
    const testPhone = `138${timestamp.toString().slice(-8)}`;
    const testUsername = `testuser${timestamp}`;
    const testPassword = 'password123';

    let passedTests = 0;
    let totalTests = 0;

    // 测试 1: 未注册用户尝试登录（邮箱）
    log('\n📝 测试 1: 未注册用户尝试登录（邮箱）', 'yellow');
    totalTests++;
    const test1 = await testLogin('nonexistent@example.com', 'wrongpassword', false);
    if (test1.success) passedTests++;

    // 测试 2: 未注册用户尝试登录（手机号）
    log('\n📝 测试 2: 未注册用户尝试登录（手机号）', 'yellow');
    totalTests++;
    const test2 = await testLogin('13800000000', 'wrongpassword', false);
    if (test2.success) passedTests++;

    // 测试 3: 注册新用户
    log('\n📝 测试 3: 注册新用户', 'yellow');
    totalTests++;
    const test3 = await testRegister(testUsername, testEmail, null, testPassword);
    if (test3.success) passedTests++;

    // 测试 4: 使用刚注册的账号登录
    if (test3.success) {
        log('\n📝 测试 4: 使用刚注册的账号登录', 'yellow');
        totalTests++;
        const test4 = await testLogin(testEmail, testPassword, true);
        if (test4.success) passedTests++;
    }

    // 测试 5: 使用错误密码登录
    log('\n📝 测试 5: 使用错误密码登录', 'yellow');
    totalTests++;
    const test5 = await testLogin(testEmail, 'wrongpassword', false);
    if (test5.success) passedTests++;

    // 测试 6: 重复注册（应该失败）
    log('\n📝 测试 6: 重复注册相同用户名（应该失败）', 'yellow');
    totalTests++;
    const test6 = await testRegister(testUsername, `another${testEmail}`, null, testPassword);
    if (!test6.success) {
        log('✅ 预期失败: 用户名已被使用', 'green');
        passedTests++;
    } else {
        log('❌ 意外成功: 不应该允许重复注册', 'red');
    }

    // 测试结果汇总
    log('\n========================================', 'blue');
    log('📊 测试结果汇总', 'blue');
    log('========================================', 'blue');
    log(`总测试数: ${totalTests}`, 'blue');
    log(`通过: ${passedTests}`, passedTests === totalTests ? 'green' : 'yellow');
    log(`失败: ${totalTests - passedTests}`, totalTests - passedTests === 0 ? 'green' : 'red');
    log(`成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`,
        passedTests === totalTests ? 'green' : 'yellow');

    if (passedTests === totalTests) {
        log('🎉 所有测试通过！未注册用户无法登录功能正常工作！', 'green');
    } else {
        log('⚠️  部分测试失败，请检查日志', 'yellow');
    }
}

// 检查服务器是否运行
async function checkServer() {
    try {
        const response = await fetch(`${API_BASE}/../health`);
        return response.ok;
    } catch (error) {
        return false;
    }
}

// 启动测试
(async () => {
    log('\n🔍 检查服务器状态...', 'blue');

    const serverRunning = await checkServer();

    if (!serverRunning) {
        log('⚠️  警告: 无法连接到服务器', 'yellow');
        log(`请确保后端服务运行在 ${API_BASE}`, 'yellow');
        log('提示: 在 server 目录运行 npm run dev\n', 'yellow');
    }

    await runTests();
})();
