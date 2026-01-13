import { UserConfig, FortuneResult, FortuneMode } from "@/types";

// Base API URL is relative because of Vite proxy
const API_BASE = '/api';

export const generateFortune = async (config: UserConfig, mode: FortuneMode = 'fengshui'): Promise<FortuneResult> => {
    try {
        const response = await fetch(`${API_BASE}/fortune`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'x-user-id': 'current-user-id' // TODO: Add auth
            },
            body: JSON.stringify({ config, mode }),
        });

        if (!response.ok) {
            throw new Error('Failed to generate fortune');
        }

        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};

export const interpretDream = async (dream: string): Promise<string> => {
    try {
        const response = await fetch(`${API_BASE}/dream`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dream }),
        });
        const data = await response.json();
        return data.result;
    } catch (error) {
        console.error("API Error:", error);
        return "网络连接异常，请稍后再试。";
    }
};

export const getOutfitSuggestion = async () => {
    try {
        const response = await fetch(`${API_BASE}/outfit`);
        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        return { colors: ["正红色", "亮金色"], accessory: "玉石挂件", quote: "鸿运当头，顺风顺水。" };
    }
};

export const getProfile = async (userId: string) => {
    try {
        // 从localStorage获取token
        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.log('[getProfile] 没有token');
            return null;
        }

        const response = await fetch(`${API_BASE}/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            console.log('[getProfile] 请求失败:', response.status);
            return null;
        }

        const data = await response.json();
        console.log('[getProfile] 成功获取:', data);
        return data;
    } catch (e) {
        console.error('[getProfile] 错误:', e);
        return null;
    }
}

export const updateProfile = async (userId: string, data: any) => {
    try {
        // 从localStorage获取token
        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.log('[updateProfile] 没有token');
            return null;
        }

        console.log('[updateProfile] 更新数据:', data);

        const response = await fetch(`${API_BASE}/profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            console.error('[updateProfile] 请求失败:', response.status);
            return null;
        }

        const result = await response.json();
        console.log('[updateProfile] 成功更新:', result);
        return result;
    } catch (e) {
        console.error('[updateProfile] 错误:', e);
        return null;
    }
}
