# Vercel Git 自动部署常见问题

## 1. 上传到 Git 后 Vercel 会自动部署更新吗？

### 答案：视情况而定

**如果已在 Vercel 控制台完成以下设置，那么是的**：
1. 已将 Vercel 项目与 GitHub 仓库连接
2. 已配置自动部署分支（通常是 `main` 或 `master`）
3. 已配置正确的构建命令和输出目录

**如果尚未连接 Vercel 与 GitHub 仓库，那么不会**：
- 需要先在 Vercel 控制台完成初始项目创建
- 连接 GitHub 仓库后，后续推送才会自动触发部署

## 2. 如何设置 Vercel 自动部署？

### 步骤 1: 登录 Vercel 控制台
1. 访问 [Vercel 控制台](https://vercel.com/dashboard)
2. 登录或注册账号

### 步骤 2: 创建新项目并连接 GitHub 仓库
1. 点击 "Add New" → "Project"
2. 选择 "Import Git Repository"
3. 输入你的 GitHub 仓库地址：`https://github.com/danjintao200609-art/fortune-compass.git`
4. 点击 "Import"
5. 配置项目名称（避免冲突）、框架预设（Vite）、构建命令等
6. 点击 "Deploy"

### 步骤 3: 确认自动部署设置
1. 部署完成后，进入项目设置
2. 点击 "Git" 选项卡
3. 确保 "Automatic Deployments" 已开启
4. 选择需要自动部署的分支（如 `main`）

## 3. 自动部署的工作流程

1. **代码推送**：你将代码推送到 GitHub 仓库的指定分支
2. **Webhook 触发**：GitHub 发送 webhook 通知 Vercel
3. **自动构建**：Vercel 克隆代码并执行构建命令
4. **部署上线**：构建成功后，自动部署到 Vercel 平台
5. **通知**：通过邮件或其他方式通知你部署结果

## 4. 如何查看部署状态？

1. 访问 [Vercel 控制台](https://vercel.com/dashboard)
2. 进入你的项目
3. 点击 "Deployments" 选项卡
4. 查看所有部署记录，包括状态、分支、提交信息等
5. 点击具体部署记录，查看构建日志和详细信息

## 5. 自动部署失败怎么办？

### 常见原因及解决方案：

1. **构建错误**
   - 查看构建日志，定位错误信息
   - 本地运行 `npm run build` 测试构建
   - 检查依赖是否完整，尝试重新安装依赖

2. **环境变量缺失**
   - 在 Vercel 控制台添加缺失的环境变量
   - 重新触发部署

3. **配置错误**
   - 检查 `vercel.json` 配置是否正确
   - 检查构建命令和输出目录是否匹配

4. **权限问题**
   - 确保 Vercel 有 GitHub 仓库的访问权限
   - 检查 GitHub webhook 是否正常

## 6. 如何手动触发部署？

### 方式 1: Vercel 控制台
1. 进入项目 → "Deployments"
2. 点击 "Deploy" 按钮
3. 选择分支，点击 "Deploy"

### 方式 2: Vercel CLI
```bash
# 部署到预览环境
vercel

# 部署到生产环境
vercel --prod
```

## 7. 如何配置分支规则？

1. 进入项目 → "Settings" → "Git"
2. 点击 "Branches"
3. 配置不同分支的部署行为：
   - 生产环境分支：通常是 `main` 或 `master`
   - 预览环境分支：其他分支（如 `develop`）
   - 可以设置保护规则，限制只有特定分支可以部署到生产环境

## 8. 如何配置环境变量？

1. 进入项目 → "Settings" → "Environment Variables"
2. 点击 "Add" 按钮添加变量
3. 可以选择变量作用的环境（Production、Preview、Development）
4. 可以选择变量作用的分支

## 9. 如何回滚部署？

1. 进入项目 → "Deployments"
2. 找到需要回滚的历史版本
3. 点击 "Redeploy"
4. 确认回滚操作

## 10. 如何查看部署日志？

1. 进入项目 → "Deployments"
2. 点击具体的部署记录
3. 查看 "Build Logs" 和 "Runtime Logs"
4. 可以搜索和筛选日志

## 总结

- Vercel 支持 Git 自动部署，需要先在控制台连接 GitHub 仓库
- 代码推送到指定分支后，会自动触发部署
- 可以在 Vercel 控制台查看部署状态、日志和历史记录
- 遇到问题时，可以通过查看日志定位原因并解决

通过正确配置 Vercel 与 GitHub 仓库的连接，你可以实现代码推送后自动部署，大大简化了部署流程，提高了开发效率。