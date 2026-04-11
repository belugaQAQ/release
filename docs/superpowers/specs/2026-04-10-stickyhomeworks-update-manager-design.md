# StickyHomeworks Update Manager - 系统设计文档

**项目名称**: StickyHomeworks 更新管理系统  
**创建日期**: 2026-04-10  
**技术栈**: React + Express (Monorepo) + Vercel Serverless Functions  
**设计师**: AI Assistant  

---

## 一、项目概述

### 1.1 目标

构建一个基于 Vercel 平台的 Web 应用，用于管理 StickyHomeworks 应用的版本更新信息。系统采用前后端分离架构，使用 MDUI 框架实现 Material Design 3 设计语言，提供安全的密钥认证机制和完整的数据管理功能。

### 1.2 核心功能

- ✅ 密钥生成与安全管理（AES-256-GCM 加密）
- ✅ 版本更新信息编辑与验证
- ✅ latest.json 数据持久化存储
- ✅ RESTful API 接口
- ✅ 响应式 UI/UX（桌面端 + 移动端）
- ✅ Vercel 一键部署

---

## 二、技术架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                      Vercel Edge Network                    │
│  (全球 CDN + 边缘计算节点，自动负载均衡)                        │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
   ┌──────────┐    ┌──────────┐    ┌──────────┐
   │  静态资源  │    │  API 路由  │    │ Edge 中间件│
   │ (React)  │    │(Express)  │    │ (认证/限流)│
   └────┬─────┘    └────┬─────┘    └────┬─────┘
        │               │               │
        ▼               ▼               ▼
   ┌──────────┐    ┌──────────┐    ┌──────────┐
   │ MDUI 组件 │    │ 数据验证  │    │ AES-256  │
   │ 表单验证  │    │ JSON读写  │    │ 密钥管理  │
   └──────────┘    └─────┬────┘    └──────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │  latest.json │
                  │ (文件存储)   │
                  └──────────────┘
