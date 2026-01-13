import { UserConfig, FortuneMode, FortuneResult } from '../../types';
import { supabase } from '../lib/supabase';

// The frontend service now delegates to the backend API via the Vite proxy.
// Base API URL is relative because of Vite proxy configuration in vite.config.ts
const API_BASE = '/api';

// Helper to get auth headers
const getAuthHeaders = (): HeadersInit => {
    // 优先从 Supabase 会话中获取 token
    let token = null;
    
    // 遍历 localStorage 找到 Supabase 的 token
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('auth-token') && (key.startsWith('sb-') || key.startsWith('supabase.'))) {
            const sessionStr = localStorage.getItem(key);
            if (sessionStr) {
                try {
                    const session = JSON.parse(sessionStr);
                    token = session.access_token || session.token;
                    break;
                } catch (e) {
                    console.error('解析 token 失败:', e);
                }
            }
        }
    }
    
    // 兼容旧的 auth_token 存储
    if (!token) {
        token = localStorage.getItem('auth_token');
    }
    
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
        console.log('[getProfile] 正在获取用户资料...');

        // 直接使用 Supabase SDK 查询
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('[getProfile] 请求失败:', error.message);
            return null;
        }

        console.log('[getProfile] 成功获取:', data);
        return data;
    } catch (e) {
        console.error("[getProfile] 失败:", e);
        return null;
    }
};

export const updateProfile = async (userId: string, data: any) => {
    try {
        console.log('[updateProfile] 正在保存资料:', data);

        // 使用 upsert 方法：如果记录不存在就插入，存在就更新
        const { data: result, error } = await supabase
            .from('profiles')
            .upsert({
                id: userId,
                nickname: data.nickname,
                gender: data.gender,
                birthday: data.birthday,
                signature: data.signature
            }, {
                onConflict: 'id'
            })
            .select()
            .single();

        if (error) {
            console.error('[updateProfile] 保存失败:', error.message);
            return null;
        }

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
            // 尝试获取错误信息
            let errorMessage = 'Failed to generate fortune';
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
            } catch (e) {
                // 如果无法解析错误信息，使用默认信息
            }
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        // 返回模拟数据，避免前端卡死
        return {
            direction: "SE",
            summary: "今日运势颇佳，东南方向大吉。适宜进行重要决策和商务洽谈。贵人运旺，宜多与他人交流合作。下午时段运势更佳，把握机会可事半功倍。",
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
