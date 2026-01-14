import { UserConfig, FortuneMode, FortuneResult } from '../../types';

const getApiBase = (): string => {
    let envApiUrl = import.meta.env.VITE_API_URL;
    if (envApiUrl) {
        if (envApiUrl.endsWith('/')) envApiUrl = envApiUrl.slice(0, -1);
        if (envApiUrl.startsWith('http') && !envApiUrl.endsWith('/api')) {
            envApiUrl += '/api';
        }
        return envApiUrl;
    }
    return '/api';
};

const API_BASE = getApiBase();

const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('auth-token') || '';
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
};

export const getProfile = async (userId: string) => {
    try {
        const response = await fetch(`${API_BASE}/profile`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return response.ok ? await response.json() : null;
    } catch {
        return null;
    }
};

export const updateProfile = async (userId: string, data: any) => {
    try {
        const response = await fetch(`${API_BASE}/profile`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        return response.ok ? await response.json() : null;
    } catch {
        return null;
    }
};

export const generateFortune = async (config: UserConfig, mode: FortuneMode = 'fengshui', aiServiceType: string = 'doubao'): Promise<FortuneResult> => {
    try {
        const response = await fetch(`${API_BASE}/fortune`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ config, mode, aiServiceType }),
        });

        if (!response.ok) {
            let errorData = null;
            try { errorData = await response.json(); } catch { }
            if (errorData?.fallback && errorData?.data) return errorData.data;
            throw new Error(errorData?.error || 'Failed to generate fortune');
        }

        return await response.json();
    } catch (error) {
        return {
            direction: "SE",
            summary: "今日运势颇佳，东南方向大吉。适宜进行重要决策。下午时段运势更佳。",
            luckyColor: "翡翠绿",
            bestTime: "午时（11:00-13:00）",
            energyLabel: "运势能量值",
            energyValue: "85%",
            luckyNumbers: [3, 8, 13, 21],
            mode: mode
        } as FortuneResult;
    }
};

export const interpretDream = async (dream: string): Promise<string> => {
    try {
        const response = await fetch(`${API_BASE}/dream`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ dream }),
        });

        if (!response.ok) {
            let errorData = null;
            try { errorData = await response.json(); } catch { }
            return errorData?.error || '解析梦境失败';
        }

        const data = await response.json();
        return data.result;
    } catch {
        return "服务暂时不可用，请稍后再试。";
    }
};

export const getOutfitSuggestion = async (): Promise<{ colors: string[], accessory: string, quote: string }> => {
    try {
        const response = await fetch(`${API_BASE}/outfit`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            let errorData = null;
            try { errorData = await response.json(); } catch { }
            if (errorData?.colors && errorData?.accessory && errorData?.quote) return errorData;
            return { colors: ["正红色", "亮金色"], accessory: "玉石挂件", quote: "鸿运当头，顺风顺水。" };
        }

        return await response.json();
    } catch {
        return {
            colors: ["正红色", "亮金色"],
            accessory: "玉石挂件",
            quote: "鸿运当头，顺风顺水。"
        };
    }
};
