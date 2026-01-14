import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const TOKEN_EXPIRY = '7d';

export interface RegisterData {
    username: string;
    email?: string;
    phone?: string;
    password: string;
}

export interface LoginData {
    identifier: string;
    password: string;
}

export interface AuthUser {
    id: string;
    username: string;
    email?: string;
    phone?: string;
}

export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
};

export const generateToken = (user: AuthUser): string => {
    return jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY }
    );
};

export const verifyToken = (token: string): AuthUser | null => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
        return decoded;
    } catch (error) {
        return null;
    }
};

export const registerUser = async (data: RegisterData): Promise<{ user: AuthUser; token: string } | { error: string }> => {
    try {
        if (!data.email && !data.phone) {
            return { error: '请提供邮箱或手机号' };
        }

        if (data.password.length < 6) {
            return { error: '密码至少需要6位字符' };
        }

        const existingUserResult = await pool.query(
            'SELECT id FROM auth_users WHERE username = $1',
            [data.username]
        );

        if (existingUserResult.rows.length > 0) {
            return { error: '用户名已被使用' };
        }

        if (data.email) {
            const existingEmailResult = await pool.query(
                'SELECT id FROM auth_users WHERE email = $1',
                [data.email]
            );

            if (existingEmailResult.rows.length > 0) {
                return { error: '邮箱已被注册' };
            }
        }

        if (data.phone) {
            const existingPhoneResult = await pool.query(
                'SELECT id FROM auth_users WHERE phone = $1',
                [data.phone]
            );

            if (existingPhoneResult.rows.length > 0) {
                return { error: '手机号已被注册' };
            }
        }

        const passwordHash = await hashPassword(data.password);

        const getNextUserId = async (): Promise<string> => {
            const maxIdResult = await pool.query(
                'SELECT COALESCE(MAX(id::integer), 202599) as max_id FROM auth_users'
            );
            const maxId = maxIdResult.rows[0].max_id;
            const nextId = maxId + 1;
            return nextId.toString();
        };

        const userId = await getNextUserId();

        const newUserResult = await pool.query(
            `INSERT INTO auth_users (id, username, email, phone, password_hash)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, username, email, phone`,
            [userId, data.username, data.email || null, data.phone || null, passwordHash]
        );

        if (newUserResult.rows.length === 0) {
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
        return { user, token };
    } catch (error) {
        return { error: '服务器错误，请稍后重试' };
    }
};

export const loginUser = async (data: LoginData): Promise<{ user: AuthUser; token: string } | { error: string }> => {
    try {
        const loginType = data.identifier.includes('@') ? 'email' : 'phone';

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

        if (userDataResult.rows.length === 0) {
            return { error: '邮箱/手机号或密码错误' };
        }

        const userData = userDataResult.rows[0];

        if (!userData.is_active) {
            return { error: '账户已被禁用，请联系管理员' };
        }

        const isPasswordValid = await verifyPassword(data.password, userData.password_hash);

        if (!isPasswordValid) {
            return { error: '邮箱/手机号或密码错误' };
        }

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
        return { user, token };
    } catch (error) {
        return { error: '服务器错误，请稍后重试' };
    }
};

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
        return null;
    }
};
