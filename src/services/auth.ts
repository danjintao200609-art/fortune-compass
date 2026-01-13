// 从后端API获取认证服务

// API基础URL - 支持环境变量配置
// 开发环境使用代理路径 /api
// 生产环境需要配置绝对路径
const getApiBase = (): string => {
  const envApiUrl = import.meta.env.VITE_API_URL;
  if (envApiUrl) {
    return envApiUrl;
  }
  // 默认使用代理路径（本地开发）
  return '/api';
};

const API_BASE = getApiBase();

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
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        
        if (!response.ok) {
            return { error: result.error || '注册失败，请稍后重试' };
        }

        // 保存到localStorage
        localStorage.setItem('user_id', result.user.id);
        localStorage.setItem('auth-token', result.token);
        localStorage.setItem(`user-${result.user.id}`, JSON.stringify(result.user));

        return result;
    } catch (error) {
        console.error('注册错误:', error);
        return { error: '网络错误，请稍后重试' };
    }
};

// 登录
export const login = async (data: LoginData): Promise<{ user: AuthUser; token: string } | { error: string }> => {
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        
        if (!response.ok) {
            return { error: result.error || '登录失败，请稍后重试' };
        }

        // 保存到localStorage
        localStorage.setItem('user_id', result.user.id);
        localStorage.setItem('auth-token', result.token);
        localStorage.setItem(`user-${result.user.id}`, JSON.stringify(result.user));

        return result;
    } catch (error) {
        console.error('登录错误:', error);
        return { error: '网络错误，请稍后重试' };
    }
};

// 登出
export const logout = async (): Promise<void> => {
    // 清除localStorage中的认证信息
    const userId = localStorage.getItem('user_id');
    localStorage.removeItem('user_id');
    localStorage.removeItem('auth-token');
    if (userId) {
        localStorage.removeItem(`user-${userId}`);
    }
};

// 获取当前 token
export const getToken = (): string | null => {
    return localStorage.getItem('auth-token') || null;
};

// 获取当前用户 (同步获取)
export const getCurrentUser = (): AuthUser | null => {
    try {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
            return null;
        }

        const userStr = localStorage.getItem(`user-${userId}`);
        if (!userStr) {
            return null;
        }

        const user = JSON.parse(userStr);
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            phone: user.phone,
        };
    } catch (error) {
        console.error('获取当前用户错误:', error);
        return null;
    }
};

// 验证 token 是否有效
export const verifyToken = async (): Promise<AuthUser | null> => {
    return getCurrentUser();
};

// 检查是否已登录
export const isAuthenticated = async (): Promise<boolean> => {
    const user = await verifyToken();
    return !!user;
};

// 获取用户个人资料
export const getProfile = async (userId: string): Promise<any | null> => {
    try {
        const token = getToken();
        if (!token) {
            return null;
        }

        const response = await fetch(`${API_BASE}/profile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('获取个人资料错误:', error);
        return null;
    }
};

// 更新用户个人资料
export const updateProfile = async (userId: string, profileData: any): Promise<any | null> => {
    try {
        const token = getToken();
        if (!token) {
            return null;
        }

        const response = await fetch(`${API_BASE}/profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(profileData)
        });

        if (!response.ok) {
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('更新个人资料错误:', error);
        return null;
    }
};