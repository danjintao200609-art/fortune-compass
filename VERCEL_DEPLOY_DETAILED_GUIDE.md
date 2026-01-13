# Vercel 详细部署指南

## 项目准备

### 1. 检查项目结构
确保项目包含以下文件：
- `vercel.json` - Vercel配置文件
- `api/index.js` - 后端API入口
- `package.json` - 项目依赖配置

### 2. 构建后端代码
```bash
# 进入后端目录
cd server

# 安装依赖
npm install

# 构建后端代码
npm run build
```

### 3. 检查前端构建
```bash
# 返回项目根目录
cd ..

# 安装依赖
npm install

# 构建前端代码
npm run build
```

## 部署方式

### 方式 1: 手动部署（推荐）

#### 步骤 1: 登录 Vercel
1. 访问 [Vercel 控制台](https://vercel.com/dashboard)
2. 登录或注册账号

#### 步骤 2: 创建新项目
1. 点击 "Add New" → "Project"
2. 选择 "Import Git Repository"
3. 输入你的 GitHub 仓库地址（`https://github.com/danjintao200609-art/fortune-compass.git`）
4. 点击 "Import"

#### 步骤 3: 配置项目
1. **Project Name**: 保持默认或自定义
2. **Framework Preset**: 选择 "Vite"
3. **Root Directory**: 保持默认
4. **Build and Output Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. **Environment Variables**: 添加以下变量（可选，可在部署后添加）
   - `GEMINI_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
6. 点击 "Deploy"

#### 步骤 4: 等待部署完成
- 部署过程可能需要几分钟
- 部署完成后，你将获得一个 Vercel 域名

### 方式 2: Vercel CLI 部署

#### 步骤 1: 安装 Vercel CLI
```bash
npm install -g vercel
```

#### 步骤 2: 登录 Vercel
```bash
vercel login
```
- 选择登录方式（邮箱/ GitHub/ GitLab/ Bitbucket）
- 在浏览器中完成登录认证

#### 步骤 3: 部署项目
```bash
# 进入项目根目录
cd 项目根目录

# 部署到预览环境
vercel

# 部署到生产环境
vercel --prod
```

### 方式 3: GitHub Actions 自动部署

#### 步骤 1: 创建 GitHub Actions 配置文件
```bash
mkdir -p .github/workflows
```

#### 步骤 2: 编写部署配置
创建 `.github/workflows/vercel-deploy.yml` 文件：
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm install
      
      - name: Build backend
        run: cd server && npm install && npm run build
      
      - name: Build frontend
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: ${{ secrets.VERCEL_TEAM_ID }}
          production: ${{ github.event_name == 'push' && github.ref == 'refs/heads/main' }}
```

#### 步骤 3: 配置 GitHub Secrets
1. 登录 Vercel 控制台
2. 访问 [Account Settings](https://vercel.com/account/tokens) → [Tokens](https://vercel.com/account/tokens)
3. 创建一个新的 token，命名为 "GitHub Actions"
4. 登录 GitHub，进入仓库的 "Settings" → "Secrets and variables" → "Actions"
5. 添加以下 secrets：
   - `VERCEL_TOKEN`: 你的 Vercel token
   - `VERCEL_ORG_ID`: 组织 ID（在 Vercel 控制台 "Settings" → "General" 中找到）
   - `VERCEL_PROJECT_ID`: 项目 ID（在 Vercel 控制台 "Settings" → "General" 中找到）
   - `VERCEL_TEAM_ID`: 团队 ID（可选，如果使用团队账户）

## 环境变量配置

### 必要的环境变量

| 变量名 | 类型 | 说明 |
|--------|------|------|
| `GEMINI_API_KEY` | 必填 | Gemini API 密钥 |
| `SUPABASE_URL` | 必填 | Supabase 数据库 URL |
| `SUPABASE_KEY` | 必填 | Supabase 访问密钥 |
| `JWT_SECRET` | 可选 | JWT 签名密钥（默认使用随机值） |

### 配置方式

1. **Vercel 控制台**
   - 进入项目 → `Settings` → `Environment Variables`
   - 点击 "Add" 按钮添加变量
   - 点击 "Save" 保存

2. **`.env` 文件**（本地开发）
   ```env
   GEMINI_API_KEY=your-gemini-api-key
   SUPABASE_URL=your-supabase-url
   SUPABASE_KEY=your-supabase-key
   JWT_SECRET=your-jwt-secret
   ```

## 验证部署

### 1. 检查部署状态
- 访问 Vercel 控制台，查看部署日志
- 确保没有错误信息

### 2. 测试 API
```bash
# 测试健康检查端点
curl https://your-vercel-domain.vercel.app/api/health

# 测试认证端点
curl -X POST https://your-vercel-domain.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123"}'
```

### 3. 访问前端
- 在浏览器中访问你的 Vercel 域名
- 测试注册、登录功能
- 测试核心功能

## 常见问题

### 1. 部署失败 - 构建错误
- **原因**: 依赖缺失或代码错误
- **解决方案**:
  ```bash
  # 本地测试构建
  npm run build
  
  # 检查错误信息并修复
  ```

### 2. API 无法访问
- **原因**: 后端代码未正确构建或配置错误
- **解决方案**:
  ```bash
  # 检查后端构建
  cd server && npm run build
  
  # 检查 api/index.js 中的导入路径
  ```

### 3. 环境变量不生效
- **原因**: 未在 Vercel 控制台配置环境变量
- **解决方案**:
  - 在 Vercel 控制台添加环境变量
  - 重新部署项目

### 4. 跨域问题
- **原因**: CORS 配置错误
- **解决方案**:
  - 检查 `server/src/app.ts` 中的 CORS 配置
  - 确保允许所有来源访问

## 自动部署最佳实践

1. **使用分支策略**
   - `main` 分支：生产环境
   - `develop` 分支：开发环境
   - 特性分支：功能开发

2. **添加部署保护**
   - 在 Vercel 控制台设置部署保护规则
   - 限制只有特定分支可以部署到生产环境

3. **监控部署状态**
   - 启用 Vercel 部署通知
   - 集成到 Slack 或其他团队工具

## 后续维护

1. **定期更新依赖**
   ```bash
   # 更新前端依赖
   npm update
   
   # 更新后端依赖
   cd server && npm update
   ```

2. **监控日志**
   - 访问 Vercel 控制台 → `Logs`
   - 查看 API 请求和错误信息

3. **回滚部署**
   - 访问 Vercel 控制台 → `Deployments`
   - 选择要回滚的版本，点击 "Redeploy"

## 相关链接

- [Vercel 文档](https://vercel.com/docs)
- [Vercel CLI 文档](https://vercel.com/docs/cli)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Supabase 文档](https://supabase.com/docs)

## 联系方式

如果遇到部署问题，可以：
- 查看 Vercel 部署日志
- 检查项目配置文件
- 参考本指南的常见问题部分
- 提交 Issue 到 GitHub 仓库