```

### 2.2 技术栈详情

| 层级 | 技术 | 版本 | 用途 |
|------|------|------|------|
| **前端框架** | React | 18.x | UI 组件化开发 |
| **构建工具** | Vite | 5.x | 快速开发与构建 |
| **UI 框架** | MDUI | 2.x | Material Design 3 |
| **后端运行时** | Node.js | 18.x | API 服务 |
| **Web 框架** | Express | 4.x | RESTful API |
| **加密库** | Node.js crypto | 内置 | AES-256-GCM |
| **部署平台** | Vercel | 最新版 | Serverless Functions |
| **开发工具** | TypeScript | 5.x | 类型安全 |
| **代码规范** | ESLint | 8.x | 代码质量 |

---

## 三、用户访问流程

### 3.1 首次访问流程

```
用户访问首页 → 检测无密钥文件 → 后端生成密钥对 (AES-256) 
→ 构建密钥文件 JSON → 前端显示下载提示 (MDUI Dialog)
→ 用户下载密钥文件到本地 → 自动跳转至编辑页面
```

**密钥文件结构：**
```json
{
  "meta": {
    "version": "1.0",
    "keyId": "key_20260410_a3f8b2c1d4e5",
    "createdAt": "2026-04-10T14:30:00+08:00",
    "purpose": "StickyHomeworks Update Manager Authentication"
  },
  "crypto": {
    "algorithm": "AES-256-GCM",
    "iv": "a1B2c3D4e5F6g7H8",
    "encryptedSeed": "U2FsdGVkX1+9f...",
    "authTag": "abc123def456..."
  },
  "security": {
    "expiresAt": null,
    "maxUsageCount": -1,
    "currentUsageCount": 0
  }
}
```

### 3.2 后续访问流程

```
用户访问首页 → 显示密钥导入界面（支持拖放/文件选择）
→ 上传密钥文件 → 发送至 /api/verify-key 验证
→ 验证通过 → 设置会话状态 → 进入编辑页面
→ 验证失败 → 显示错误提示 + 重试选项
```

### 3.3 密钥重置流程（管理员功能）

```
管理员点击"重置密钥" → 确认对话框（填写原因）
→ 后端验证当前密钥权限 → 检查频率限制
→ 生成新密钥对 → 标记旧密钥为 "revoked"
→ 注册新密钥哈希 → 记录审计日志
→ 返回新密钥文件 → 前端自动下载
```

---

## 四、API 端点设计

### 4.1 GET /api/latest.json

**用途：** 获取最新版本信息

**响应示例：**
```json
{
  "version": "0.2.0.0",
  "url": "https://down.jizilin2021.dpdns.org/d/root/down/StickyHomeworks2-0.2.0.0.zip?sign=rZkRcdonI_70iwsMTmkQ64MG_3bYOKgBU7_0Ji9aI5E=:0",
  "size": 10485760,
  "changelog": "修复若干 bug，优化性能。",
  "sha256": "bc619f788937cba7bb9dae12d4186e19a48d2cd77d8b5f604e2ced9462f7357e",
  "releaseDate": "2025-04-01T10:00:00+08:00"
}
```

**HTTP Headers：**
```
Content-Type: application/json; charset=utf-8
Cache-Control: public, max-age=300, s-maxage=600
ETag: "abc123..."
```

### 4.2 POST /api/update

**用途：** 更新 latest.json 数据

**请求体：**
```json
{
  "authorization": "Bearer <encrypted_key_file_content>",
  "data": {
    "version": "0.3.0.0",
    "url": "https://example.com/file.zip",
    "size": 20971520,
    "changelog": "新功能发布",
    "sha256": "new_sha256_hash..."
  }
}
```

**响应：**
- 成功 (200): `{ success: true, message: "数据更新成功", releaseDate: "..." }`
- 认证失败 (401): `{ success: false, error: "UNAUTHORIZED", message: "密钥验证失败" }`
- 验证错误 (400): `{ success: false, error: "VALIDATION_ERROR", message: { ... } }`

### 4.3 POST /api/verify-key

**用途：** 验证密钥文件有效性

**请求体：** `{ "keyFile": "<json_string>" }`

**响应：**
- 成功 (200): `{ valid: true, keyId: "key_xxx" }`
- 失败 (401): `{ valid: false, error: "密钥无效或已过期" }`

### 4.4 POST /api/generate-key

**用途：** 生成新的密钥对（首次访问时调用）

**响应 (200)：**
```json
{
  "success": true,
  "keyFile": { /* 完整的密钥文件对象 */ }
}
```

### 4.5 POST /api/reset-key

**用途：** 重置密钥（管理员功能）

**请求头：** `Authorization: Bearer <current_valid_key>`

**请求体：**
```json
{
  "reason": "密钥丢失",
  "force": false
}
```

**成功响应 (200)：**
```json
{
  "success": true,
  "message": "密钥重置成功",
  "data": {
    "newKeyFile": { /* 新密钥文件 */ },
    "resetInfo": {
      "oldKeyId": "key_old",
      "revokedAt": "2026-04-10T16:00:00+08:00",
      "reason": "密钥丢失"
    }
  }
}
```

**错误响应：**
- 401: 未授权
- 403: 权限不足
- 409: 冲突（正在重置中）
- 429: 频率限制（每天最多 3 次）

---

## 五、数据模型

### 5.1 latest.json 结构

```typescript
interface LatestData {
  version: string;       // 格式: x.x.x.x
  url: string;           // 完整 URL（含协议）
  size: number;          // 字节数（正整数）
  changelog: string;     // 变更日志文本
  sha256: string;        // 64位十六进制哈希
  releaseDate: string;   // ISO 8601 格式（北京时间）
}
```

**示例：**
```json
{
  "version": "0.2.0.0",
  "url": "https://down.jizilin2021.dpdns.org/d/root/down/StickyHomeworks2-0.2.0.0.zip?sign=rZkRcdonI_70iwsMTmkQ64MG_3bYOKgBU7_0Ji9aI5E=:0",
  "size": 10485760,
  "changelog": "修复若干 bug，优化性能。",
  "sha256": "bc619f788937cba7bb9dae12d4186e19a48d2cd77d8b5f604e2ced9462f7357e",
  "releaseDate": "2025-04-01T10:00:00Z"
}
```

### 5.2 密钥注册表结构 (keys/key_registry.json)

```typescript
interface KeyRegistry {
  keys: KeyRecord[];
  metadata: RegistryMetadata;
}

