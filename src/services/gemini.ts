import { UserConfig, FortuneMode, FortuneResult } from '../../types';
import { supabase } from '../lib/supabase';

// The frontend service now delegates to the backend API via the Vite proxy.
// Base API URL is relative because of Vite proxy configuration in vite.config.ts
const API_BASE = '/api';

// Helper to get auth headers
const getAuthHeaders = async (): Promise<HeadersInit> => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    
    try {
        console.log('[getAuthHeaders] 开始获取认证头');
        
        // 使用 Supabase 客户端获取当前会话
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('[getAuthHeaders] 获取会话失败:', error);
            return headers;
        }
        
        if (session && session.access_token) {
            console.log('[getAuthHeaders] 从Supabase会话获取到token:', session.access_token);
            headers['Authorization'] = `Bearer ${session.access_token}`;
        } else {
            console.warn('[getAuthHeaders] 未找到有效的认证token');
        }
        
        return headers;
    } catch (error) {
        console.error('[getAuthHeaders] 发生错误:', error);
        return headers;
    }
};

// --- Profile Services ---
// 使用后端API获取和更新用户资料，确保安全性和正确性
export const getProfile = async (userId: string) => {
    try {
        console.log('[getProfile] 正在获取用户资料...');
        
        const headers = await getAuthHeaders();

        // 使用后端API获取用户资料
        const response = await fetch(`${API_BASE}/profile`, {
            method: 'GET',
            headers: headers,
        });

        if (!response.ok) {
            console.error('[getProfile] 请求失败:', response.statusText);
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
        console.log('[updateProfile] 正在保存资料:', data);
        
        const headers = await getAuthHeaders();

        // 使用后端API更新用户资料
        const response = await fetch(`${API_BASE}/profile`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            console.error('[updateProfile] 保存失败:', response.statusText);
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
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE}/fortune`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ config, mode }),
        });

        if (!response.ok) {
            // 尝试获取错误信息
            let errorMessage = 'Failed to generate fortune';
            let errorData = null;
            try {
                errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
            } catch (e) {
                // 如果无法解析错误信息，使用默认信息
            }
            
            // 如果返回了模拟数据，直接使用
            if (errorData?.fallback && errorData?.data) {
                console.warn('⚠️ 使用后端返回的模拟运势数据');
                return errorData.data as FortuneResult;
            }
            
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        // 返回模拟数据，避免前端卡死
        console.warn('⚠️ 使用前端模拟运势数据');
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
        const headers = await getAuthHeaders();
        console.log('[interpretDream] 调用API，dream:', dream, 'headers:', headers);
        
        const response = await fetch(`${API_BASE}/dream`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ dream }),
        });

        console.log('[interpretDream] API响应状态:', response.status);
        
        if (!response.ok) {
            // 尝试获取错误信息
            let errorMessage = '解析梦境失败';
            let errorData = null;
            try {
                errorData = await response.json();
                console.log('[interpretDream] API错误响应:', errorData);
                errorMessage = errorData.error || errorMessage;
            } catch (e) {
                console.error('[interpretDream] 解析错误响应失败:', e);
                // 如果无法解析错误信息，使用HTTP状态码作为参考
                if (response.status === 401) {
                    errorMessage = '未登录，请先登录';
                } else if (response.status >= 500) {
                    errorMessage = '服务器繁忙，请稍后再试';
                }
            }
            return errorMessage;
        }

        const data = await response.json();
        console.log('[interpretDream] API成功响应:', data);
        return data.result;
    } catch (error) {
        console.error("[interpretDream] API调用异常:", error);
        // 根据错误类型返回更准确的提示
        if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('network'))) {
            return "网络连接异常，请稍后再试。";
        }
        return "服务暂时不可用，请稍后再试。";
    }
};

export const getOutfitSuggestion = async (): Promise<{ colors: string[], accessory: string, quote: string }> => {
    try {
        const headers = await getAuthHeaders();
        console.log('[getOutfitSuggestion] 调用API，headers:', headers);
        
        const response = await fetch(`${API_BASE}/outfit`, {
            headers: headers,
        });

        console.log('[getOutfitSuggestion] API响应状态:', response.status);
        
        if (!response.ok) {
            // 尝试获取错误信息
            let errorMessage = '获取穿搭建议失败';
            let errorData = null;
            try {
                errorData = await response.json();
                console.log('[getOutfitSuggestion] API错误响应:', errorData);
                // 如果返回了模拟数据，直接使用
                if (errorData?.colors && errorData?.accessory && errorData?.quote) {
                    console.warn('⚠️ 使用后端返回的模拟穿搭数据');
                    return errorData;
                }
                errorMessage = errorData.error || errorMessage;
            } catch (e) {
                console.error('[getOutfitSuggestion] 解析错误响应失败:', e);
                // 如果无法解析错误信息，使用HTTP状态码作为参考
                if (response.status === 401) {
                    console.warn('⚠️ 未登录，使用前端模拟穿搭数据');
                } else if (response.status >= 500) {
                    console.warn('⚠️ 服务器错误，使用前端模拟穿搭数据');
                }
            }
            // 返回模拟数据，避免UI崩溃
            return { colors: ["正红色", "亮金色"], accessory: "玉石挂件", quote: "鸿运当头，顺风顺水。" };
        }

        const data = await response.json();
        console.log('[getOutfitSuggestion] API成功响应:', data);
        return data;
    } catch (error) {
        console.error("[getOutfitSuggestion] API调用异常:", error);
        // 返回模拟数据，避免前端卡死
        console.warn('⚠️ 使用前端模拟穿搭数据');
        return {
            colors: ["正红色", "亮金色"],
            accessory: "玉石挂件",
            quote: "鸿运当头，顺风顺水。"
        };
    }
};
