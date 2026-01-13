import { UserConfig, FortuneMode, FortuneResult } from '../../types';

// The frontend service now delegates to the backend API via the Vite proxy.
// Base API URL is relative because of Vite proxy configuration in vite.config.ts
const API_BASE = '/api';

// Helper to get auth headers
const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('auth_token');
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

// --- Profile Services ---
// Note: We still use localStorage for profile persistence on the client side for speed,
// or we can defer to the backend profile endpoints if we want full synchronization.
// Given the user asked to check backend api.ts which had fetch('/api/profile'), 
// we should probably use the backend for profile too if available.
// However, to ensure stability, let's look at what server/src/services/api.ts did.
// It did: fetch(`${API_BASE}/profile`).
// So we will replicate that here.

export const getProfile = async (userId: string) => {
    try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.log('[getProfile] 无 token，跳过请求');
            return null;
        }

        console.log('[getProfile] 正在获取用户资料...');
        const response = await fetch(`${API_BASE}/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            console.error('[getProfile] 请求失败:', response.status);
            return null;
        }

        const data = await response.json();
        console.log('[getProfile] 成功获取:', data);
        return data;
    } catch (e) {
        console.error("[getProfile] 失败:", e);
        return null;
    }
};

export const updateProfile = async (userId: string, data: any) => {
    try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.log('[updateProfile] 无 token，无法保存');
            return null;
        }

        console.log('[updateProfile] 正在保存资料:', data);
        const response = await fetch(`${API_BASE}/profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            console.error('[updateProfile] 保存失败:', response.status);
            return null;
        }

        const result = await response.json();
        console.log('[updateProfile] 保存成功:', result);
        return result;
    } catch (e) {
        console.error("[updateProfile] 失败:", e);
        return null;
    }
};

// --- AI Services ---

export const generateFortune = async (config: UserConfig, mode: FortuneMode = 'fengshui'): Promise<FortuneResult> => {
    try {
        const response = await fetch(`${API_BASE}/fortune`, {
            method: 'POST',
            headers: getAuthHeaders(),
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
            headers: getAuthHeaders(),
            body: JSON.stringify({ dream }),
        });
        const data = await response.json();
        return data.result;
    } catch (error) {
        console.error("API Error:", error);
        return "网络连接异常，请稍后再试。";
    }
};

export const getOutfitSuggestion = async (): Promise<{ colors: string[], accessory: string, quote: string }> => {
    try {
        const response = await fetch(`${API_BASE}/outfit`, {
            headers: getAuthHeaders(),
        });
        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        return { colors: ["正红色", "亮金色"], accessory: "玉石挂件", quote: "鸿运当头，顺风顺水。" };
    }
};
