import { UserConfig, FortuneMode, FortuneResult } from '../../../types';

// 定义AI服务接口
export interface AIService {
  generateFortune: (config: UserConfig, mode: FortuneMode) => Promise<FortuneResult>;
  interpretDream: (dream: string) => Promise<string>;
  getOutfitSuggestion: () => Promise<{ colors: string[], accessory: string, quote: string }>;
}

// 豆包API服务实现
export class DoubaoService implements AIService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.DOUBAO_API_KEY || '';
    this.apiUrl = process.env.DOUBAO_API_URL || 'https://open.doubao.com/api/v1/chat/completions';
    
    if (!this.apiKey) {
      console.warn('⚠️ DOUBAO_API_KEY is not set, will use fallback data');
    }
  }

  // 生成运势
  async generateFortune(config: UserConfig, mode: FortuneMode): Promise<FortuneResult> {
    try {
      if (!this.apiKey) {
        throw new Error('Doubao API key is not set');
      }

      const prompt = `Generate a daily fortune tell result in JSON format for a user.\nUser Profile:\nBirthday: ${config.birthday}\nGender: ${config.gender}\nMode: ${mode}\n\nRequired JSON Structure:\n{\n  "direction": "N" | "S" | "E" | "W" | "NE" | "NW" | "SE" | "SW",\n  "summary": "String",\n  "luckyColor": "String",\n  "bestTime": "String",\n  "energyLabel": "String",\n  "energyValue": "String",\n  "luckyNumbers": [Number],\n  "mode": "${mode}"\n}\nLanguage: Chinese.\n\nImportant: Return only the JSON object, no other text!`;

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'doubao-pro',
          messages: [
            {
              role: 'system',
              content: 'You are a professional fortune teller. Generate fortune results in JSON format.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Doubao API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('Invalid response from Doubao API');
      }

      return JSON.parse(content) as FortuneResult;
    } catch (error) {
      console.error('DoubaoService generateFortune error:', error);
      return this.getFallbackFortune(mode);
    }
  }

  // 解析梦境
  async interpretDream(dream: string): Promise<string> {
    try {
      if (!this.apiKey) {
        throw new Error('Doubao API key is not set');
      }

      const prompt = `请帮我解析这个梦境：${dream}。

请按照以下格式提供详细的梦境解释：
1. 梦境整体解析：对梦境的基本理解和象征意义
2. 财运分析：从梦境中分析近期的财运状况
3. 五行分析：结合五行理论分析梦境的影响
4. 破解方法：如果梦境有不祥的预兆，请提供具体的破解方法
5. 综合建议：给出实际生活中的建议

要求：
- 语言通俗易懂，语气亲切温柔
- 分析要详细，涵盖财运和五行
- 如果梦境不祥，必须提供具体的破解方法
- 直接返回解析内容字符串，不要使用任何JSON格式
- 长度适中，不要过于冗长
`;

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'doubao-pro',
          messages: [
            {
              role: 'system',
              content: 'You are a professional dream interpreter with expertise in Chinese metaphysics, including fortune telling and five elements theory. Provide detailed dream interpretations with financial analysis, five elements analysis, and solutions for inauspicious dreams.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Doubao API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || '暂无梦境解析。';
    } catch (error) {
      console.error('DoubaoService interpretDream error:', error);
      return `梦境解析：
1. 梦境整体解析：${dream}
2. 财运分析：近期财运平稳，适合稳健投资
3. 五行分析：五行调和，运势顺畅
4. 破解方法：无不祥预兆，保持平常心即可
5. 综合建议：积极面对生活，把握机遇`;
    }
  }

  // 获取穿搭建议
  async getOutfitSuggestion(): Promise<{ colors: string[], accessory: string, quote: string }> {
    try {
      if (!this.apiKey) {
        throw new Error('Doubao API key is not set');
      }

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'doubao-pro',
          messages: [
            {
              role: 'system',
              content: 'You are a professional fashion advisor. Generate daily outfit suggestions in JSON format.'
            },
            {
              role: 'user',
              content: `Give me a daily outfit suggestion based on general good daily vibes.\nReturn JSON:\n{\n  "colors": ["String", "String", ...],\n  "accessory": "String",\n  "quote": "String"\n}\nLanguage: Chinese.\n\nImportant: Return only the JSON object, no other text!`
            }
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Doubao API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('Invalid response from Doubao API');
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('DoubaoService getOutfitSuggestion error:', error);
      return {
        colors: ["正红色", "亮金色"],
        accessory: "玉石挂件",
        quote: "鸿运当头，顺风顺水。"
      };
    }
  }

  // 获取回退数据
  private getFallbackFortune(mode: FortuneMode): FortuneResult {
    console.log('⚠️ 使用模拟运势数据');
    return {
      direction: "SE",
      summary: "今日运势颇佳，东南方向大吉。适宜进行重要决策和商务洽谈。贵人运旺，宜多与他人交流合作。下午时段运势更佳，把握机会可事半功倍。",
      luckyColor: "翡翠绿",
      bestTime: "午时（11:00-13:00）",
      energyLabel: "运势能量值",
      energyValue: "85%",
      luckyNumbers: [3, 8, 13, 21],
      mode: mode
    };
  }
}

// DeepSeek API服务实现
export class DeepSeekService implements AIService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY || '';
    this.apiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';
    
    if (!this.apiKey) {
      console.warn('⚠️ DEEPSEEK_API_KEY is not set, will use fallback data');
    }
  }

  // 生成运势
  async generateFortune(config: UserConfig, mode: FortuneMode): Promise<FortuneResult> {
    try {
      if (!this.apiKey) {
        throw new Error('DeepSeek API key is not set');
      }

      const prompt = `Generate a daily fortune tell result in JSON format for a user.\nUser Profile:\nBirthday: ${config.birthday}\nGender: ${config.gender}\nMode: ${mode}\n\nRequired JSON Structure:\n{\n  "direction": "N" | "S" | "E" | "W" | "NE" | "NW" | "SE" | "SW",\n  "summary": "String",\n  "luckyColor": "String",\n  "bestTime": "String",\n  "energyLabel": "String",\n  "energyValue": "String",\n  "luckyNumbers": [Number],\n  "mode": "${mode}"\n}\nLanguage: Chinese.\n\nImportant: Return only the JSON object, no other text!`;

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are a professional fortune teller. Generate fortune results in JSON format.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`DeepSeek API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('Invalid response from DeepSeek API');
      }

      return JSON.parse(content) as FortuneResult;
    } catch (error) {
      console.error('DeepSeekService generateFortune error:', error);
      return this.getFallbackFortune(mode);
    }
  }

  // 解析梦境
  async interpretDream(dream: string): Promise<string> {
    try {
      if (!this.apiKey) {
        throw new Error('DeepSeek API key is not set');
      }

      const prompt = `请帮我解析这个梦境：${dream}。

请按照以下格式提供详细的梦境解释：
1. 梦境整体解析：对梦境的基本理解和象征意义
2. 财运分析：从梦境中分析近期的财运状况
3. 五行分析：结合五行理论分析梦境的影响
4. 破解方法：如果梦境有不祥的预兆，请提供具体的破解方法
5. 综合建议：给出实际生活中的建议

要求：
- 语言通俗易懂，语气亲切温柔
- 分析要详细，涵盖财运和五行
- 如果梦境不祥，必须提供具体的破解方法
- 直接返回解析内容字符串，不要使用任何JSON格式
- 长度适中，不要过于冗长
`;

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are a professional dream interpreter with expertise in Chinese metaphysics, including fortune telling and five elements theory. Provide detailed dream interpretations with financial analysis, five elements analysis, and solutions for inauspicious dreams.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`DeepSeek API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || '暂无梦境解析。';
    } catch (error) {
      console.error('DeepSeekService interpretDream error:', error);
      return `梦境解析：
1. 梦境整体解析：${dream}
2. 财运分析：近期财运平稳，适合稳健投资
3. 五行分析：五行调和，运势顺畅
4. 破解方法：无不祥预兆，保持平常心即可
5. 综合建议：积极面对生活，把握机遇`;
    }
  }

  // 获取穿搭建议
  async getOutfitSuggestion(): Promise<{ colors: string[], accessory: string, quote: string }> {
    try {
      if (!this.apiKey) {
        throw new Error('DeepSeek API key is not set');
      }

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are a professional fashion advisor. Generate daily outfit suggestions in JSON format.'
            },
            {
              role: 'user',
              content: `Give me a daily outfit suggestion based on general good daily vibes.\nReturn JSON:\n{\n  "colors": ["String", "String", ...],\n  "accessory": "String",\n  "quote": "String"\n}\nLanguage: Chinese.\n\nImportant: Return only the JSON object, no other text!`
            }
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`DeepSeek API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('Invalid response from DeepSeek API');
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('DeepSeekService getOutfitSuggestion error:', error);
      return {
        colors: ["正红色", "亮金色"],
        accessory: "玉石挂件",
        quote: "鸿运当头，顺风顺水。"
      };
    }
  }

  // 获取回退数据
  private getFallbackFortune(mode: FortuneMode): FortuneResult {
    console.log('⚠️ 使用模拟运势数据');
    return {
      direction: "SE",
      summary: "今日运势平稳，建议以稳为主。适合处理日常事务，不宜做出重大决策。西北方向有贵人相助，可适当寻求他人意见。",
      luckyColor: "蓝色",
      bestTime: "申时（15:00-17:00）",
      energyLabel: "运势能量值",
      energyValue: "75%",
      luckyNumbers: [2, 7, 12, 19],
      mode: mode
    };
  }
}

// AI服务工厂函数
export const getAIService = (): AIService => {
  const serviceType = process.env.AI_SERVICE_TYPE || 'doubao';
  
  console.log(`🔄 使用AI服务: ${serviceType}`);
  
  switch (serviceType.toLowerCase()) {
    case 'deepseek':
      return new DeepSeekService();
    case 'doubao':
    default:
      return new DoubaoService();
  }
};

// 导出默认AI服务
export const aiService = getAIService();
