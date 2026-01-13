/// <reference types="vite/client" />

declare module '*.svg' {
  import React from 'react'
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>
  const src: string
  export default src
}

declare module '*.png'

declare module '*.jpg'

declare module '*.json'

// 扩展 Vite 的 ImportMetaEnv 接口，添加我们的环境变量
declare interface ImportMetaEnv {
  readonly VITE_MEMFIRE_URL: string;
  readonly VITE_MEMFIRE_KEY: string;
  // 其他环境变量...
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
