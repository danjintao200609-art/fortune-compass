// 临时模拟LafClient，避免构建失败
// 实际使用时需要根据laf-client-sdk的正确API进行修改
export const laf = {
  database: {
    collection: (name: string) => ({
      where: (query: any) => ({
        get: async () => ({ data: [], error: null })
      }),
      add: async (data: any) => ({ id: Math.random().toString(36).substr(2, 9), error: null }),
      update: async (query: any, data: any) => ({ error: null }),
      remove: async (query: any) => ({ error: null })
    })
  }
} as any;