interface KeyRecord {
  keyId: string;
  keyHash: string;         // bcrypt 哈希值
  createdAt: string;
  expiresAt: string | null;
  usageCount: number;
  status: 'active' | 'revoked';
  revokedAt?: string;
  revokeReason?: string;
  replacedBy?: string;
}

interface RegistryMetadata {
  totalKeys: number;
  lastRotated: string;
  totalResets: number;
}
```

---

## 六、表单验证规则

### 6.1 字段验证规范

| 字段 | 类型 | 正则表达式/验证规则 | 错误提示 |
|------|------|---------------------|----------|
| **version** | 文本 | `^\d+\.\d+\.\d+\.\d+$` | 版本号格式不正确（应为 x.x.x.x） |
| **url** | 文本 | URL 构造函数验证 | 请输入有效的 URL（包含 http(s)://） |
| **size** | 数字 | `Number.isInteger(n) && n > 0` | 必须为正整数 |
| **changelog** | 多行文本 | `trim().length >= 1` | 变更日志不能为空 |
| **sha256** | 文本 | `^[a-fA-F0-9]{64}$` | SHA256 必须为64位十六进制字符 |

### 6.2 实时验证交互

- 用户输入触发 `onChange` 事件
- 通过验证：显示绿色 ✓ 图标
- 验证失败：显示红色错误信息 + 字段边框变红
- 所有字段通过：启用提交按钮
- 提交中：按钮显示加载动画，禁用重复点击

---

## 七、安全性设计

### 7.1 加密机制

**算法选择：AES-256-GCM**

优势：
- ✅ 认证加密（AEAD）：同时提供机密性和完整性
- ✅ 防篡改：GCM 认证标签检测密文修改
- ✅ 性能优秀：硬件加速（AES-NI）
- ✅ NIST 标准：广泛用于 TLS 1.3

**实现要点：**
- 主密钥长度：256 位（32 字节）
- 初始化向量（IV）：128 位（16 字节），每次唯一
- 认证标签：128 位（16 字节）

### 7.2 密钥存储策略

**服务端仅存储：**
- ✅ keyId（明文索引用）
- ✅ masterKey 的 bcrypt 哈希（加盐，不可逆）
- ✅ 元数据（创建时间、状态等）

**绝不存储：**
- ❌ 明文主密钥
- ❌ 明文随机种子
- ❌ 密钥文件完整内容

### 7.3 安全防护层级

```
第1层：传输安全
├── HTTPS 强制（Vercel 自动 SSL）
└── HSTS 头部

第2层：认证安全
├── AES-256-GCM 加密密钥文件
├── bcrypt 哈希存储（12轮盐值）
├── 密钥过期检查
└── 频率限制（Rate Limiting）

第3层：输入验证
├── 前端实时验证（正则）
├── 后端严格验证（类型检查）
├── XSS 防护（React 自动转义）
└── 注入防护（无 SQL，文件操作白名单）

