import { supabase } from '../lib/supabase'

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
        // 使用 Supabase Auth 注册
        const { data: authData, error } = await supabase.auth.signUp({
            email: data.email!,
            password: data.password,
            options: {
                data: {
                    username: data.username
                }
            }
        })

        if (error) {
            return { error: error.message || '注册失败' };
        }

        if (!authData.user || !authData.session) {
            return { error: '注册失败，请稍后重试' };
        }

        const user: AuthUser = {
            id: authData.user.id,
            username: data.username,
            email: authData.user.email
        };

        return {
            user,
            token: authData.session.access_token
        };
    } catch (error) {
        console.error('注册错误:', error);
        return { error: '网络错误，请稍后重试' };
    }
};

// 登录
export const login = async (data: LoginData): Promise<{ user: AuthUser; token: string } | { error: string }> => {
    try {
        // 使用 Supabase Auth 登录
        const { data: authData, error } = await supabase.auth.signInWithPassword({
            email: data.identifier,
            password: data.password
        })

        if (error) {
            return { error: error.message || '登录失败' };
        }

        if (!authData.user || !authData.session) {
            return { error: '登录失败，请检查用户名和密码' };
        }

        const user: AuthUser = {
            id: authData.user.id,
            username: authData.user.user_metadata?.username || authData.user.email?.split('@')[0] || 'User',
            email: authData.user.email
        };

        return {
            user,
            token: authData.session.access_token
        };
    } catch (error) {
        console.error('登录错误:', error);
        return { error: '网络错误，请稍后重试' };
    }
};

// 登出
export const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
};

// 获取当前 token
export const getToken = (): string | null => {
    // Supabase 会自动管理 token，但我们提供这个方法保持兼容性
    return localStorage.getItem('supabase.auth.token') || null;
};

// 获取当前用户 (同步获取可能不准确，建议使用 verifyToken)
export const getCurrentUser = (): AuthUser | null => {
    // 遍历 localStorage 找到 Supabase 的 key
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('auth-token') && (key.startsWith('sb-') || key.startsWith('supabase.'))) {
            const sessionStr = localStorage.getItem(key);
            if (sessionStr) {
                try {
                    const session = JSON.parse(sessionStr);
                    const user = session.user || session;
                    if (user && user.id) {
                        return {
                            id: user.id,
                            username: user.user_metadata?.username || user.email?.split('@')[0] || 'User',
                            email: user.email
                        };
                    }
                } catch (e) { }
            }
        }
    }
    return null;
};


// 验证 token 是否有效
export const verifyToken = async (): Promise<AuthUser | null> => {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
            return null;
        }

        const user: AuthUser = {
            id: session.user.id,
            username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'User',
            email: session.user.email
        };

        return user;
    } catch (error) {
        console.error('Token验证错误:', error);
        return null;
    }
};

// 检查是否已登录
export const isAuthenticated = async (): Promise<boolean> => {
    const user = await verifyToken();
    return !!user;
};
