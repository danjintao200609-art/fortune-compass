# Vercel 部署指南

## 前置条件
- 已注册 Vercel 账号
- 已安装 Node.js 和 npm
- 已安装 Git

## 部署步骤

### 步骤 1: 安装 Vercel CLI
```bash
npm install -g vercel
```

### 步骤 2: 登录 Vercel
```bash
vercel login
```
- 选择登录方式（邮箱/ GitHub/ GitLab/ Bitbucket）
- 在浏览器中完成登录认证

### 步骤 3: 初始化并部署项目
```bash
# 进入项目根目录
cd 项目根目录

# 初始化 Vercel 配置
vercel init

# 部署到生产环境
vercel --prod
```

### 步骤 4: 配置环境变量

1. 登录 [Vercel 控制台](https://vercel.com/dashboard)
2. 找到你的项目
3. 进入 `Settings` → `Environment Variables`
4. 添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `GEMINI_API_KEY` | 你的 Gemini API Key | Gemini 服务密钥 |
| `SUPABASE_URL` | 你的 Supabase URL | Supabase 数据库地址 |
| `SUPABASE_KEY` | 你的 Supabase Key | Supabase 访问密钥 |

5. 点击 `Save` 保存配置

### 步骤 5: 重新部署
```bash
vercel --prod
```

## 后端部署（可选）

如果需要同时部署后端服务，你可以：

1. 将后端代码部署到 Vercel 作为 Serverless Functions
2. 或者将后端部署到其他平台（如腾讯云函数、阿里云函数计算）

### 选项 1: 部署后端到 Vercel

1. 在项目根目录创建 `api` 目录（如果已存在则跳过）
2. 将后端代码转换为 Vercel Serverless Functions 格式
3. 重新部署项目

### 选项 2: 部署后端到其他平台

1. 按照 `国内免费部署指南.md` 中的后端部署步骤操作
2. 在 Vercel 项目中配置 `VITE_API_URL` 环境变量指向后端地址

## 常见问题

### 1. 构建失败
- 检查是否有依赖缺失：`npm install`
- 检查是否有语法错误：运行 `npm run build` 本地测试
- 检查 Vercel 构建日志获取详细错误信息

### 2. 环境变量不生效
- 确保已在 Vercel 控制台正确配置环境变量
- 确保变量名大小写一致
- 重新部署项目

### 3. 跨域问题
- 后端已配置 CORS，允许所有来源访问
- 如果遇到跨域错误，检查前端请求地址是否正确

## 访问项目

部署成功后，你将获得一个 Vercel 提供的域名，例如：
```
https://fortune-compass.vercel.app
```

你可以通过这个域名访问你的项目。

## 自定义域名（可选）

1. 在 Vercel 控制台进入项目 `Settings` → `Domains`
2. 添加你的自定义域名
3. 按照提示配置 DNS 解析
4. 等待 DNS 生效（通常需要几分钟到几小时）

## 后续维护

- 推送代码到 GitHub/ GitLab/ Bitbucket 会触发自动部署
- 可以在 Vercel 控制台查看部署历史和日志
- 可以回滚到之前的部署版本

## 相关链接

- [Vercel 文档](https://vercel.com/docs)
- [Vercel CLI 文档](https://vercel.com/docs/cli)
- [Serverless Functions 文档](https://vercel.com/docs/functions/serverless-functions)
