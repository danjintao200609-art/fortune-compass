const API_BASE = '/api/auth';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export interface AuthUser {
    id: string;
    username: string;
    email?: string;
    phone?: string;
}

export interface RegisterData {
    username: string;
    email?: string;
    phone?: string;
    password: string;
}

export interface LoginData {
    identifier: string; // 邮箱或手机号
    password: string;
}

// 注册
export const register = async (data: RegisterData): Promise<{ user: AuthUser; token: string } | { error: string }> => {
    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            return { error: result.error || '注册失败' };
        }

        // 保存 token 和用户信息
        localStorage.setItem(TOKEN_KEY, result.token);
        localStorage.setItem(USER_KEY, JSON.stringify(result.user));

        return { user: result.user, token: result.token };
    } catch (error) {
        console.error('注册错误:', error);
        return { error: '网络错误，请稍后重试' };
    }
};

// 登录
export const login = async (data: LoginData): Promise<{ user: AuthUser; token: string } | { error: string }> => {
    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            return { error: result.error || '登录失败' };
        }

        // 保存 token 和用户信息
        localStorage.setItem(TOKEN_KEY, result.token);
        localStorage.setItem(USER_KEY, JSON.stringify(result.user));

        return { user: result.user, token: result.token };
    } catch (error) {
        console.error('登录错误:', error);
        return { error: '网络错误，请稍后重试' };
    }
};

// 登出
export const logout = (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

// 获取当前 token
export const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
};

// 获取当前用户
export const getCurrentUser = (): AuthUser | null => {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch {
        return null;
    }
};

// 验证 token 是否有效
export const verifyToken = async (): Promise<AuthUser | null> => {
    const token = getToken();
    if (!token) return null;

    try {
        const response = await fetch(`${API_BASE}/me`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
            // Token 无效，清除本地存储
            logout();
            return null;
        }

        const result = await response.json();
        return result.user;
    } catch (error) {
        console.error('Token验证错误:', error);
        logout();
        return null;
    }
};

// 检查是否已登录
export const isAuthenticated = (): boolean => {
    return !!getToken();
};
