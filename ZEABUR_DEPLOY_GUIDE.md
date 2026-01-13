# Zeabur 部署指南

## 项目结构概述
- **前端**: React 19 + TypeScript + Vite
- **后端**: Node.js + Express + TypeScript
- **数据库**: Supabase
- **AI服务**: 豆包/DeepSeek（可切换）

## 部署准备

### 1. 注册Zeabur账号
- 访问 [Zeabur 官网](https://zeabur.com/)
- 点击 "Sign Up" 注册账号
- 支持 GitHub/ GitLab/ 邮箱注册

### 2. 安装Zeabur CLI（可选）
```bash
# 使用 npm 安装
npm install -g @zeabur/cli

# 使用 yarn 安装
yarn global add @zeabur/cli

# 登录 Zeabur
zeabur login
```

## 部署方式一：使用Zeabur控制台部署（推荐）

### 步骤1：部署前端

1. **登录Zeabur控制台**
   - 访问 [Zeabur 控制台](https://dash.zeabur.com/)
   - 点击 "Create Project" 创建新项目

2. **添加前端服务**
   - 在项目页面，点击 "Add Service"
   - 选择 "Git Repository"
   - 粘贴你的 GitHub 仓库地址：`https://github.com/danjintao200609-art/fortune-compass.git`
   - 点击 "Import"

3. **配置前端服务**
   - **Service Type**: 选择 "Static Website"
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Root Directory**: 保持为空（使用项目根目录）
   - 点击 "Deploy"

4. **等待部署完成**
   - 部署过程可能需要几分钟
   - 部署完成后，会生成一个 Zeabur 域名

### 步骤2：部署后端

1. **添加后端服务**
   - 在同一项目页面，点击 "Add Service"
   - 选择 "Git Repository"
   - 再次选择你的 GitHub 仓库

2. **配置后端服务**
   - **Service Type**: 选择 "Node.js"
   - **Build Command**: `cd server && npm install && npm run build`
   - **Start Command**: `cd server && npm start`
   - **Root Directory**: 保持为空
   - 点击 "Deploy"

3. **等待部署完成**
   - 部署过程可能需要几分钟
   - 部署完成后，会生成一个 Zeabur 域名

### 步骤3：配置环境变量

1. **前端环境变量**
   - 进入前端服务 → "Settings" → "Environment Variables"
   - 添加以下环境变量（如果需要）：
     - `VITE_SUPABASE_URL`: Supabase 数据库 URL
     - `VITE_SUPABASE_KEY`: Supabase 访问密钥
     - `VITE_API_URL`: 后端服务的 Zeabur 域名

2. **后端环境变量**
   - 进入后端服务 → "Settings" → "Environment Variables"
   - 添加以下环境变量：
     - `PORT`: 服务端口（默认 3000）
     - `SUPABASE_URL`: Supabase 数据库 URL
     - `SUPABASE_KEY`: Supabase 访问密钥
     - `AI_SERVICE_TYPE`: AI 服务类型（`doubao` 或 `deepseek`，默认 `doubao`）
     - `DOUBAO_API_KEY`: 豆包 API 密钥（可选，如果使用豆包）
     - `DEEPSEEK_API_KEY`: DeepSeek API 密钥（可选，如果使用 DeepSeek）
     - `JWT_SECRET`: JWT 签名密钥

3. **重新部署**
   - 点击服务右上角的 "Redeploy" 按钮
   - 确保环境变量生效

### 步骤4：配置域名（可选）

1. **进入域名管理**
   - 点击项目页面的 "Domains" 选项卡
   - 可以使用 Zeabur 提供的免费域名，或添加自定义域名

2. **添加自定义域名**
   - 点击 "Add Domain"
   - 输入你的自定义域名
   - 按照提示配置 DNS 解析
   - 等待 DNS 生效（通常需要几分钟到几小时）

## 部署方式二：使用Zeabur CLI部署

### 步骤1：初始化Zeabur项目
```bash
# 进入项目根目录
cd 项目根目录

# 初始化Zeabur项目
zeabur init
```

### 步骤2：部署前端
```bash
# 部署前端
zeabur deploy --name fortune-compass-frontend --build-command "npm run build" --output-directory "dist" --type static
```

### 步骤3：部署后端
```bash
# 部署后端
zeabur deploy --name fortune-compass-backend --build-command "cd server && npm install && npm run build" --start-command "cd server && npm start" --type node
```

### 步骤4：配置环境变量
```bash
# 设置前端环境变量
zeabur env set VITE_SUPABASE_URL "your-supabase-url" --service fortune-compass-frontend
zeabur env set VITE_SUPABASE_KEY "your-supabase-key" --service fortune-compass-frontend
zeabur env set VITE_API_URL "your-backend-url" --service fortune-compass-frontend

# 设置后端环境变量
zeabur env set PORT "3000" --service fortune-compass-backend
zeabur env set SUPABASE_URL "your-supabase-url" --service fortune-compass-backend
zeabur env set SUPABASE_KEY "your-supabase-key" --service fortune-compass-backend
zeabur env set AI_SERVICE_TYPE "doubao" --service fortune-compass-backend
zeabur env set DOUBAO_API_KEY "your-doubao-api-key" --service fortune-compass-backend
zeabur env set JWT_SECRET "your-jwt-secret" --service fortune-compass-backend
```

## 验证部署

### 1. 检查部署状态
- 访问 [Zeabur 控制台](https://dash.zeabur.com/)
- 进入你的项目，查看服务状态
- 确保所有服务都显示 "Running"

### 2. 测试前端
- 访问前端 Zeabur 域名
- 检查页面是否正常加载
- 测试注册、登录功能

### 3. 测试后端
- 访问后端 Zeabur 域名 + `/api/health`
- 示例：`https://your-backend-domain.zeabur.app/api/health`
- 应该返回：`{"status":"ok","message":"Backend is running"}`

### 4. 测试核心功能
- 点击 "开启运势" 按钮
- 检查是否能正常生成运势结果
- 检查是否有任何错误提示

## 常见问题

### 1. 前端部署失败
- **原因**: 依赖缺失或构建错误
- **解决方案**:
  ```bash
  # 本地测试构建
  npm install
  npm run build
  ```
  - 检查构建日志，修复错误后重新部署

### 2. 后端部署失败
- **原因**: 依赖缺失、构建错误或端口冲突
- **解决方案**:
  ```bash
  # 进入后端目录
  cd server
  
  # 安装依赖
  npm install
  
  # 测试构建
  npm run build
  ```
  - 检查构建日志，修复错误后重新部署

### 3. 环境变量不生效
- **原因**: 环境变量未正确设置或未重新部署
- **解决方案**:
  - 确保环境变量名称和值正确
  - 点击 "Redeploy" 按钮重新部署服务

### 4. 无法访问Supabase
- **原因**: Supabase URL或Key错误
- **解决方案**:
  - 检查Supabase控制台的项目设置
  - 确保环境变量中的URL和Key与Supabase控制台一致

### 5. AI服务无法使用
- **原因**: API密钥错误或服务类型配置错误
- **解决方案**:
  - 检查API密钥是否正确
  - 确保`AI_SERVICE_TYPE`环境变量设置正确（`doubao`或`deepseek`）

## 最佳实践

1. **使用分支部署**
   - 为不同环境创建不同分支（如`main`对应生产环境，`develop`对应开发环境）
   - 在Zeabur控制台配置自动部署规则

2. **定期备份数据**
   - 定期备份Supabase数据库
   - 保存重要的环境变量配置

3. **监控部署状态**
   - 开启Zeabur的部署通知
   - 定期检查服务状态和日志

4. **使用自定义域名**
   - 配置自定义域名，提高项目的专业性
   - 设置SSL证书，确保数据传输安全

## 相关链接

- [Zeabur 官方文档](https://zeabur.com/docs)
- [Zeabur CLI 文档](https://zeabur.com/docs/cli)
- [Supabase 文档](https://supabase.com/docs)
- [豆包 API 文档](https://open.doubao.com/)
- [DeepSeek API 文档](https://platform.deepseek.com/)

## 部署完成

恭喜！你的项目已经成功部署到Zeabur平台。你可以通过Zeabur提供的域名访问你的项目，或者配置自定义域名。

如果遇到任何问题，可以查看Zeabur控制台的部署日志，或参考Zeabur官方文档。