第4层：数据安全
├── 原子性写入（临时文件 + rename）
├── 自动备份（保留最近 5 个版本）
├── 错误信息脱敏
└── CORS 严格配置
```

### 7.4 频率限制配置

| 操作 | 限制 | 时间窗口 |
|------|------|----------|
| 密钥重置 | 3 次 | 24 小时 |
| 密钥验证 | 10 次 | 1 小时 |
| 数据更新 | 30 次 | 1 小时 |

---

## 八、UI/UX 设计规范

### 8.1 Material Design 3 配色方案

```css
:root {
  --md-sys-color-primary: #6750A4;
  --md-sys-color-on-primary: #FFFFFF;
  --md-sys-color-primary-container: #EADDFF;
  --md-sys-color-surface: #FFFBFE;
  --md-sys-color-error: #B3261E;
  --md-sys-color-success: #056E33;
}
```

### 8.2 页面布局

**桌面端 (>1024px)：**
- 侧边栏导航 + 主内容区
- 表单字段单列显示，最大宽度 800px

**移动端 (<640px)：**
- 顶部 App Bar + 底部导航栏
- 全宽表单字段

**平板端 (640px-1024px)：**
- 可折叠侧边栏
- 两列布局（可选）

### 8.3 交互动画

- 页面切换：淡入淡出（300ms ease-out）
- 按钮悬停：scale(1.02) + 阴影加深
- 表单验证错误：shake 动画
- 加载状态：CircularProgress + 半透明遮罩
- 成功反馈：SnackBar（底部滑入，3秒自动消失）

---

## 九、项目文件结构

```
f:\web\new\
├── client/                          # React 前端应用
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   ├── AppBar.tsx
│   │   │   │   └── Navigation.tsx
│   │   │   ├── Forms/
│   │   │   │   ├── VersionField.tsx
│   │   │   │   ├── UrlField.tsx
│   │   │   │   ├── SizeField.tsx
│   │   │   │   ├── ChangelogField.tsx
│   │   │   │   └── Sha256Field.tsx
│   │   │   ├── KeyManagement/
│   │   │   │   ├── KeyGenerator.tsx
│   │   │   │   ├── KeyImporter.tsx
│   │   │   │   ├── KeyDownloader.tsx
│   │   │   │   └── KeyResetter.tsx
│   │   │   └── UI/
│   │   │       ├── LoadingSpinner.tsx
│   │   │       ├── ErrorBoundary.tsx
│   │   │       └── Snackbar.tsx
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   └── EditPage.tsx
│   │   ├── hooks/
│   │   │   ├── useFormValidation.ts
│   │   │   ├── useKeyAuth.ts
│   │   │   └── useApi.ts
│   │   ├── utils/
│   │   │   ├── encryption.ts
│   │   │   ├── validators.ts
│   │   │   ├── api.ts
│   │   │   └── constants.ts
│   │   ├── styles/
│   │   │   └── global.css
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .eslintrc.js
│
├── api/                             # Vercel Serverless Functions
│   ├── latest.json.ts
│   ├── update.ts
│   ├── verify-key.ts
│   ├── generate-key.ts
│   ├── reset-key.ts
│   └── middleware/
│       ├── auth.ts
│       ├── rateLimit.ts
│       └── errorHandler.ts
│
├── lib/                             # 共享工具库
│   ├── encryption.ts
│   ├── fileManager.ts
│   ├── validators.ts
│   ├── backup.ts
│   └── auditLogger.ts
│
├── data/                            # 数据存储（Git 忽略）
│   ├── latest.json
│   ├── keys/
│   │   └── key_registry.json
│   ├── backups/
│   └── logs/
│       └── audit.jsonl
│
├── vercel.json
├── package.json                     # 根 package.json
├── tsconfig.base.json
├── .gitignore
├── .eslintrc.js
└── README.md
```

---

## 十、部署配置

### 10.1 vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    },
    {
      "src": "api/**/*.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" },
    { "src": "/(.*)", "dest": "/client/dist/$1" }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET, POST, OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type, Authorization" }
      ]
    },
    {
      "source": "/api/latest.json",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=300, s-maxage=600" }
      ]
    }
  ]
}
```

### 10.2 环境变量（可选）

| 变量名 | 用途 | 示例值 |
|--------|------|--------|
| `ENCRYPTION_SECRET` | 额外加密层密钥 | 至少32字符的随机字符串 |
| `ADMIN_EMAIL` | 管理员通知邮箱 | admin@example.com |
| `RATE_LIMIT_SECRET` | 频率限制签名密钥 | 随机字符串 |

---

## 十一、审计与日志

### 11.1 审计日志格式

