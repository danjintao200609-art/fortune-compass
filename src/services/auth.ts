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
    identifier: string;
    password: string;
}

const getApiBase = (): string => {
    const envApiUrl = import.meta.env.VITE_API_URL;
    if (envApiUrl) {
        let url = envApiUrl.toString();
        // 移除末尾斜杠
        if (url.endsWith('/')) url = url.slice(0, -1);
        // 确保以 /api 结尾
        if (!url.endsWith('/api')) url += '/api';
        return url;
    }
    return '/api';
};

const API_BASE = getApiBase();

export const register = async (data: RegisterData): Promise<{ user: AuthUser; token: string } | { error: string }> => {
    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (!response.ok) return { error: result.error || '注册失败' };

        localStorage.setItem('user_id', result.user.id);
        localStorage.setItem('auth-token', result.token);
        localStorage.setItem(`user-${result.user.id}`, JSON.stringify(result.user));

        return result;
    } catch (error) {
        return { error: '网络错误，请稍后重试' };
    }
};

export const login = async (data: LoginData): Promise<{ user: AuthUser; token: string } | { error: string }> => {
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (!response.ok) return { error: result.error || '登录失败' };

        localStorage.setItem('user_id', result.user.id);
        localStorage.setItem('auth-token', result.token);
        localStorage.setItem(`user-${result.user.id}`, JSON.stringify(result.user));

        return result;
    } catch (error) {
        return { error: '网络错误，请稍后重试' };
    }
};

export const logout = async (): Promise<void> => {
    const userId = localStorage.getItem('user_id');
    localStorage.removeItem('user_id');
    localStorage.removeItem('auth-token');
    if (userId) localStorage.removeItem(`user-${userId}`);
};

export const getToken = (): string | null => localStorage.getItem('auth-token');

export const getCurrentUser = (): AuthUser | null => {
    try {
        const userId = localStorage.getItem('user_id');
        if (!userId) return null;
        const userStr = localStorage.getItem(`user-${userId}`);
        return userStr ? JSON.parse(userStr) : null;
    } catch {
        return null;
    }
};

export const verifyToken = async (): Promise<AuthUser | null> => getCurrentUser();

export const isAuthenticated = async (): Promise<boolean> => !!(await verifyToken());

export const getProfile = async (userId: string): Promise<any | null> => {
    try {
        const token = getToken();
        if (!token) return null;

        const response = await fetch(`${API_BASE}/profile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        return response.ok ? await response.json() : null;
    } catch {
        return null;
    }
};

export const updateProfile = async (userId: string, profileData: any): Promise<any | null> => {
    try {
        const token = getToken();
        if (!token) return null;

        const response = await fetch(`${API_BASE}/profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(profileData)
        });

        return response.ok ? await response.json() : null;
    } catch {
        return null;
    }
};