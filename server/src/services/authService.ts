import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const TOKEN_EXPIRY = '7d'; // Token 有效期7天

export interface RegisterData {
    username: string;
    email?: string;
    phone?: string;
    password: string;
}

export interface LoginData {
    identifier: string; // 可以是邮箱或手机号
    password: string;
}

export interface AuthUser {
    id: string;
    username: string;
    email?: string;
    phone?: string;
}

// 密码加密
export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

// 验证密码
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
};

// 生成 JWT Token
export const generateToken = (user: AuthUser): string => {
    return jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY }
    );
};

// 验证 JWT Token
export const verifyToken = (token: string): AuthUser | null => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
        return decoded;
    } catch (error) {
        return null;
    }
};

// 用户注册
export const registerUser = async (data: RegisterData): Promise<{ user: AuthUser; token: string } | { error: string }> => {
    try {
        console.log(`[注册尝试] 用户名: ${data.username}, 邮箱: ${data.email || '无'}, 手机: ${data.phone || '无'}`);

        // 验证至少提供邮箱或手机号
        if (!data.email && !data.phone) {
            console.log('[注册失败] 未提供邮箱或手机号');
            return { error: '请提供邮箱或手机号' };
        }

        // 验证密码长度
        if (data.password.length < 6) {
            console.log('[注册失败] 密码长度不足');
            return { error: '密码至少需要6位字符' };
        }

        // 检查用户名是否已存在
        const existingUserResult = await pool.query(
            'SELECT id FROM auth_users WHERE username = $1',
            [data.username]
        );

        if (existingUserResult.rows.length > 0) {
            console.log(`[注册失败] 用户名已存在: ${data.username}`);
            return { error: '用户名已被使用' };
        }

        // 检查邮箱是否已存在
        if (data.email) {
            const existingEmailResult = await pool.query(
                'SELECT id FROM auth_users WHERE email = $1',
                [data.email]
            );

            if (existingEmailResult.rows.length > 0) {
                console.log(`[注册失败] 邮箱已存在: ${data.email}`);
                return { error: '邮箱已被注册' };
            }
        }

        // 检查手机号是否已存在
        if (data.phone) {
            const existingPhoneResult = await pool.query(
                'SELECT id FROM auth_users WHERE phone = $1',
                [data.phone]
            );

            if (existingPhoneResult.rows.length > 0) {
                console.log(`[注册失败] 手机号已存在: ${data.phone}`);
                return { error: '手机号已被注册' };
            }
        }

        // 加密密码
        const passwordHash = await hashPassword(data.password);

        // 创建用户
        const newUserResult = await pool.query(
            `INSERT INTO auth_users (username, email, phone, password_hash)
             VALUES ($1, $2, $3, $4)
             RETURNING id, username, email, phone`,
            [data.username, data.email || null, data.phone || null, passwordHash]
        );

        if (newUserResult.rows.length === 0) {
            console.error('[注册错误]: 用户创建失败');
            return { error: '注册失败，请稍后重试' };
        }

        const newUser = newUserResult.rows[0];

        const user: AuthUser = {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            phone: newUser.phone,
        };

        const token = generateToken(user);

        console.log(`[注册成功] 用户: ${newUser.username}, ID: ${newUser.id}`);

        return { user, token };
    } catch (error) {
        console.error('[注册服务错误]:', error);
        return { error: '服务器错误，请稍后重试' };
    }
};

// 用户登录
export const loginUser = async (data: LoginData): Promise<{ user: AuthUser; token: string } | { error: string }> => {
    try {
        // 记录登录尝试
        const loginType = data.identifier.includes('@') ? 'email' : 'phone';
        console.log(`[登录尝试] 类型: ${loginType}, 标识符: ${data.identifier}`);

        // 查找用户（通过邮箱或手机号）
        let userDataResult;
        if (data.identifier.includes('@')) {
            userDataResult = await pool.query(
                'SELECT id, username, email, phone, password_hash, is_active FROM auth_users WHERE email = $1',
                [data.identifier]
            );
        } else {
            userDataResult = await pool.query(
                'SELECT id, username, email, phone, password_hash, is_active FROM auth_users WHERE phone = $1',
                [data.identifier]
            );
        }

        // 检查用户是否存在
        if (userDataResult.rows.length === 0) {
            console.log(`[登录失败] 用户不存在: ${data.identifier}`);
            // 为了安全性，不透露用户是否存在
            return { error: '邮箱/手机号或密码错误' };
        }

        const userData = userDataResult.rows[0];

        // 检查账户是否被禁用
        if (!userData.is_active) {
            console.log(`[登录失败] 账户已被禁用: ${userData.username}`);
            return { error: '账户已被禁用，请联系管理员' };
        }

        // 验证密码
        const isPasswordValid = await verifyPassword(data.password, userData.password_hash);

        if (!isPasswordValid) {
            console.log(`[登录失败] 密码错误: ${userData.username}`);
            return { error: '邮箱/手机号或密码错误' };
        }

        // 更新最后登录时间
        await pool.query(
            'UPDATE auth_users SET last_login = $1 WHERE id = $2',
            [new Date().toISOString(), userData.id]
        );

        const user: AuthUser = {
            id: userData.id,
            username: userData.username,
            email: userData.email,
            phone: userData.phone,
        };

        const token = generateToken(user);

        console.log(`[登录成功] 用户: ${userData.username}, ID: ${userData.id}`);

        return { user, token };
    } catch (error) {
        console.error('[登录服务错误]:', error);
        return { error: '服务器错误，请稍后重试' };
    }
};

// 根据Token获取用户信息
export const getUserFromToken = async (token: string): Promise<AuthUser | null> => {
    const decoded = verifyToken(token);
    if (!decoded) return null;

    try {
        const userDataResult = await pool.query(
            'SELECT id, username, email, phone FROM auth_users WHERE id = $1',
            [decoded.id]
        );

        if (userDataResult.rows.length === 0) return null;

        const userData = userDataResult.rows[0];

        return {
            id: userData.id,
            username: userData.username,
            email: userData.email,
            phone: userData.phone,
        };
    } catch (error) {
        console.error('Token验证错误:', error);
        return null;
    }
};
