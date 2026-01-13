# Zeabur 控制台部署详细步骤

## 部署准备

### 1. 注册Zeabur账号
- 访问 [Zeabur 官网](https://zeabur.com/)
- 点击 "Sign Up" 注册账号
- 支持 GitHub/ GitLab/ 邮箱注册

### 2. 准备GitHub仓库
- 确保你的代码已经推送到GitHub仓库
- 仓库地址：`https://github.com/danjintao200609-art/fortune-compass.git`

## 详细部署步骤

### 步骤1：登录Zeabur控制台
1. 访问 [Zeabur 控制台](https://dash.zeabur.com/)
2. 使用你注册的账号登录

### 步骤2：创建新项目
1. 在控制台主页，点击 **Create Project** 按钮
2. 输入项目名称（例如：`fortune-compass`）
3. 选择一个区域（建议选择靠近你的区域，如 "Singapore"）
4. 点击 **Create Project**

### 步骤3：部署前端服务

#### 3.1 添加前端服务
1. 在项目页面，点击 **Add Service** 按钮
2. 在弹出的菜单中，选择 **Git Repository**
3. 粘贴你的 GitHub 仓库地址：`https://github.com/danjintao200609-art/fortune-compass.git`
4. 点击 **Import**

#### 3.2 配置前端服务
1. **Service Name**：自动生成，可以修改为更有意义的名称，例如 `fortune-compass-frontend`
2. **Branch**：选择你要部署的分支，默认选择 `main`
3. **Service Type**：从下拉菜单中选择 **Static Website**（静态网站）
4. **Build Command**：输入 `npm run build`（这是前端的构建命令）
5. **Output Directory**：输入 `dist`（这是前端构建后的输出目录）
6. **Root Directory**：保持为空（默认使用项目根目录）
7. **Environment Variables**：暂时跳过，稍后统一配置
8. 点击 **Deploy** 按钮开始部署

#### 3.3 等待前端部署完成
- 部署过程可能需要几分钟
- 你可以在服务页面查看部署日志
- 部署完成后，服务状态会变为 **Running**
- 部署成功后，会生成一个 Zeabur 域名，例如：`fortune-compass-frontend.zeabur.app`

### 步骤4：部署后端服务

#### 4.1 添加后端服务
1. 在同一项目页面，点击 **Add Service** 按钮
2. 在弹出的菜单中，选择 **Git Repository**
3. 再次选择你的 GitHub 仓库：`https://github.com/danjintao200609-art/fortune-compass.git`
4. 点击 **Import**

#### 4.2 配置后端服务
1. **Service Name**：自动生成，可以修改为更有意义的名称，例如 `fortune-compass-backend`
2. **Branch**：选择你要部署的分支，默认选择 `main`
3. **Service Type**：从下拉菜单中选择 **Node.js**
4. **Build Command**：输入 `cd server && npm install && npm run build`（后端的构建命令）
5. **Start Command**：输入 `cd server && npm start`（后端的启动命令）
6. **Root Directory**：保持为空（默认使用项目根目录）
7. **Environment Variables**：暂时跳过，稍后统一配置
8. 点击 **Deploy** 按钮开始部署

#### 4.3 等待后端部署完成
- 部署过程可能需要几分钟
- 你可以在服务页面查看部署日志
- 部署完成后，服务状态会变为 **Running**
- 部署成功后，会生成一个 Zeabur 域名，例如：`fortune-compass-backend.zeabur.app`

### 步骤5：配置环境变量

#### 5.1 配置前端环境变量
1. 进入前端服务页面（点击服务名称）
2. 点击顶部的 **Settings** 选项卡
3. 在左侧菜单中，点击 **Environment Variables**
4. 点击 **Add Variable** 按钮
5. 添加以下环境变量（根据你的实际情况填写）：

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| `VITE_API_URL` | 后端服务的Zeabur域名 | `https://your-backend-domain.zeabur.app` |
| `VITE_SUPABASE_URL` | Supabase数据库URL | 从Supabase控制台获取 |
| `VITE_SUPABASE_KEY` | Supabase访问密钥 | 从Supabase控制台获取 |

6. 点击 **Save** 按钮保存环境变量

#### 5.2 配置后端环境变量
1. 进入后端服务页面（点击服务名称）
2. 点击顶部的 **Settings** 选项卡
3. 在左侧菜单中，点击 **Environment Variables**
4. 点击 **Add Variable** 按钮
5. 添加以下环境变量（根据你的实际情况填写）：

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| `PORT` | 服务端口 | `3000` |
| `SUPABASE_URL` | Supabase数据库URL | 从Supabase控制台获取 |
| `SUPABASE_KEY` | Supabase访问密钥 | 从Supabase控制台获取 |
| `AI_SERVICE_TYPE` | AI服务类型 | `doubao` |
| `DOUBAO_API_KEY` | 豆包API密钥 | 从豆包控制台获取 |
| `DEEPSEEK_API_KEY` | DeepSeek API密钥（可选） | 从DeepSeek控制台获取 |
| `JWT_SECRET` | JWT签名密钥 | `fortune-compass-secret-key-2026` |

6. 点击 **Save** 按钮保存环境变量

#### 5.3 重新部署服务
1. 回到前端服务页面
2. 点击右上角的 **Redeploy** 按钮
3. 确认重新部署
4. 同样的方式重新部署后端服务
5. 等待两个服务都重新部署完成

### 步骤6：配置域名（可选）

#### 6.1 使用Zeabur提供的免费域名
- 每个服务部署完成后，Zeabur会自动生成一个免费域名
- 你可以直接使用这个域名访问服务

#### 6.2 添加自定义域名
1. 在项目页面，点击顶部的 **Domains** 选项卡
2. 点击 **Add Domain** 按钮
3. 输入你的自定义域名（例如：`fortune-compass.example.com`）
4. 点击 **Add**
5. 根据提示配置DNS解析：
   - 登录你的域名注册商控制台
   - 添加CNAME记录，指向Zeabur提供的目标域名
   - 等待DNS生效（通常需要几分钟到几小时）
6. DNS生效后，Zeabur会自动为你的域名配置SSL证书

### 步骤7：验证部署

#### 7.1 验证前端
1. 访问前端的Zeabur域名
2. 检查页面是否正常加载
3. 测试注册、登录功能
4. 测试其他前端功能

#### 7.2 验证后端
1. 访问后端的Zeabur域名 + `/api/health`（例如：`https://your-backend-domain.zeabur.app/api/health`）
2. 应该返回：`{"status":"ok","message":"Backend is running"}`

#### 7.3 验证核心功能
1. 访问前端页面
2. 点击 "开启运势" 按钮
3. 检查是否能正常生成运势结果
4. 检查是否有任何错误提示

## 常见问题解决

### 1. 前端构建失败
- **原因**：依赖缺失或构建命令错误
- **解决方案**：
  - 在本地测试构建：`npm install && npm run build`
  - 检查构建日志，修复错误后重新部署
  - 确保package.json中有正确的build脚本

### 2. 后端部署失败
- **原因**：依赖缺失、构建命令错误或端口冲突
- **解决方案**：
  - 在本地测试后端构建：`cd server && npm install && npm run build`
  - 检查构建日志，修复错误后重新部署
  - 确保package.json中有正确的build和start脚本

### 3. 环境变量不生效
- **原因**：环境变量未正确设置或未重新部署
- **解决方案**：
  - 确保环境变量名称和值正确
  - 点击 "Redeploy" 按钮重新部署服务
  - 检查服务日志，确认环境变量是否正确加载

### 4. 无法访问Supabase
- **原因**：Supabase URL或Key错误
- **解决方案**：
  - 检查Supabase控制台的项目设置
  - 确保环境变量中的URL和Key与Supabase控制台一致
  - 确保Supabase项目允许来自Zeabur的IP访问

### 5. AI服务无法使用
- **原因**：API密钥错误或服务类型配置错误
- **解决方案**：
  - 检查API密钥是否正确
  - 确保`AI_SERVICE_TYPE`环境变量设置正确（`doubao`或`deepseek`）
  - 检查服务日志，查看AI服务调用的错误信息

## 部署成功后的访问地址

- **前端地址**：`https://your-frontend-domain.zeabur.app`
- **后端API地址**：`https://your-backend-domain.zeabur.app`
- **API健康检查**：`https://your-backend-domain.zeabur.app/api/health`

## 后续维护

### 1. 自动部署
- 当你将代码推送到GitHub仓库时，Zeabur会自动触发部署
- 你可以在服务页面查看部署历史

### 2. 监控服务状态
- 在Zeabur控制台可以查看服务的运行状态
- 可以设置告警，当服务出现问题时及时通知你

### 3. 查看日志
- 在服务页面点击 **Logs** 选项卡
- 可以查看实时日志和历史日志
- 可以搜索和筛选日志，便于调试

### 4. 扩展服务
- 可以根据需要增加服务实例数量
- 可以调整服务的资源配置（CPU、内存）

## 联系方式

如果在部署过程中遇到问题，可以：
- 查看Zeabur官方文档：[Zeabur Docs](https://zeabur.com/docs/)
- 查看服务日志，定位具体错误
- 在Zeabur控制台提交支持请求

## 部署完成

恭喜！你已经成功将项目部署到Zeabur平台。现在你可以通过生成的域名访问你的项目，享受稳定、高效的服务。

祝你使用愉快！🎉