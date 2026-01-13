import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../lib/supabase';

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
        const { data: existingUser } = await supabase
            .from('auth_users')
            .select('id')
            .eq('username', data.username)
            .single();

        if (existingUser) {
            console.log(`[注册失败] 用户名已存在: ${data.username}`);
            return { error: '用户名已被使用' };
        }

        // 检查邮箱是否已存在
        if (data.email) {
            const { data: existingEmail } = await supabase
                .from('auth_users')
                .select('id')
                .eq('email', data.email)
                .single();

            if (existingEmail) {
                console.log(`[注册失败] 邮箱已存在: ${data.email}`);
                return { error: '邮箱已被注册' };
            }
        }

        // 检查手机号是否已存在
        if (data.phone) {
            const { data: existingPhone } = await supabase
                .from('auth_users')
                .select('id')
                .eq('phone', data.phone)
                .single();

            if (existingPhone) {
                console.log(`[注册失败] 手机号已存在: ${data.phone}`);
                return { error: '手机号已被注册' };
            }
        }

        // 加密密码
        const passwordHash = await hashPassword(data.password);

        // 创建用户
        const { data: newUser, error } = await supabase
            .from('auth_users')
            .insert({
                username: data.username,
                email: data.email || null,
                phone: data.phone || null,
                password_hash: passwordHash,
            })
            .select('id, username, email, phone')
            .single();

        if (error) {
            console.error('[注册错误]:', error);
            return { error: '注册失败，请稍后重试' };
        }

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
        let query = supabase
            .from('auth_users')
            .select('id, username, email, phone, password_hash, is_active');

        // 判断identifier是邮箱还是手机号
        if (data.identifier.includes('@')) {
            query = query.eq('email', data.identifier);
        } else {
            query = query.eq('phone', data.identifier);
        }

        const { data: userData, error } = await query.single();

        // 检查用户是否存在
        if (error || !userData) {
            console.log(`[登录失败] 用户不存在: ${data.identifier}`);
            // 为了安全性，不透露用户是否存在
            return { error: '邮箱/手机号或密码错误' };
        }

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
        await supabase
            .from('auth_users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', userData.id);

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
        const { data: userData, error } = await supabase
            .from('auth_users')
            .select('id, username, email, phone')
            .eq('id', decoded.id)
            .single();

        if (error || !userData) return null;

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
