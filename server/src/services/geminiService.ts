import { GoogleGenerativeAI } from '@google/generative-ai';
import { UserConfig, FortuneMode, FortuneResult } from '../../../types';

// Lazy initialization to ensure dotenv loads first
let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

const initializeGemini = () => {
    if (!genAI) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not set in environment variables. Please check your .env file.');
        }
        console.log('✅ Initializing Gemini with API key:', apiKey.substring(0, 10) + '...');
        genAI = new GoogleGenerativeAI(apiKey);
        model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-lite",
            generationConfig: { responseMimeType: "application/json" }
        });
    }
    return { genAI, model };
};

export const generateFortune = async (userConfig: UserConfig, mode: FortuneMode): Promise<FortuneResult> => {
    try {
        const { model } = initializeGemini();
        const prompt = `Generate a daily fortune tell result in JSON format for a user.
    User Profile:
    Birthday: ${userConfig.birthday}
    Gender: ${userConfig.gender}
    Mode: ${mode}
    
    Required JSON Structure:
    {
      "direction": "N" | "S" | "E" | "W" | "NE" | "NW" | "SE" | "SW",
      "summary": "String",
      "luckyColor": "String",
      "bestTime": "String",
      "energyLabel": "String",
      "energyValue": "String",
      "luckyNumbers": [Number],
      "mode": "${mode}"
    }
    Language: Chinese.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return JSON.parse(text) as FortuneResult;
    } catch (error: any) {
        console.error("Gemini Service Error:", error);
        console.error("Error details:", error.message || error);

        // Return mock data if API fails (useful for testing)
        console.log('⚠️  Using mock fortune data due to API error');
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

export const interpretDream = async (dreamDescription: string): Promise<string> => {
    try {
        const { genAI } = initializeGemini();
        const textModel = genAI!.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
        const prompt = `请帮我解析这个梦境：${dreamDescription}。请给出心理学角度的分析和建议，语气温柔。直接返回解析内容字符串。`;
        const result = await textModel.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Gemini Service Error:", error);
        throw error;
    }
};

export const getOutfitSuggestion = async (): Promise<{ colors: string[], accessory: string, quote: string }> => {
    try {
        const { model } = initializeGemini();
        const prompt = `Give me a daily outfit suggestion based on general good daily vibes.
    Return JSON:
    {
      "colors": ["String", "String", ...],
      "accessory": "String",
      "quote": "String"
    }
    Language: Chinese.`;

        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text());
    } catch (error) {
        console.error("Gemini Service Error:", error);
        return { colors: ["#ffffff"], accessory: "无", quote: "暂无建议" };
    }
};