每条记录一行（JSON Lines 格式）：

```json
{
  "action": "KEY_RESET",
  "details": {
    "operatorKeyId": "key_xxx",
    "oldKeyId": "key_old",
    "newKeyId": "key_new",
    "reason": "密钥丢失"
  },
  "timestamp": "2026-04-10T16:00:00+08:00"
}
```

### 11.2 日志记录的操作类型

- `KEY_GENERATE`: 密钥生成
- `KEY_VERIFY`: 密钥验证
- `KEY_RESET`: 密钥重置
- `DATA_UPDATE`: 数据更新
- `DATA_READ`: 数据读取
- `AUTH_FAILURE`: 认证失败

---

## 十二、测试策略

### 12.1 单元测试

- 加密/解密函数测试
- 表单验证逻辑测试
- API 路由处理测试
- 文件读写安全性测试

### 12.2 集成测试

- 完整的用户流程测试（首次访问 → 下载密钥 → 编辑数据）
- API 端到端测试
- 密钥重置流程测试

### 12.3 安全测试

- 密钥泄露检测
- 暴力破解防护测试
- 输入注入攻击测试
- XSS/CSRF 防护测试

---

## 十三、性能优化

### 13.1 前端优化

- 代码分割（React.lazy + Suspense）
- 图片/资源懒加载
- MDUI 按需引入（Tree Shaking）
- Gzip/Brotli 压缩

### 13.2 后端优化

- API 响应缓存（Cache-Control）
- CDN 边缘缓存（s-maxage）
- 数据库查询优化（如需要）
- 压缩中间件

### 13.3 Vercel 特定优化

- Edge Functions 用于高频访问接口
- ISR（增量静态再生）用于静态数据
- Image Optimization（如需图片处理）

---

## 十四、维护与监控

### 14.1 健康检查端点

```
GET /api/health
Response: { "status": "ok", "timestamp": "...", "uptime": 123456 }
```

### 14.2 监控指标

- API 响应时间（P50, P95, P99）
- 错误率（4xx, 5xx）
- 密钥验证成功率
- 数据更新频率

### 14.3 备份策略

- 自动备份：每次更新前备份 latest.json
- 保留最近 5 个版本
- 提供手动回滚接口（可选）

---

## 十五、未来扩展方向

### 15.1 可能的功能增强

- 🔄 多版本历史查看
- 👥 多管理员支持（RBAC 权限控制）
- 📧 邮件/ webhook 通知
- 📊 使用统计仪表盘
- 🔗 GitHub/GitLab Webhook 集成
- 🌍 国际化（i18n）多语言支持
- 📱 PWA 支持（离线访问）
- 🧪 A/B 测试框架

### 15.2 架构升级路径

- 当前：文件存储 → 未来：数据库（PostgreSQL/MongoDB）
- 当前：单一实例 → 未来：微服务架构
- 当前：Vercel → 未来：混合云（Kubernetes）

---

## 附录 A：术语表

| 术语 | 定义 |
|------|------|
| **AES-256-GCM** | 高级加密标准 256 位伽罗瓦/计数器模式 |
| **bcrypt** | 安全的密码哈希函数，自带盐值 |
| **Serverless Functions** | 无服务器计算函数，按需执行 |
| **CDN** | 内容分发网络 |
| **AEAD** | 认证加密关联数据 |
| **HSTS** | HTTP 严格传输安全 |
| **CORS** | 跨源资源共享 |
| **Rate Limiting** | API 频率限制 |

---

## 附录 B：参考资源

- [MDUI 官方文档](https://www.mdui.org/)
- [Vercel 文档](https://vercel.com/docs)
- [Material Design 3 规范](https://m3.material.io/)
- [Node.js crypto 模块](https://nodejs.org/api/crypto.html)
- [RESTful API 设计最佳实践](https://restfulapi.net/)

---

**文档版本**: 1.0  
**最后更新**: 2026-04-10  
**审批状态**: ✅ 已批准  
**下一步**: 调用 writing-plans skill 创建实施计划
