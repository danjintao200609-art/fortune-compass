// 临时本地认证模拟实现
// 实际项目中应使用后端API进行认证

// 模拟用户数据库
const mockUsers: Map<string, { id: string; username: string; email: string; phone?: string; password: string }> = new Map();

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
        // 验证必填字段
        if (!data.email && !data.phone) {
            return { error: '请提供邮箱或手机号' };
        }

        // 检查用户是否已存在
        for (const user of mockUsers.values()) {
            if (user.email === data.email || user.phone === data.phone) {
                return { error: '该邮箱或手机号已被注册' };
            }
        }

        // 创建新用户
        const userId = Math.random().toString(36).substr(2, 9);
        const newUser = {
            id: userId,
            username: data.username,
            email: data.email || '',
            phone: data.phone,
            password: data.password // 实际项目中应使用密码哈希
        };

        // 保存用户到模拟数据库
        mockUsers.set(userId, newUser);

        // 生成模拟token
        const token = `mock-token-${userId}`;

        // 保存到localStorage
        localStorage.setItem('user_id', userId);
        localStorage.setItem('auth-token', token);
        localStorage.setItem(`user-${userId}`, JSON.stringify(newUser));

        return {
            user: {
                id: userId,
                username: data.username,
                email: data.email,
                phone: data.phone
            },
            token: token
        };
    } catch (error) {
        console.error('注册错误:', error);
        return { error: '网络错误，请稍后重试' };
    }
};

// 登录
export const login = async (data: LoginData): Promise<{ user: AuthUser; token: string } | { error: string }> => {
    try {
        // 查找用户
        let user = null;
        for (const u of mockUsers.values()) {
            if (u.email === data.identifier || u.phone === data.identifier) {
                user = u;
                break;
            }
        }

        if (!user) {
            return { error: '用户名或密码错误' };
        }

        // 验证密码
        if (user.password !== data.password) {
            return { error: '用户名或密码错误' };
        }

        // 生成模拟token
        const token = `mock-token-${user.id}`;

        // 保存到localStorage
        localStorage.setItem('user_id', user.id);
        localStorage.setItem('auth-token', token);
        localStorage.setItem(`user-${user.id}`, JSON.stringify(user));

        return {
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                phone: user.phone
            },
            token: token
        };
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
            phone: user.phone
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
