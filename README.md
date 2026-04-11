# StickyHomeworks 更新管理系统

基于 Vercel 平台的 Web 应用，用于管理 StickyHomeworks 应用的版本更新信息。

## ✨ 功能特性

- 🔐 **安全管理**: AES-256-GCM 加密密钥认证机制
- 📝 **表单编辑**: 完整的版本信息编辑与实时验证
- 💾 **数据持久化**: 自动化的 JSON 数据存储与备份
- 🎨 **Material Design 3**: 基于 MDUI 框架的现代化 UI
- 📱 **响应式设计**: 支持桌面端与移动端访问
- 🔄 **密钥重置**: 支持管理员重置密钥功能
- 📊 **审计日志**: 完整的操作记录与追踪

## 🛠️ 技术栈

- **前端**: React 18 + Vite 5 + MDUI 2 + TypeScript 5
- **后端**: Node.js 18 + Express 4 + Vercel Serverless Functions
- **加密**: AES-256-GCM (Node.js crypto)
- **部署**: Vercel (全球 CDN + 边缘计算)

## 📁 项目结构

```
stickyhomeworks-update-manager/
├── client/                 # React 前端应用
│   ├── src/
│   │   ├── components/     # 可复用组件
│   │   ├── pages/          # 页面组件
│   │   ├── hooks/          # 自定义 Hooks
│   │   └── utils/          # 工具函数
│   └── package.json
├── api/                    # Serverless API 路由
│   ├── generate-key.ts     # 密钥生成
│   ├── verify-key.ts       # 密钥验证
│   ├── latest.json.ts      # 数据读取
│   ├── update.ts           # 数据更新
│   └── reset-key.ts        # 密钥重置
├── lib/                    # 共享工具库
│   ├── encryption.ts       # 加密模块
│   ├── fileManager.ts      # 文件管理
│   ├── validators.ts       # 数据验证
│   └── auditLogger.ts      # 审计日志
├── data/                   # 数据存储（运行时生成）
├── vercel.json             # Vercel 部署配置
└── README.md               # 本文档
```

## 🚀 快速开始

### 前置要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### 本地开发环境搭建

#### 1. 克隆项目

```bash
git clone <your-repo-url>
cd stickyhomeworks-update-manager
```

#### 2. 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装客户端依赖
cd client && npm install && cd ..

# 安装 API 依赖
cd api && npm install && cd ..
```

#### 3. 启动开发服务器

```bash
# 启动前后端开发服务器（并发运行）
npm run dev
```

这将同时启动：
- 前端开发服务器: http://localhost:5173
- API 代理服务器: http://localhost:3000 (自动代理到 /api)

#### 4. 访问应用

打开浏览器访问: http://localhost:5173

首次访问时，系统会自动生成密钥文件并提示下载。

## 🌐 Vercel 部署

### 方式一：通过 Vercel CLI（推荐）

#### 1. 安装 Vercel CLI

```bash
npm i -g vercel
```

#### 2. 登录 Vercel

```bash
vercel login
```

#### 3. 部署项目

```bash
cd stickyhomeworks-update-manager
vercel --prod
```

按照提示完成部署配置即可。

### 方式二：通过 GitHub 集成

1. 将代码推送到 GitHub 仓库
2. 访问 https://vercel.com/new
3. 导入你的 GitHub 仓库
4. Vercel 会自动检测配置并部署
5. 每次推送代码都会自动重新部署

## 📖 使用指南

### 首次访问流程

1. 访问应用首页
2. 系统自动检测是否已有密钥文件
3. 如无密钥，自动生成新的密钥对
4. 显示醒目的下载提示对话框
5. 点击"下载密钥文件"保存到本地
6. 下载完成后自动跳转至编辑页面

### 后续访问流程

1. 访问应用首页
2. 显示密钥导入界面
3. 通过**拖放**或**点击选择**上传之前下载的 `.json` 密钥文件
4. 系统验证密钥有效性
5. 验证通过后进入编辑页面

### 编辑更新信息

编辑页面包含以下字段：

| 字段 | 说明 | 验证规则 |
|------|------|----------|
| **版本号** | 应用版本号 | 格式: `x.x.x.x` (如 `0.2.0.0`) |
| **下载链接** | 完整的下载 URL | 必须包含 `http(s)://` 协议 |
| **文件大小** | 文件字节数 | 正整数 |
| **变更日志** | 版本更新说明 | 不能为空 |
| **SHA256** | 文件哈希值 | 64位十六进制字符 |

所有字段均提供实时验证，只有全部通过后才能提交。

### 密钥重置（管理员功能）

如果密钥丢失或怀疑泄露：

1. 在编辑页面右上角点击"🔄 重置密钥"
2. 在弹出的对话框中填写重置原因
3. 点击"确认重置"
4. 系统生成新密钥并自动下载
5. 旧密钥立即失效

**注意**: 密钥重置每天最多执行 3 次。

## 🔒 安全特性

### 加密机制

- **算法**: AES-256-GCM（认证加密）
- **密钥长度**: 256 位
- **初始化向量**: 每次唯一（128 位）
- **认证标签**: 防篡改保护

### 存储策略

- ✅ 服务端仅存储密钥的 **bcrypt 哈希值**（不可逆）
- ❌ 绝不存储明文密钥或加密种子
- ✅ 所有传输均通过 **HTTPS** 加密
- ✅ API 频率限制防止暴力破解

### 数据保护

- **原子性写入**: 先写临时文件再重命名，防止数据损坏
- **自动备份**: 每次更新前自动备份，保留最近 5 个版本
- **审计日志**: 记录所有关键操作，便于追踪

## 🧪 测试

```bash
# 运行单元测试
npm test

# 运行 ESLint 检查
npm run lint

# TypeScript 类型检查
cd client && npx tsc --noEmit
cd api && npx tsc --noEmit
```

## 📊 API 接口文档

### GET /api/latest.json

获取最新的版本更新信息。

**响应示例**:
```json
{
  "version": "0.2.0.0",
  "url": "https://example.com/file.zip",
  "size": 10485760,
  "changelog": "修复若干 bug",
  "sha256": "bc619f78...",
  "releaseDate": "2026-04-10T10:00:00+08:00"
}
```

**缓存策略**:
- 客户端缓存: 5 分钟 (`max-age=300`)
- CDN 缓存: 10 分钟 (`s-maxage=600`)

### POST /api/generate-key

生成新的密钥对（首次访问时调用）。

**响应**: 包含完整的密钥文件 JSON 对象。

### POST /api/verify-key

验证用户上传的密钥文件。

**请求体**: `{ "keyFile": {...} }`

**响应**: `{ "valid": true/false, "keyId": "..." }`

### POST /api/update

提交更新的版本信息。

**请求头**: `Authorization: Bearer <key_file_json>`

**请求体**: `{ "data": { version, url, size, changelog, sha256 } }`

**响应**: `{ "success": true, "data": { ..., releaseDate: "..." } }`

### POST /api/reset-key

重置密钥（需当前有效密钥认证）。

**频率限制**: 每天 3 次

**响应**: 包含新密钥文件和重置信息。

## 📄 许可证

MIT License

## 📞 支持

如有问题或建议，请提交 Issue 或联系维护者。

---

**最后更新**: 2026-04-10  
**版本**: 1.0.0  
**作者**: AI Assistant
