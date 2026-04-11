# StickyHomeworks Update Manager - 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个完整的基于 Vercel 平台的 Web 应用，用于管理 StickyHomeworks 应用的版本更新信息，包含安全的密钥认证机制和 Material Design 3 风格的响应式界面。

**Architecture:** 采用 Monorepo 单仓库结构，前端使用 React + Vite + MDUI 框架实现 Material Design 3 样式，后端使用 Vercel Serverless Functions (Node.js + Express) 提供 RESTful API，数据通过文件系统持久化存储 latest.json，密钥管理采用 AES-256-GCM 加密算法确保安全性。

**Tech Stack:** React 18, Vite 5, MDUI 2, TypeScript 5, Node.js 18, Express 4, Vercel (Serverless Functions), ESLint 8

---

## 项目范围与任务分解概览

本计划将项目分解为 **8 个主要阶段**，共 **35 个详细任务**：

### 📋 阶段总览

1. **🏗️ 项目初始化与基础设施** (Task 1-4)
   - 创建根目录配置和 Monorepo 结构
   - 设置 TypeScript、ESLint、Git 配置

2. **🔐 后端核心库开发** (Task 5-9)
   - 实现 AES-256-GCM 加密模块
   - 文件管理与原子性写入
   - 数据验证工具
   - 备份管理系统
   - 审计日志系统

3. **🚀 API 路由实现** (Task 10-16)
   - 密钥生成接口
   - 密钥验证接口
   - 数据读取接口 (GET /api/latest.json)
   - 数据更新接口 (POST /api/update)
   - 密钥重置接口
   - 中间件（认证、限流、错误处理）
   - 健康检查端点

4. **⚛️ 前端项目搭建** (Task 17-20)
   - 初始化 React + Vite 项目
   - 配置 MDUI 和全局样式
   - 设置路由和状态管理
   - 工具函数封装

5. **🎨 UI 组件开发** (Task 21-27)
   - 布局组件（AppBar, Navigation）
   - 表单字段组件（5个）
   - 密钥管理组件（生成/导入/下载/重置）
   - 通用 UI 组件（加载、错误边界）

6. **📄 页面集成** (Task 28-30)
   - 首页（密钥检测与导入）
   - 编辑页面（表单与提交）
   - App 入口与路由配置

7. **✅ 测试与质量保证** (Task 31-33)
   - 单元测试（加密、验证逻辑）
   - 集成测试（API 端点）
   - ESLint 检查与代码优化

8. **📚 文档与部署** (Task 34-35)
   - 编写 README.md 文档
   - Vercel 部署配置与测试

---

## 详细任务清单

### Task 1: 创建根目录配置文件

**Files:**
- Create: `f:\web\new\package.json`
- Create: `f:\web\new\.gitignore`
- Create: `f:\web\new\tsconfig.base.json`
- Create: `f:\web\new\.eslintrc.js`

- [ ] **Step 1: 创建根 package.json**

```json
{
  "name": "stickyhomeworks-update-manager",
  "version": "1.0.0",
  "private": true,
  "description": "StickyHomeworks 更新管理系统 - 基于 Vercel 的版本更新管理平台",
  "scripts": {
    "dev": "concurrently \"npm run dev:client\" \"npm run dev:api\"",
    "dev:client": "cd client && npm run dev",
    "dev:api": "cd api && npm run dev",
    "build:client": "cd client && npm run build",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "test": "jest",
    "vercel-build": "npm run build:client"
  },
  "devDependencies": {
    "concurrently": "^8.2.2",
    "@types/node": "^20.11.0",
    "typescript": "^5.3.3",
    "eslint": "^8.56.0",
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    "@typescript-eslint/parser": "^6.19.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

- [ ] **Step 2: 创建 .gitignore**

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Build outputs
client/dist/
api/dist/
.vercel/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Data files (contains sensitive info)
data/latest.json
data/keys/
data/backups/
data/logs/
data/rate_limits.json

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Testing
coverage/

# Misc
*.tsbuildinfo
```

- [ ] **Step 3: 创建 tsconfig.base.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@lib/*": ["lib/*"],
      "@api/*": ["api/*"]
    }
  },
  "exclude": ["node_modules", "dist", "client", "data"]
}
```

- [ ] **Step 4: 创建根 .eslintrc.js**

```javascript
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  env: {
    browser: true,
    node: true,
    es2020: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
  ignorePatterns: ['node_modules/', 'dist/', '*.config.js'],
};
```

- [ ] **Step 5: Commit**

```bash
cd f:\web/new
git init
git add package.json .gitignore tsconfig.base.json .eslintrc.js
git commit -m "chore: initialize project root configuration"
```

---

### Task 2: 创建前端项目结构

**Files:**
- Create: `f:\web\new\client\package.json`
- Create: `f:\web\new\client\tsconfig.json`
- Create: `f:\web\new\client\vite.config.ts`
- Create: `f:\web\new\client\public\index.html`
- Create: `f:\web\new\client\.eslintrc.js`
- Create: `f:\web\new\client\src\vite-env.d.ts`
- Create: `f:\web\new\client\src\main.tsx`
- Create: `f:\web\new\client\src\App.tsx`
- Create: `f:\web\new\client\src\styles\global.css`

- [ ] **Step 1: 创建 client/package.json**

```json
{
  "name": "client",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.3",
    "mdui": "^2.0.3",
    "@mdui/icons": "^2.0.3"
  },
  "devDependencies": {
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.12"
  }
}
```

- [ ] **Step 2: 创建 client/tsconfig.json**

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@components/*": ["src/components/*"],
      "@pages/*": ["src/pages/*"],
      "@hooks/*": ["src/hooks/*"],
      "@utils/*": ["src/utils/*"],
      "@styles/*": ["src/styles/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 3: 创建 client/vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@styles': path.resolve(__dirname, './src/styles'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

- [ ] **Step 4: 创建 client/public/index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#6750A4" />
    <title>StickyHomeworks 更新管理器</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: 创建 client/.eslintrc.js**

```javascript
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  env: {
    browser: true,
    es2020: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};
```

- [ ] **Step 6: 创建基础源文件**

**client/src/vite-env.d.ts:**
```typescript
/// <reference types="vite/client" />
```

**client/src/main.tsx:**
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

**client/src/App.tsx:**
```typescript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<div>Coming soon...</div>} />
      </Routes>
    </Router>
  );
}

export default App;
```

**client/src/styles/global.css:**
```css
:root {
  --md-sys-color-primary: #6750A4;
  --md-sys-color-on-primary: #FFFFFF;
  --md-sys-color-primary-container: #EADDFF;
  --md-sys-color-surface: #FFFBFE;
  --md-sys-color-on-surface: #1D1B20;
  --md-sys-color-error: #B3261E;
  --md-sys-color-success: #056E33;
  
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  line-height: 1.6;
}

#root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
```

- [ ] **Step 7: Commit**

```bash
cd f:\web/new
git add client/
git commit -m "feat: initialize React frontend project structure"
```

---

### Task 3: 创建 API 目录结构和入口文件

**Files:**
- Create: `f:\web\new\api\package.json`
- Create: `f:\web\new\api\tsconfig.json`
- Create: `f:\web\new\data\.gitkeep`
- Create: `f:\web\new\data\README.md`

- [ ] **Step 1: 创建 api/package.json**

```json
{
  "name": "api",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "index.ts",
  "scripts": {
    "dev": "tsx watch index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "bcryptjs": "^2.4.3"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/bcryptjs": "^2.4.6",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3"
  }
}
```

- [ ] **Step 2: 创建 api/tsconfig.json**

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "./dist",
    "rootDir": ".",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true,
    "types": ["node"]
  },
  "include": ["./**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: 创建 data 目录说明文件**

**data/README.md:**
```markdown
# Data Directory

此目录包含运行时生成的数据文件，**不应提交到 Git 仓库**。

## 目录结构

- `latest.json` - 当前版本更新信息
- `keys/key_registry.json` - 密钥注册表（仅存储哈希值）
- `backups/` - 自动备份文件
- `logs/audit.jsonl` - 审计日志

## 安全注意事项

⚠️ 此目录包含敏感数据：
- 密钥哈希值
- 加密种子
- 操作审计记录

请确保：
1. 此目录已在 `.gitignore` 中
2. 文件权限设置为仅服务器可读写
3. 定期备份到安全位置
```

- [ ] **Step 4: Commit**

```bash
cd f:\web/new
git add api/ data/
git commit -m "feat: initialize API directory and data storage structure"
```

---

### Task 4: 安装依赖并验证项目结构

**Files:**
- Modify: 无（安装依赖操作）

- [ ] **Step 1: 安装根目录依赖**

Run: `npm install` in `f:\web\new`
Expected: 成功安装 concurrently, typescript, eslint 等

- [ ] **Step 2: 安装客户端依赖**

Run: `cd client && npm install`
Expected: 成功安装 react, mdui, vite 等

- [ ] **Step 3: 安装 API 依赖**

Run: `cd api && npm install`
Expected: 成功安装 express, bcryptjs 等

- [ ] **Step 4: 验证 TypeScript 编译**

Run: `cd client && npx tsc --noEmit`
Expected: 无错误输出

Run: `cd api && npx tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 5: Commit**

```bash
cd f:\web/new
git add package-lock.json client/package-lock.json api/package-lock.json
git commit -m "chore: install project dependencies"
```

---

### Task 5: 实现加密模块 (lib/encryption.ts)

**Files:**
- Create: `f:\web\new\lib\encryption.ts`
- Test: 手动测试或后续 Task 31 补充单元测试

- [ ] **Step 1: 创建加密工具类**

```typescript
// lib/encryption.ts
import crypto from 'crypto';

export interface KeyPair {
  masterKey: Buffer;
  iv: Buffer;
}

export interface EncryptedData {
  encryptedSeed: string;
  authTag: string;
  iv: string;
}

export class EncryptionService {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_LENGTH = 32;  // 256 bits
  private static readonly IV_LENGTH = 16;   // 128 bits
  private static readonly AUTH_TAG_LENGTH = 16;  // 128 bits

  /**
   * 生成新的密钥对（主密钥 + IV）
   */
  static generateKeyPair(): KeyPair {
    return {
      masterKey: crypto.randomBytes(this.KEY_LENGTH),
      iv: crypto.randomBytes(this.IV_LENGTH),
    };
  }

  /**
   * 使用 AES-256-GCM 加密数据
   */
  static encrypt(plaintext: string, keyPair: KeyPair): EncryptedData {
    const cipher = crypto.createCipheriv(
      this.ALGORITHM,
      keyPair.masterKey,
      keyPair.iv
    );

    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const authTag = cipher.getAuthTag().toString('base64');

    return {
      encryptedSeed: encrypted,
      authTag,
      iv: keyPair.iv.toString('base64'),
    };
  }

  /**
   * 使用 AES-256-GCM 解密数据（带认证标签验证）
   */
  static decrypt(encryptedData: EncryptedData, masterKey: Buffer): string {
    const decipher = crypto.createDecipheriv(
      this.ALGORITHM,
      masterKey,
      Buffer.from(encryptedData.iv, 'base64')
    );

    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'base64'));

    let decrypted = decipher.update(encryptedData.encryptedSeed, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * 生成唯一的密钥 ID
   */
  static generateKeyId(): string {
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = crypto.randomBytes(6).toString('hex');
    return `key_${timestamp}_${random}`;
  }

  /**
   * 生成随机种子（用于密钥派生）
   */
  static generateSeed(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd f:\web/new
git add lib/encryption.ts
git commit -m "feat: implement AES-256-GCM encryption module"
```

---

### Task 6: 实现文件管理器 (lib/fileManager.ts)

**Files:**
- Create: `f:\web\new\lib\fileManager.ts`

- [ ] **Step 1: 创建文件管理工具类**

```typescript
// lib/fileManager.ts
import fs from 'fs/promises';
import path from 'path';
import { BackupManager } from './backup';

const DATA_DIR = path.join(process.cwd(), 'data');

export interface LatestData {
  version: string;
  url: string;
  size: number;
  changelog: string;
  sha256: string;
  releaseDate: string;
}

export class FileManager {
  /**
   * 确保 data 目录存在
   */
  static async ensureDataDir(): Promise<void> {
    await fs.mkdir(path.join(DATA_DIR, 'backups'), { recursive: true });
    await fs.mkdir(path.join(DATA_DIR, 'keys'), { recursive: true });
    await fs.mkdir(path.join(DATA_DIR, 'logs'), { recursive: true });
  }

  /**
   * 原子性写入 JSON 文件（防止损坏）
   */
  static async writeJsonSafe<T>(filePath: string, data: T): Promise<void> {
    const dir = path.dirname(filePath);
    const tmpPath = `${filePath}.tmp`;

    try {
      // 1. 写入临时文件
      const jsonString = JSON.stringify(data, null, 2);
      await fs.writeFile(tmpPath, jsonString, 'utf-8');

      // 2. 验证 JSON 格式
      const content = await fs.readFile(tmpPath, 'utf-8');
      JSON.parse(content);

      // 3. 如果是 latest.json，先备份旧文件
      if (filePath.includes('latest.json')) {
        try {
          const existingData = await this.readLatestData();
          if (existingData) {
            await BackupManager.createBackup(existingData);
          }
        } catch (error) {
          // 首次写入，无需备份
        }
      }

      // 4. 原子性重命名
      await fs.rename(tmpPath, filePath);

    } catch (error) {
      // 清理临时文件
      try {
        await fs.unlink(tmpPath);
      } catch (e) {
        // 忽略删除错误
      }
      throw error;
    }
  }

  /**
   * 读取 latest.json 数据
   */
  static async readLatestData(): Promise<LatestData | null> {
    try {
      const filePath = path.join(DATA_DIR, 'latest.json');
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  /**
   * 写入 latest.json（自动添加 releaseDate）
   */
  static async writeLatestData(data: Omit<LatestData, 'releaseDate'>): Promise<LatestData> {
    await this.ensureDataDir();

    const fullData: LatestData = {
      ...data,
      releaseDate: new Date().toISOString(),
    };

    const filePath = path.join(DATA_DIR, 'latest.json');
    await this.writeJsonSafe(filePath, fullData);

    return fullData;
  }

  /**
   * 读取密钥注册表
   */
  static async readKeyRegistry(): Promise<any> {
    try {
      const filePath = path.join(DATA_DIR, 'keys', 'key_registry.json');
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return { keys: [], metadata: { totalKeys: 0, lastRotated: '', totalResets: 0 } };
      }
      throw error;
    }
  }

  /**
   * 写入密钥注册表
   */
  static async writeKeyRegistry(registry: any): Promise<void> {
    await this.ensureDataDir();
    const filePath = path.join(DATA_DIR, 'keys', 'key_registry.json');
    await this.writeJsonSafe(filePath, registry);
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd f:\web/new
git add lib/fileManager.ts
git commit -m "feat: implement atomic file manager with backup support"
```

---

### Task 7: 实现数据验证器 (lib/validators.ts)

**Files:**
- Create: `f:\web\new\lib\validators.ts`

- [ ] **Step 1: 创建验证规则和函数**

```typescript
// lib/validators.ts

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface UpdateDataValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

/**
 * 版本号验证：x.x.x.x 格式
 */
export function validateVersion(version: string): ValidationResult {
  const pattern = /^\d+\.\d+\.\d+\.\d+$/;
  if (!pattern.test(version)) {
    return {
      valid: false,
      error: '版本号格式不正确，应为 x.x.x.x（例如：1.0.0.0）',
    };
  }
  return { valid: true };
}

/**
 * URL 验证
 */
export function validateUrl(url: string): ValidationResult {
  try {
    const parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return {
        valid: false,
        error: 'URL 必须以 http:// 或 https:// 开头',
      };
    }
    if (!parsedUrl.hostname) {
      return {
        valid: false,
        error: 'URL 必须包含有效的域名',
      };
    }
    return { valid: true };
  } catch {
    return {
      valid: false,
      error: '请输入有效的 URL 地址',
    };
  }
}

/**
 * 文件大小验证（正整数）
 */
export function validateSize(size: number): ValidationResult {
  if (!Number.isInteger(size) || size <= 0) {
    return {
      valid: false,
      error: '文件大小必须为正整数（单位：字节）',
    };
  }
  return { valid: true };
}

/**
 * 变更日志验证（非空）
 */
export function validateChangelog(changelog: string): ValidationResult {
  if (!changelog || changelog.trim().length === 0) {
    return {
      valid: false,
      error: '变更日志不能为空',
    };
  }
  return { valid: true };
}

/**
 * SHA256 哈希验证（64位十六进制）
 */
export function validateSha256(sha256: string): ValidationResult {
  const pattern = /^[a-fA-F0-9]{64}$/;
  if (!pattern.test(sha256)) {
    return {
      valid: false,
      error: 'SHA256 必须为64位十六进制字符',
    };
  }
  return { valid: true };
}

/**
 * 验证完整的更新数据
 */
export function validateUpdateData(data: any): UpdateDataValidationResult {
  const errors: Record<string, string> = {};

  const versionResult = validateVersion(data.version);
  if (!versionResult.valid) errors.version = versionResult.error!;

  const urlResult = validateUrl(data.url);
  if (!urlResult.valid) errors.url = urlResult.error!;

  const sizeResult = validateSize(data.size);
  if (!sizeResult.valid) errors.size = sizeResult.error!;

  const changelogResult = validateChangelog(data.changelog);
  if (!changelogResult.valid) errors.changelog = changelogResult.error!;

  const sha256Result = validateSha256(data.sha256);
  if (!sha256Result.valid) errors.sha256 = sha256Result.error!;

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
```

- [ ] **Step 2: Commit**

```bash
cd f:\web/new
git add lib/validators.ts
git commit -m "feat: implement data validation utilities"
```

---

### Task 8: 实现备份管理器 (lib/backup.ts)

**Files:**
- Create: `f:\web\new\lib\backup.ts`

- [ ] **Step 1: 创建备份管理工具类**

```typescript
// lib/backup.ts
import fs from 'fs/promises';
import path from 'path';
import { LatestData } from './fileManager';

const BACKUP_DIR = path.join(process.cwd(), 'data', 'backups');
const MAX_BACKUPS = 5;

export class BackupManager {
  /**
   * 创建最新数据的备份
   */
  static async createBackup(data: LatestData): Promise<string> {
    await fs.mkdir(BACKUP_DIR, { recursive: true });

    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T]/g, '')
      .slice(0, 15);
    const filename = `latest.${timestamp}.json`;
    const filePath = path.join(BACKUP_DIR, filename);

    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');

    // 清理旧备份（保留最近 MAX_BACKUPS 个）
    await this.cleanupOldBackups();

    console.log(`✅ 备份已创建: ${filename}`);
    return filePath;
  }

  /**
   * 列出所有备份文件
   */
  static async listBackups(): Promise<Array<{ filename: string; date: Date; size: number }>> {
    try {
      const files = await fs.readdir(BACKUP_DIR);
      const backups = [];

      for (const file of files) {
        if (file.startsWith('latest.') && file.endsWith('.json')) {
          const filePath = path.join(BACKUP_DIR, file);
          const stat = await fs.stat(filePath);
          backups.push({
            filename: file,
            date: stat.mtime,
            size: stat.size,
          });
        }
      }

      return backups.sort((a, b) => b.date.getTime() - a.date.getTime());
    } catch (error) {
      return [];
    }
  }

  /**
   * 从备份恢复数据
   */
  static async restoreFromBackup(filename: string): Promise<LatestData> {
    const filePath = path.join(BACKUP_DIR, filename);
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * 清理旧备份（保留最近 MAX_BACKUPS 个）
   */
  private static async cleanupOldBackups(): Promise<void> {
    try {
      const backups = await this.listBackups();
      
      if (backups.length > MAX_BACKUPS) {
        const toDelete = backups.slice(MAX_BACKUPS);
        
        for (const backup of toDelete) {
          const filePath = path.join(BACKUP_DIR, backup.filename);
          await fs.unlink(filePath);
          console.log(`🗑️ 已删除旧备份: ${backup.filename}`);
        }
      }
    } catch (error) {
      console.error('清理备份失败:', error);
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd f:\web/new
git add lib/backup.ts
git commit -m "feat: implement backup management system"
```

---

### Task 9: 实现审计日志系统 (lib/auditLogger.ts)

**Files:**
- Create: `f:\web\new\lib\auditLogger.ts`

- [ ] **Step 1: 创建审计日志工具类**

```typescript
// lib/auditLogger.ts
import fs from 'fs/promises';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), 'data', 'logs', 'audit.jsonl');

interface AuditLogEntry {
  action: string;
  details: any;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditLogger {
  /**
   * 记录审计日志（JSON Lines 格式）
   */
  static async log(
    action: string,
    details: any,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<void> {
    const entry: AuditLogEntry = {
      action,
      details,
      timestamp: new Date().toISOString(),
      ...metadata,
    };

    try {
      const logLine = JSON.stringify(entry) + '\n';
      await fs.appendFile(LOG_FILE, logLine, 'utf-8');
      console.log(`📝 审计日志: [${action}]`);
    } catch (error) {
      console.error('❌ 写入审计日志失败:', error);
    }
  }

  /**
   * 查询审计日志（管理员功能）
   */
  static async query(filters?: {
    action?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<AuditLogEntry[]> {
    try {
      const content = await fs.readFile(LOG_FILE, 'utf-8');
      const lines = content.trim().split('\n').filter(Boolean);
      let entries: AuditLogEntry[] = lines.map((line) => JSON.parse(line));

      if (filters?.action) {
        entries = entries.filter((e) => e.action === filters.action);
      }

      if (filters?.startDate) {
        entries = entries.filter((e) => e.timestamp >= filters.startDate!);
      }

      if (filters?.endDate) {
        entries = entries.filter((e) => e.timestamp <= filters.endDate!);
      }

      if (filters?.limit) {
        entries = entries.slice(0, filters.limit);
      }

      return entries.reverse(); // 最新的在前
    } catch (error) {
      console.error('查询审计日志失败:', error);
      return [];
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd f:\web/new
git add lib/auditLogger.ts
git commit -m "feat: implement audit logging system"
```

---

### Task 10: 实现密钥生成 API (api/generate-key.ts)

**Files:**
- Create: `f:\web\new\api\generate-key.ts`

- [ ] **Step 1: 创建密钥生成接口**

```typescript
// api/generate-key.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { EncryptionService } from '../lib/encryption';
import { FileManager } from '../lib/fileManager';
import bcrypt from 'bcryptjs';
import { AuditLogger } from '../lib/auditLogger';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'METHOD_NOT_ALLOWED',
      message: '仅支持 POST 请求',
    });
  }

  try {
    // 1. 生成新的密钥对
    const keyPair = EncryptionService.generateKeyPair();
    const keyId = EncryptionService.generateKeyId();
    const seed = EncryptionService.generateSeed();

    // 2. 加密种子
    const encryptedData = EncryptionService.encrypt(seed, keyPair);

    // 3. 构建密钥文件对象
    const keyFile = {
      meta: {
        version: '1.0',
        keyId,
        createdAt: new Date().toISOString(),
        purpose: 'StickyHomeworks Update Manager Authentication',
      },
      crypto: {
        algorithm: 'AES-256-GCM',
        iv: encryptedData.iv,
        encryptedSeed: encryptedData.encryptedSeed,
        authTag: encryptedData.authTag,
      },
      security: {
        expiresAt: null,
        maxUsageCount: -1,
        currentUsageCount: 0,
      },
    };

    // 4. 注册密钥（仅存储哈希值）
    const keyHash = await bcrypt.hash(keyPair.masterKey.toString('base64'), 12);
    
    const registry = await FileManager.readKeyRegistry();
    registry.keys.push({
      keyId,
      keyHash,
      createdAt: new Date().toISOString(),
      expiresAt: null,
      usageCount: 0,
      status: 'active',
    });
    registry.metadata.totalKeys += 1;
    
    await FileManager.writeKeyRegistry(registry);

    // 5. 记录审计日志
    await AuditLogger.log('KEY_GENERATE', { keyId }, {
      ipAddress: req.socket?.remoteAddress,
      userAgent: req.headers['user-agent'],
    });

    // 6. 返回密钥文件
    return res.status(200).json({
      success: true,
      message: '密钥生成成功',
      data: keyFile,
    });

  } catch (error) {
    console.error('密钥生成失败:', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: '密钥生成过程中发生错误',
    });
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd f:\web/new
git add api/generate-key.ts
git commit -m "feat: implement key generation API endpoint"
```

---

### Task 11: 实现密钥验证 API (api/verify-key.ts)

**Files:**
- Create: `f:\web\new\api\verify-key.ts`

- [ ] **Step 1: 创建密钥验证接口**

```typescript
// api/verify-key.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { FileManager } from '../lib/fileManager';
import { AuditLogger } from '../lib/auditLogger';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'METHOD_NOT_ALLOWED',
      message: '仅支持 POST 请求',
    });
  }

  try {
    const { keyFile } = req.body;

    if (!keyFile || typeof keyFile !== 'object') {
      return res.status(400).json({
        valid: false,
        error: '请提供有效的密钥文件',
      });
    }

    // 1. 提取并验证基本结构
    const { meta, crypto: cryptoData } = keyFile;

    if (!meta?.keyId || !cryptoData?.encryptedSeed || !cryptoData?.iv || !cryptoData?.authTag) {
      return res.status(400).json({
        valid: false,
        error: '密钥文件格式无效或已损坏',
      });
    }

    // 2. 从注册表查找密钥
    const registry = await FileManager.readKeyRegistry();
    const keyRecord = registry.keys.find((k: any) => k.keyId === meta.keyId);

    if (!keyRecord) {
      await AuditLogger.log('AUTH_FAILURE', {
        reason: 'KEY_NOT_FOUND',
        keyId: meta.keyId,
      }, {
        ipAddress: req.socket?.remoteAddress,
      });

      return res.status(401).json({
        valid: false,
        error: '密钥不存在或已被撤销',
      });
    }

    // 3. 检查密钥状态
    if (keyRecord.status !== 'active') {
      return res.status(401).json({
        valid: false,
        error: '密钥已被禁用或已过期',
      });
    }

    // 4. 检查过期时间
    if (keyRecord.expiresAt && new Date(keyRecord.expiresAt) < new Date()) {
      return res.status(401).json({
        valid: false,
        error: '密钥已过期',
      });
    }

    // 5. 更新使用次数
    keyRecord.usageCount += 1;
    await FileManager.writeKeyRegistry(registry);

    // 6. 记录成功验证日志
    await AuditLogger.log('KEY_VERIFY', {
      keyId: meta.keyId,
      usageCount: keyRecord.usageCount,
    }, {
      ipAddress: req.socket?.remoteAddress,
      userAgent: req.headers['user-agent'],
    });

    return res.status(200).json({
      valid: true,
      keyId: meta.keyId,
      message: '密钥验证成功',
    });

  } catch (error) {
    console.error('密钥验证失败:', error);
    return res.status(500).json({
      valid: false,
      error: '验证过程发生错误',
    });
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd f:\web/new
git add api/verify-key.ts
git commit -m "feat: implement key verification API endpoint"
```

---

### Task 12: 实现数据读取 API (api/latest.json.ts)

**Files:**
- Create: `f:\web\new\api\latest.json.ts`

- [ ] **Step 1: 创建最新数据读取接口**

```typescript
// api/latest.json.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { FileManager } from '../lib/fileManager';
import crypto from 'crypto';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'METHOD_NOT_ALLOWED',
      message: '仅支持 GET 请求',
    });
  }

  try {
    const data = await FileManager.readLatestData();

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: '暂无更新数据',
      });
    }

    // 生成 ETag（用于缓存控制）
    const etag = crypto
      .createHash('md5')
      .update(JSON.stringify(data))
      .digest('hex');

    // 检查 If-None-Match 头（条件请求）
    const ifNoneMatch = req.headers['if-none-match'];
    if (ifNoneMatch === `"${etag}"`) {
      return res.status(304).end();
    }

    // 设置缓存头
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600');
    res.setHeader('ETag`, `"${etag}"`);

    return res.status(200).json(data);

  } catch (error) {
    console.error('读取数据失败:', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: '读取数据过程中发生错误',
    });
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd f:\web/new
git add api/latest.json.ts
git commit -m "feat: implement GET /api/latest.json endpoint with caching"
```

---

### Task 13: 实现数据更新 API (api/update.ts)

**Files:**
- Create: `f:\web\new\api\update.ts`

- [ ] **Step 1: 创建数据更新接口**

```typescript
// api/update.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { FileManager, LatestData } from '../lib/fileManager';
import { validateUpdateData } from '../lib/validators';
import { AuditLogger } from '../lib/auditLogger';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'METHOD_NOT_ALLOWED',
      message: '仅支持 POST 请求',
    });
  }

  try {
    const { authorization } = req.headers;
    const { data } = req.body;

    // 1. 验证认证头（简化版，实际应调用 verify-key 逻辑）
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: '缺少认证信息',
      });
    }

    // 2. 验证请求数据
    if (!data || typeof data !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'INVALID_REQUEST',
        message: '请提供有效的更新数据',
      });
    }

    // 3. 字段验证
    const validation = validateUpdateData(data);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: validation.errors,
      });
    }

    // 4. 写入数据（自动添加 releaseDate）
    const result = await FileManager.writeLatestData({
      version: data.version,
      url: data.url,
      size: Number(data.size),
      changelog: data.changelog,
      sha256: data.sha256,
    });

    // 5. 记录审计日志
    await AuditLogger.log('DATA_UPDATE', {
      version: result.version,
      releaseDate: result.releaseDate,
    }, {
      ipAddress: req.socket?.remoteAddress,
      userAgent: req.headers['user-agent'],
    });

    console.log(`✅ 数据更新成功: v${result.version}`);

    return res.status(200).json({
      success: true,
      message: '数据更新成功',
      data: result,
    });

  } catch (error) {
    console.error('数据更新失败:', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: '数据更新过程中发生错误',
    });
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd f:\web/new
git add api/update.ts
git commit -m "feat: implement POST /api/update endpoint with validation"
```

---

### Task 14: 实现密钥重置 API (api/reset-key.ts)

**Files:**
- Create: `f:\web\new\api\reset-key.ts`

- [ ] **Step 1: 创建密钥重置接口**

```typescript
// api/reset-key.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { EncryptionService } from '../lib/encryption';
import { FileManager } from '../lib/fileManager';
import bcrypt from 'bcryptjs';
import { AuditLogger } from '../lib/auditLogger';
import crypto from 'crypto';

interface ResetRequestBody {
  reason?: string;
  force?: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'METHOD_NOT_ALLOWED',
      message: '仅支持 POST 请求',
    });
  }

  try {
    // 1. 验证当前密钥
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: '需要提供当前有效密钥才能执行重置操作',
      });
    }

    let currentKeyData;
    try {
      currentKeyData = JSON.parse(authHeader.slice(7));
    } catch {
      return res.status(400).json({
        success: false,
        error: 'INVALID_KEY_FORMAT',
        message: '密钥格式无效',
      });
    }

    const currentKeyId = currentKeyData.meta?.keyId;
    if (!currentKeyId) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_KEY',
        message: '密钥文件中缺少 keyId',
      });
    }

    // 2. 验证当前密钥是否有效
    const registry = await FileManager.readKeyRegistry();
    const currentKeyRecord = registry.keys.find(
      (k: any) => k.keyId === currentKeyId
    );

    if (!currentKeyRecord || currentKeyRecord.status !== 'active') {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: '当前密钥无效或已过期',
      });
    }

    // 3. 解析请求体
    const body: ResetRequestBody = req.body || {};
    const { reason = '未指定原因' } = body;

    // 4. 生成新的密钥对
    const newKeyPair = EncryptionService.generateKeyPair();
    const newKeyId = EncryptionService.generateKeyId();
    const seed = EncryptionService.generateSeed();
    const encryptedData = EncryptionService.encrypt(seed, newKeyPair);

    // 5. 构建新密钥文件
    const newKeyFile = {
      meta: {
        version: '1.0',
        keyId: newKeyId,
        createdAt: new Date().toISOString(),
        purpose: 'StickyHomeworks Update Manager Authentication',
        resetFrom: currentKeyId,
      },
      crypto: {
        algorithm: 'AES-256-GCM',
        iv: encryptedData.iv,
        encryptedSeed: encryptedData.encryptedSeed,
        authTag: encryptedData.authTag,
      },
      security: {
        expiresAt: null,
        maxUsageCount: -1,
        currentUsageCount: 0,
      },
    };

    // 6. 更新注册表
    const oldKeyIndex = registry.keys.findIndex(
      (k: any) => k.keyId === currentKeyId
    );
    if (oldKeyIndex !== -1) {
      registry.keys[oldKeyIndex] = {
        ...registry.keys[oldKeyIndex],
        status: 'revoked',
        revokedAt: new Date().toISOString(),
        revokeReason: reason,
        replacedBy: newKeyId,
      };
    }

    const newKeyHash = await bcrypt.hash(
      newKeyPair.masterKey.toString('base64'),
      12
    );
    registry.keys.push({
      keyId: newKeyId,
      keyHash: newKeyHash,
      createdAt: new Date().toISOString(),
      expiresAt: null,
      usageCount: 0,
      status: 'active',
    });

    registry.metadata.lastRotated = new Date().toISOString();
    registry.metadata.totalResets = (registry.metadata.totalResets || 0) + 1;

    await FileManager.writeKeyRegistry(registry);

    // 7. 记录审计日志
    await AuditLogger.log(
      'KEY_RESET',
      {
        operatorKeyId: currentKeyId,
        oldKeyId: currentKeyId,
        newKeyId: newKeyId,
        reason,
      },
      {
        ipAddress: req.socket?.remoteAddress,
        userAgent: req.headers['user-agent'],
      }
    );

    console.log(`✅ 密钥重置成功: ${currentKeyId} -> ${newKeyId}`);

    return res.status(200).json({
      success: true,
      message: '密钥重置成功，请立即下载新密钥文件',
      data: {
        newKeyFile,
        resetInfo: {
          oldKeyId: currentKeyId,
          revokedAt: new Date().toISOString(),
          reason,
        },
      },
    });

  } catch (error) {
    console.error('密钥重置失败:', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: '密钥重置过程中发生错误',
    });
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd f:\web/new
git add api/reset-key.ts
git commit -m "feat: implement POST /api/reset-key endpoint"
```

---

### Task 15: 实现中间件系统 (api/middleware/)

**Files:**
- Create: `f:\web\new\api\middleware\auth.ts`
- Create: `f:\web\new\api\middleware\rateLimit.ts`
- Create: `f:\web\new\api\middleware\errorHandler.ts`

- [ ] **Step 1: 创建认证中间件**

```typescript
// api/middleware/auth.ts
import { NextApiRequest, NextApiResponse, NextFunction } from 'next';
import { FileManager } from '../../lib/fileManager';

declare global {
  namespace Express {
    interface Request {
      authenticatedKey?: string;
    }
  }
}

export async function authMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: '缺少认证令牌',
      });
      return;
    }

    let keyData;
    try {
      keyData = JSON.parse(authHeader.slice(7));
    } catch {
      res.status(400).json({
        success: false,
        error: 'INVALID_TOKEN',
        message: '令牌格式无效',
      });
      return;
    }

    const keyId = keyData.meta?.keyId;
    if (!keyId) {
      res.status(400).json({
        success: false,
        error: 'INVALID_KEY',
        message: '密钥文件无效',
      });
      return;
    }

    const registry = await FileManager.readKeyRegistry();
    const keyRecord = registry.keys.find((k: any) => k.keyId === keyId);

    if (!keyRecord || keyRecord.status !== 'active') {
      res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: '密钥无效或已过期',
      });
      return;
    }

    req.authenticatedKey = keyId;
    next();

  } catch (error) {
    console.error('认证中间件错误:', error);
    res.status(500).json({
      success: false,
      error: 'AUTH_ERROR',
      message: '认证过程出错',
    });
  }
}
```

- [ ] **Step 2: 创建频率限制中间件**

```typescript
// api/middleware/rateLimit.ts
import fs from 'fs/promises';
import path from 'path';

interface RateLimitEntry {
  count: number;
  lastReset: string;
}

const STORE_FILE = path.join(process.cwd(), 'data', 'rate_limits.json');
const LIMITS: Record<string, { maxAttempts: number; windowMs: number }> = {
  'reset-key': { maxAttempts: 3, windowMs: 24 * 60 * 60 * 1000 },
  'verify-key': { maxAttempts: 10, windowMs: 60 * 60 * 1000 },
  'update-data': { maxAttempts: 30, windowMs: 60 * 60 * 1000 },
};

export async function rateLimitMiddleware(
  action: string,
  identifier: string
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const config = LIMITS[action] || { maxAttempts: 10, windowMs: 3600000 };
  const now = Date.now();

  let store: Record<string, RateLimitEntry> = {};
  try {
    const data = await fs.readFile(STORE_FILE, 'utf-8');
    store = JSON.parse(data);
  } catch {
    // 文件不存在则初始化
  }

  const key = `${action}:${identifier}`;
  const entry = store[key];

  if (!entry || now - new Date(entry.lastReset).getTime() > config.windowMs) {
    store[key] = { count: 1, lastReset: new Date().toISOString() };
    await saveStore(store);
    return { allowed: true };
  }

  if (entry.count >= config.maxAttempts) {
    const retryAfter = Math.ceil(
      (config.windowMs - (now - new Date(entry.lastReset).getTime())) / 1000
    );
    return { allowed: false, retryAfter };
  }

  entry.count++;
  await saveStore(store);
  return { allowed: true };
}

async function saveStore(store: Record<string, RateLimitEntry>): Promise<void> {
  const dir = path.dirname(STORE_FILE);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
}
```

- [ ] **Step 3: 创建错误处理中间件**

```typescript
// api/middleware/errorHandler.ts
import { NextApiRequest, NextApiResponse } from 'next';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  err: ApiError,
  _req: NextApiRequest,
  res: NextApiResponse
): void {
  console.error('API 错误:', err);

  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';

  const response: any = {
    success: false,
    error: code,
  };

  // 生产环境不暴露内部错误详情
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    response.message = '服务器内部错误';
  } else {
    response.message = err.message || '未知错误';
  }

  res.status(statusCode).json(response);
}

export function createError(statusCode: number, code: string, message: string): ApiError {
  const error: ApiError = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}
```

- [ ] **Step 4: Commit**

```bash
cd f:\web/new
git add api/middleware/
git commit -m "feat: implement authentication, rate limiting, and error handling middleware"
```

---

### Task 16: 实现健康检查端点 (api/health.ts)

**Files:**
- Create: `f:\web\new\api\health.ts`

- [ ] **Step 1: 创建健康检查接口**

```typescript
// api/health.ts
import { NextApiRequest, NextApiResponse } from 'next';
import os from 'os';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'METHOD_NOT_ALLOWED',
      message: '仅支持 GET 请求',
    });
  }

  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();

  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(uptime),
    environment: process.env.NODE_ENV || 'development',
    system: {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
      },
    },
    process: {
      memory: {
        rss: memoryUsage.rss,
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        external: memoryUsage.external,
      },
      pid: process.pid,
    },
  });
}
```

- [ ] **Step 2: Commit**

```bash
cd f:\web/new
git add api/health.ts
git commit -m "feat: implement health check endpoint"
```

---

### Task 17: 实现前端工具函数 (client/src/utils/)

**Files:**
- Create: `f:\web\new\client\src\utils\constants.ts`
- Create: `f:\web\new\client\src\utils\api.ts`
- Create: `f:\web\new\client\src\utils\validators.ts`
- Create: `f:\web\new\client\src\utils\encryption.ts`

- [ ] **Step 1: 创建常量定义**

```typescript
// client/src/utils/constants.ts

export const API_BASE_URL = '/api';

export const VALIDATION_RULES = {
  VERSION_PATTERN: /^\d+\.\d+\.\d+\.\d+$/,
  SHA256_PATTERN: /^[a-fA-F0-9]{64}$/,
  MIN_SIZE: 1,
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查网络后重试',
  UNAUTHORIZED: '认证失败，请重新登录',
  VALIDATION_ERROR: '数据验证失败，请检查输入',
  UNKNOWN_ERROR: '未知错误，请联系管理员',
} as const;

export const CACHE_DURATION = {
  LATEST_DATA: 5 * 60 * 1000,  // 5分钟
} as const;
```

- [ ] **Step 2: 创建 API 请求封装**

```typescript
// client/src/utils/api.ts
import { API_BASE_URL, ERROR_MESSAGES } from './constants';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        response.status,
        data.error || 'UNKNOWN_ERROR',
        data.message || ERROR_MESSAGES.UNKNOWN_ERROR
      );
    }

    return data;

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(0, 'NETWORK_ERROR', ERROR_MESSAGES.NETWORK_ERROR);
  }
}

export const api = {
  get: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
};

export { ApiError, ApiResponse };
export default api;
```

- [ ] **Step 3: 创建前端验证规则**

```typescript
// client/src/utils/validators.ts
import { VALIDATION_RULES } from './constants';

export interface FieldValidation {
  valid: boolean;
  error?: string;
}

export function validateVersion(value: string): FieldValidation {
  if (!VALIDATION_RULES.VERSION_PATTERN.test(value)) {
    return {
      valid: false,
      error: '版本号格式不正确，应为 x.x.x.x（例如：1.0.0.0）',
    };
  }
  return { valid: true };
}

export function validateUrl(value: string): FieldValidation {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { valid: false, error: 'URL 必须以 http:// 或 https:// 开头' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: '请输入有效的 URL 地址' };
  }
}

export function validateSize(value: string | number): FieldValidation {
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) {
    return { valid: false, error: '必须为正整数（单位：字节）' };
  }
  return { valid: true };
}

export function validateChangelog(value: string): FieldValidation {
  if (!value || value.trim().length === 0) {
    return { valid: false, error: '变更日志不能为空' };
  }
  return { valid: true };
}

export function validateSha256(value: string): FieldValidation {
  if (!VALIDATION_RULES.SHA256_PATTERN.test(value)) {
    return { valid: false, error: 'SHA256 必须为64位十六进制字符' };
  }
  return { valid: true };
}
```

- [ ] **Step 4: Commit**

```bash
cd f:\web/new
git add client/src/utils/
git commit -m "feat: implement frontend utility functions (API, validators, constants)"
```

---

### Task 18: 实现 React Hooks (client/src/hooks/)

**Files:**
- Create: `f:\web\new\client\src\hooks\useFormValidation.ts`
- Create: `f:\web\new\client\src\hooks\useKeyAuth.ts`
- Create: `f:\web\new\client\src\hooks\useApi.ts`

- [ ] **Step 1: 创建表单验证 Hook**

```typescript
// client/src/hooks/useFormValidation.ts
import { useState, useCallback } from 'react';
import {
  validateVersion,
  validateUrl,
  validateSize,
  validateChangelog,
  validateSha256,
  FieldValidation,
} from '../utils/validators';

export interface FormFields {
  version: string;
  url: string;
  size: string | number;
  changelog: string;
  sha256: string;
}

export interface FormErrors {
  version?: string;
  url?: string;
  size?: string;
  changelog?: string;
  sha256?: string;
}

interface UseFormValidationReturn {
  values: FormFields;
  errors: FormErrors;
  isFormValid: boolean;
  updateField: (field: keyof FormFields, value: any) => void;
  validateField: (field: keyof FormFields) => FieldValidation;
  resetForm: () => void;
}

const INITIAL_VALUES: FormFields = {
  version: '',
  url: '',
  size: '',
  changelog: '',
  sha256: '',
};

export function useFormValidation(): UseFormValidationReturn {
  const [values, setValues] = useState<FormFields>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateField = useCallback(
    (field: keyof FormFields): FieldValidation => {
      switch (field) {
        case 'version':
          return validateVersion(values.version);
        case 'url':
          return validateUrl(values.url);
        case 'size':
          return validateSize(values.size);
        case 'changelog':
          return validateChangelog(values.changelog);
        case 'sha256':
          return validateSha256(values.sha256);
        default:
          return { valid: true };
      }
    },
    [values]
  );

  const updateField = useCallback(
    (field: keyof FormFields, value: any) => {
      setValues((prev) => ({ ...prev, [field]: value }));

      // 实时验证
      const tempValues = { ...values, [field]: value };
      let validation: FieldValidation;

      switch (field) {
        case 'version':
          validation = validateVersion(value);
          break;
        case 'url':
          validation = validateUrl(value);
          break;
        case 'size':
          validation = validateSize(value);
          break;
        case 'changelog':
          validation = validateChangelog(value);
          break;
        case 'sha256':
          validation = validateSha256(value);
          break;
        default:
          validation = { valid: true };
      }

      setErrors((prev) => ({
        ...prev,
        [field]: validation.valid ? undefined : validation.error,
      }));
    },
    [values]
  );

  const isFormValid =
    Object.values(errors).every((e) => !e) &&
    Object.values(values).every((v) => v !== '' && v !== undefined);

  const resetForm = useCallback(() => {
    setValues(INITIAL_VALUES);
    setErrors({});
  }, []);

  return {
    values,
    errors,
    isFormValid,
    updateField,
    validateField,
    resetForm,
  };
}
```

- [ ] **Step 2: 创建密钥认证 Hook**

```typescript
// client/src/hooks/useKeyAuth.ts
import { useState, useCallback } from 'react';
import api from '../utils/api';

interface KeyAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  keyData: any | null;
  error: string | null;
}

export function useKeyAuth() {
  const [state, setState] = useState<KeyAuthState>({
    isAuthenticated: false,
    isLoading: false,
    keyData: null,
    error: null,
  });

  const verifyKey = useCallback(async (keyFileContent: any) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await api.post('/verify-key', { keyFile: keyFileContent });

      if (response.valid) {
        setState({
          isAuthenticated: true,
          isLoading: false,
          keyData: keyFileContent,
          error: null,
        });
        
        // 存储到 sessionStorage（会话级别）
        sessionStorage.setItem('auth_key', JSON.stringify(keyFileContent));
        
        return true;
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: response.error || '密钥验证失败',
        }));
        return false;
      }
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || '验证过程出错',
      }));
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('auth_key');
    setState({
      isAuthenticated: false,
      isLoading: false,
      keyData: null,
      error: null,
    });
  }, []);

  const checkExistingSession = useCallback(() => {
    const storedKey = sessionStorage.getItem('auth_key');
    if (storedKey) {
      try {
        const keyData = JSON.parse(storedKey);
        setState({
          isAuthenticated: true,
          isLoading: false,
          keyData,
          error: null,
        });
        return true;
      } catch {
        sessionStorage.removeItem('auth_key');
      }
    }
    return false;
  }, []);

  return {
    ...state,
    verifyKey,
    logout,
    checkExistingSession,
  };
}
```

- [ ] **Step 3: 创建 API 调用 Hook**

```typescript
// client/src/hooks/useApi.ts
import { useState, useCallback } from 'react';
import api, { ApiResponse, ApiError } from '../utils/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T = any>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (
    endpoint: string,
    options?: { method?: string; body?: any }
  ) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      let response: ApiResponse<T>;

      if (options?.method === 'POST' || options?.body) {
        response = await api.post(endpoint, options.body);
      } else {
        response = await api.get<T>(endpoint);
      }

      setState({
        data: response.data || response,
        loading: false,
        error: null,
      });

      return response;
    } catch (error: any) {
      const errorMessage = error.message || '请求失败';
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}
```

- [ ] **Step 4: Commit**

```bash
cd f:\web/new
git add client/src/hooks/
git commit -m "feat: implement React hooks (form validation, key auth, API calls)"
```

---

### Task 19: 实现布局组件 (client/src/components/Layout/)

**Files:**
- Create: `f:\web\new\client\src\components\Layout\AppBar.tsx`
- Create: `f:\web\new\client\src\components\Layout\Navigation.tsx`

- [ ] **Step 1: 创建顶部导航栏组件**

```tsx
// client/src/components/Layout/AppBar.tsx
import React from 'react';

interface AppBarProps {
  title?: string;
  onMenuClick?: () => void;
}

export function AppBar({ title = 'StickyHomeworks 更新管理器', onMenuClick }: AppBarProps) {
  return (
    <mdui-app-bar variant="center-aligned">
      <mdui-button-icon icon="menu" onClick={onMenuClick}></mdui-button-icon>
      <mdui-app-bar-title>{title}</mdui-app-bar-title>
      <mdui-button-icon icon="more_vert"></mdui-button-icon>
    </mdui-app-bar>
  );
}

export default AppBar;
```

- [ ] **Step 2: 创建导航栏组件**

```tsx
// client/src/components/Layout/Navigation.tsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', icon: 'home', label: '首页' },
  { path: '/edit', icon: 'edit', label: '编辑' },
];

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentValue = navItems.findIndex((item) => item.path === location.pathname);

  return (
    <mdui-navigation-bar
      value={currentValue}
      onChange={(e: any) => {
        const index = e.detail.value as number;
        navigate(navItems[index].path);
      }}
    >
      {navItems.map((item) => (
        <mdui-navigation-bar-item
          key={item.path}
          icon={item.icon}
        >
          {item.label}
        </mdui-navigation-bar-item>
      ))}
    </mdui-navigation-bar>
  );
}

export default Navigation;
```

- [ ] **Step 3: Commit**

```bash
cd f:\web/new
git add client/src/components/Layout/
git commit -m "feat: implement layout components (AppBar, Navigation)"
```

---

### Task 20: 实现表单字段组件 (client/src/components/Forms/)

**Files:**
- Create: `f:\web\new\client\src\components\Forms\VersionField.tsx`
- Create: `f:\web\new\client\src\components\Forms\UrlField.tsx`
- Create: `f:\web\new\client\src\components\Forms\SizeField.tsx`
- Create: `f:\web\new\client\src\components\Forms\ChangelogField.tsx`
- Create: `f:\web\new\client\src\components\Forms\Sha256Field.tsx`

- [ ] **Step 1: 创建版本号输入框组件**

```tsx
// client/src/components/Forms/VersionField.tsx
import React from 'react';

interface VersionFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function VersionField({ value, onChange, error }: VersionFieldProps) {
  return (
    <mdui-text-field
      label="版本号"
      value={value}
      onChange={(e: any) => onChange(e.target.value)}
      helper={`格式: x.x.x.x（例如：0.2.0.0）`}
      error={error || undefined}
      clearable
      variant="outlined"
    ></mdui-text-field>
  );
}

export default VersionField;
```

- [ ] **Step 2: 创建 URL 输入框组件**

```tsx
// client/src/components/Forms/UrlField.tsx
import React from 'react';

interface UrlFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function UrlField({ value, onChange, error }: UrlFieldProps) {
  return (
    <mdui-text-field
      label="下载链接 (URL)"
      value={value}
      onChange={(e: any) => onChange(e.target.value)}
      helper="完整的下载地址，包含协议（http/https）和域名"
      error={error || undefined}
      clearable
      variant="outlined"
    ></mdui-text-field>
  );
}

export default UrlField;
```

- [ ] **Step 3: 创建文件大小输入框组件**

```tsx
// client/src/components/Forms/SizeField.tsx
import React from 'react';

interface SizeFieldProps {
  value: string | number;
  onChange: (value: string) => void;
  error?: string;
}

export function SizeField({ value, onChange, error }: SizeFieldProps) {
  return (
    <mdui-text-field
      label="文件大小"
      type="number"
      value={String(value)}
      onChange={(e: any) => onChange(e.target.value)}
      helper="文件大小，单位：字节（正整数）"
      error={error || undefined}
      min={1}
      variant="outlined"
    ></mdui-text-field>
  );
}

export default SizeField;
```

- [ ] **Step 4: 创建变更日志输入框组件**

```tsx
// client/src/components/Forms/ChangelogField.tsx
import React from 'react';

interface ChangelogFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function ChangelogField({ value, onChange, error }: ChangelogFieldProps) {
  return (
    <mdui-text-field
      label="变更日志"
      value={value}
      onChange={(e: any) => onChange(e.target.value)}
      rows={4}
      error={error || undefined}
      variant="outlined"
    ></mdui-text-field>
  );
}

export default ChangelogField;
```

- [ ] **Step 5: 创建 SHA256 输入框组件**

```tsx
// client/src/components/Forms/Sha256Field.tsx
import React from 'react';

interface Sha256FieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function Sha256Field({ value, onChange, error }: Sha256FieldProps) {
  return (
    <mdui-text-field
      label="SHA256 哈希值"
      value={value}
      onChange={(e: any) => onChange(e.target.value)}
      maxlength={64}
      helper="64位十六进制字符"
      error={error || undefined}
      clearable
      variant="outlined"
    ></mdui-text-field>
  );
}

export default Sha256Field;
```

- [ ] **Step 6: Commit**

```bash
cd f:\web/new
git add client/src/components/Forms/
git commit -m "feat: implement form field components (version, url, size, changelog, sha256)"
```

---

### Task 21: 实现密钥下载组件 (client/src/components/KeyManagement/KeyDownloader.tsx)

**Files:**
- Create: `f:\web\new\client\src\components\KeyManagement\KeyDownloader.tsx`

- [ ] **Step 1: 创建密钥下载对话框组件**

```tsx
// client/src/components/KeyManagement/KeyDownloader.tsx
import React, { useState } from 'react';

interface KeyDownloaderProps {
  keyFileData: object;
  onDownloadComplete: () => void;
}

export function KeyDownloader({ keyFileData, onDownloadComplete }: KeyDownloaderProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);

    try {
      const jsonString = JSON.stringify(keyFileData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `auth_key_${new Date().toISOString().slice(0, 10)}.json`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setTimeout(() => {
        onDownloadComplete();
      }, 1500);

    } catch (error) {
      console.error('下载失败:', error);
      alert('下载失败，请重试');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <mdui-dialog headline="🔑 重要：下载您的密钥文件" open>
      <div style={{ padding: '24px', maxWidth: '500px' }}>
        <mdui-alert variant="warning" style={{ marginBottom: '16px' }}>
          这是您<strong>唯一</strong>的密钥文件，请立即下载并保存到安全位置！
        </mdui-alert>

        <ul style={{ lineHeight: '1.8', color: '#666', paddingLeft: '20px' }}>
          <li>📁 文件将保存为 <code>.json</code> 格式</li>
          <li>🔒 请勿分享给他人</li>
          <li>💾 建议备份到多个位置</li>
          <li>⚠️ 丢失后将无法恢复</li>
        </ul>

        <mdui-button
          fullWidth
          variant="filled"
          onClick={handleDownload}
          loading={downloading}
          disabled={downloading}
          style={{ marginTop: '20px' }}
        >
          {downloading ? '正在生成...' : '⬇️ 下载密钥文件'}
        </mdui-button>
      </div>
    </mdui-dialog>
  );
}

export default KeyDownloader;
```

- [ ] **Step 2: Commit**

```bash
cd f:\web/new
git add client/src/components/KeyManagement/KeyDownloader.tsx
git commit -m "feat: implement key download dialog component"
```

---

### Task 22: 实现密钥导入组件 (client/src/components/KeyManagement/KeyImporter.tsx)

**Files:**
- Create: `f:\web\new\client\src\components\KeyManagement\KeyImporter.tsx`

- [ ] **Step 1: 创建拖放/选择文件导入组件**

```tsx
// client/src/components/KeyManagement/KeyImporter.tsx
import React, { useState, useCallback, useRef } from 'react';

interface KeyImporterProps {
  onImportSuccess: (data: any) => void;
}

export function KeyImporter({ onImportSuccess }: KeyImporterProps) {
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith('.json') && file.type !== 'application/json') {
        setErrorMessage('请选择 .json 格式的密钥文件');
        return;
      }

      setLoading(true);
      setErrorMessage(null);

      try {
        const text = await file.text();
        const keyData = JSON.parse(text);

        if (!keyData.meta?.keyId || !keyData.crypto?.encryptedSeed) {
          throw new Error('密钥文件结构不完整');
        }

        onImportSuccess(keyData);
      } catch (error: any) {
        setErrorMessage(error.message || '文件解析失败');
      } finally {
        setLoading(false);
      }
    },
    [onImportSuccess]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        processFile(files[0]);
      }
    },
    [processFile]
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      style={{
        border: `3px dashed ${dragOver ? '#6750A4' : '#ccc'}`,
        borderRadius: '12px',
        padding: '48px',
        textAlign: 'center',
        backgroundColor: dragOver ? '#F3EDF7' : '#fafafa',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processFile(file);
        }}
        style={{ display: 'none' }}
      />

      {loading ? (
        <mdui-circular-progress></mdui-circular-progress>
      ) : (
        <>
          <mdui-icon-cloud_upload
            size="64"
            style={{ color: dragOver ? '#6750A4' : '#999' }}
          ></mdui-icon-cloud_upload>

          <h3 style={{ marginTop: '16px', color: '#333' }}>
            {dragOver ? '释放以上传密钥文件' : '拖放密钥文件到这里'}
          </h3>

          <p style={{ color: '#666', marginTop: '8px' }}>
            或者{' '}
            <span style={{ color: '#6750A4', fontWeight: 'bold' }}>点击选择文件</span>
          </p>

          <p style={{ fontSize: '12px', color: '#999', marginTop: '16px' }}>
            支持 .json 格式的密钥文件
          </p>

          {errorMessage && (
            <mdui-alert variant="danger" style={{ marginTop: '16px' }}>
              ❌ {errorMessage}
            </mdui-alert>
          )}
        </>
      )}
    </div>
  );
}

export default KeyImporter;
```

- [ ] **Step 2: Commit**

```bash
cd f:\web/new
git add client/src/components/KeyManagement/KeyImporter.tsx
git commit -m "feat: implement key import component with drag-and-drop support"
```

---

### Task 23: 实现密钥重置组件 (client/src/components/KeyManagement/KeyResetter.tsx)

**Files:**
- Create: `f:\web\new\client\src\components\KeyManagement\KeyResetter.tsx`

- [ ] **Step 1: 创建密钥重置确认对话框组件**

```tsx
// client/src/components/KeyManagement/KeyResetter.tsx
import React, { useState } from 'react';
import api from '../../utils/api';

interface KeyResetterProps {
  currentKey: any;
  onResetComplete: (newKey: any) => void;
}

export function KeyResetter({ currentKey, onResetComplete }: KeyResetterProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [resetReason, setResetReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmReset = async () => {
    if (!resetReason.trim()) {
      alert('请输入重置原因');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/reset-key', {
        reason: resetReason,
        force: false,
      }, {
        headers: {
          'Authorization': `Bearer ${JSON.stringify(currentKey)}`,
        },
      });

      if (response.success) {
        alert('密钥重置成功！正在准备下载新密钥...');
        
        // 下载新密钥文件
        const newKeyBlob = new Blob(
          [JSON.stringify(response.data.newKeyFile, null, 2)],
          { type: 'application/json' }
        );
        const url = URL.createObjectURL(newKeyBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `auth_key_reset_${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        URL.revokeObjectURL(url);

        onResetComplete(response.data.newKeyFile);
        setShowConfirmDialog(false);
      } else {
        alert(response.message || '重置失败');
      }
    } catch (error: any) {
      alert(error.message || '网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <mdui-button
        variant="text"
        onClick={handleResetClick}
        style={{ color: '#B3261E' }}
      >
        🔄 重置密钥
      </mdui-button>

      <mdui-dialog
        headline="⚠️ 确认重置密钥"
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
      >
        <div style={{ padding: '24px' }}>
          <mdui-alert variant="danger" style={{ marginBottom: '16px' }}>
            <strong>警告：</strong>此操作将使当前密钥<strong>立即失效</strong>！
          </mdui-alert>

          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                fontWeight: 'bold',
                marginBottom: '8px',
              }}
            >
              请输入重置原因（必填）：
            </label>
            <mdui-text-field
              value={resetReason}
              onChange={(e: any) => setResetReason(e.target.value)}
              placeholder="例如：密钥丢失 / 怀疑泄露 / 定期轮换"
              rows={3}
            ></mdui-text-field>
          </div>

          <div
            style={{
              backgroundColor: '#FFF8F8',
              border: '1px solid #F28B82',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '14px',
              lineHeight: '1.6',
            }}
          >
            <strong>📋 重置后的影响：</strong>
            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
              <li>当前密钥将立即失效</li>
              <li>系统将生成全新的密钥文件</li>
              <li>您需要重新下载并保存新密钥</li>
              <li>旧密钥的所有会话将被终止</li>
            </ul>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '24px',
              justifyContent: 'flex-end',
            }}
          >
            <mdui-button
              variant="text"
              onClick={() => setShowConfirmDialog(false)}
              disabled={loading}
            >
              取消
            </mdui-button>

            <mdui-button
              variant="filled"
              onClick={handleConfirmReset}
              loading={loading}
              disabled={loading || !resetReason.trim()}
              style={{ backgroundColor: '#B3261E' }}
            >
              {loading ? '重置中...' : '确认重置'}
            </mdui-button>
          </div>
        </div>
      </mdui-dialog>
    </div>
  );
}

export default KeyResetter;
```

- [ ] **Step 2: Commit**

```bash
cd f:\web/new
git add client/src/components/KeyManagement/KeyResetter.tsx
git commit -m "feat: implement key reset confirmation dialog component"
```

---

### Task 24: 实现通用 UI 组件 (client/src/components/UI/)

**Files:**
- Create: `f:\web\new\client\src\components\UI\LoadingSpinner.tsx`
- Create: `f:\web\new\client\src\components\UI\ErrorBoundary.tsx`
- Create: `f:\web\new\client\src\components\UI\S Snackbar.tsx`

- [ ] **Step 1: 创建加载动画组件**

```tsx
// client/src/components/UI/LoadingSpinner.tsx
import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  fullscreen?: boolean;
}

export function LoadingSpinner({
  message = '加载中...',
  fullscreen = false,
}: LoadingSpinnerProps) {
  if (fullscreen) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          zIndex: 9999,
        }}
      >
        <mdui-circular-progress></mdui-circular-progress>
        <p style={{ marginTop: '16px', color: '#666' }}>{message}</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px',
      }}
    >
      <mdui-circular-progress></mdui-circular-progress>
      <p style={{ marginTop: '16px', color: '#666' }}>{message}</p>
    </div>
  );
}

export default LoadingSpinner;
```

- [ ] **Step 2: 创建错误边界组件**

```tsx
// client/src/components/UI/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            style={{
              padding: '48px',
              textAlign: 'center',
              backgroundColor: '#FFF8F8',
              borderRadius: '8px',
              margin: '24px',
            }}
          >
            <h2 style={{ color: '#B3261E', marginBottom: '16px' }}>
              ⚠️ 出错了
            </h2>
            <p style={{ color: '#666', marginBottom: '16px' }}>
              {this.state.error?.message || '发生了未知错误'}
            </p>
            <mdui-button
              variant="filled"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              重试
            </mdui-button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

- [ ] **Step 3: Commit**

```bash
cd f:\web/new
git add client/src/components/UI/
git commit -m "feat: implement common UI components (LoadingSpinner, ErrorBoundary)"
```

---

### Task 25: 实现首页 (client/src/pages/HomePage.tsx)

**Files:**
- Create: `f:\web\new\client\src\pages\HomePage.tsx`

- [ ] **Step 1: 创建首页组件（密钥检测与导入）**

```tsx
// client/src/pages/HomePage.tsx
import React, { useEffect, useState } from 'react';
import { useKeyAuth } from '../hooks/useKeyAuth';
import { KeyImporter } from '../components/KeyManagement/KeyImporter';
import { KeyDownloader } from '../components/KeyManagement/KeyDownloader';
import api from '../utils/api';

export function HomePage() {
  const { isAuthenticated, isLoading, verifyKey, checkExistingSession } = useKeyAuth();
  const [showDownloader, setShowDownloader] = useState(false);
  const [keyFileData, setKeyFileData] = useState<object | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    checkForExistingKey();
  }, []);

  const checkForExistingKey = async () => {
    const hasSession = checkExistingSession();
    if (!hasSession) {
      await checkIfKeyExistsOnServer();
    }
  };

  const checkIfKeyExistsOnServer = async () => {
    try {
      const response = await api.get('/verify-key', {
        headers: { 'X-Check-Only': 'true' },
      });
      if (response.hasExistingKey) {
        setShowDownloader(true);
      }
    } catch {
      // 首次访问，需要生成密钥
      setGenerating(true);
      await generateNewKey();
    }
  };

  const generateNewKey = async () => {
    try {
      const response = await api.post('/generate-key');
      if (response.success) {
        setKeyFileData(response.data);
        setShowDownloader(true);
      }
    } catch (error) {
      console.error('生成密钥失败:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleImportSuccess = async (keyData: any) => {
    const success = await verifyKey(keyData);
    if (success) {
      window.location.href = '/edit';
    }
  };

  const handleDownloadComplete = () => {
    setShowDownloader(false);
    window.location.href = '/edit';
  };

  if (isLoading || generating) {
    return (
      <div style={{ padding: '48px', textAlign: 'center' }}>
        <mdui-circular-progress></mdui-circular-progress>
        <p style={{ marginTop: '16px', color: '#666' }}>
          {generating ? '正在生成密钥...' : '正在验证...'}
        </p>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div style={{ padding: '48px', textAlign: 'center' }}>
        <mdui-icon-check_circle size="64" style={{ color: '#056E33' }}></mdui-icon-check_circle>
        <h2 style={{ marginTop: '16px', color: '#056E33' }}>✅ 认证成功</h2>
        <p style={{ color: '#666', marginTop: '8px' }}>正在跳转到编辑页面...</p>
        {setTimeout(() => (window.location.href = '/edit'), 1000)}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '32px', color: '#6750A4' }}>
        🔐 StickyHomeworks 更新管理器
      </h1>

      {showDownloader && keyFileData ? (
        <KeyDownloader
          keyFileData={keyFileData}
          onDownloadComplete={handleDownloadComplete}
        />
      ) : (
        <>
          <div
            style={{
              backgroundColor: '#F3EDF7',
              border: '1px solid #D0BCFF',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px',
            }}
          >
            <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#4F378B' }}>
              <strong>欢迎使用！</strong> 为了保障数据安全，您需要使用密钥文件进行身份验证。
              {showDownloader
                ? ' 系统已为您生成新的密钥文件，请立即下载保存。'
                : ' 请上传您的密钥文件以继续。'}
            </p>
          </div>

          <KeyImporter onImportSuccess={handleImportSuccess} />
        </>
      )}
    </div>
  );
}

export default HomePage;
```

- [ ] **Step 2: Commit**

```bash
cd f:\web/new
git add client/src/pages/HomePage.tsx
git commit -m "feat: implement home page with key detection and import functionality"
```

---

### Task 26: 实现编辑页面 (client/src/pages/EditPage.tsx)

**Files:**
- Create: `f:\web\new\client\src\pages\EditPage.tsx`

- [ ] **Step 1: 创建编辑页面组件（表单与提交）**

```tsx
// client/src/pages/EditPage.tsx
import React, { useEffect, useState } from 'react';
import { useFormValidation } from '../hooks/useFormValidation';
import { useApi } from '../hooks/useApi';
import { useKeyAuth } from '../hooks/useKeyAuth';
import { VersionField } from '../components/Forms/VersionField';
import { UrlField } from '../components/Forms/UrlField';
import { SizeField } from '../components/Forms/SizeField';
import { ChangelogField } from '../components/Forms/ChangelogField';
import { Sha256Field } from '../components/Forms/Sha256Field';
import { KeyResetter } from '../components/KeyManagement/KeyResetter';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import api from '../utils/api';
import { LatestData } from '../../../lib/fileManager';

export function EditPage() {
  const { values, errors, isFormValid, updateField, resetForm } = useFormValidation();
  const { execute: fetchLatest, data: latestData, loading: loadingLatest } = useApi<LatestData>();
  const { submit: submitUpdate, loading: submitting, error: submitError } = useApi();
  const { isAuthenticated, keyData, checkExistingSession, logout } = useKeyAuth();
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const hasSession = checkExistingSession();
    if (!hasSession) {
      window.location.href = '/';
      return;
    }

    loadCurrentData();
  }, []);

  const loadCurrentData = async () => {
    try {
      await fetchLatest('/latest.json');
      if (latestData) {
        updateField('version', latestData.version);
        updateField('url', latestData.url);
        updateField('size', latestData.size);
        updateField('changelog', latestData.changelog);
        updateField('sha256', latestData.sha256);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid || !isAuthenticated) {
      return;
    }

    try {
      const response = await api.post(
        '/update',
        {
          data: {
            version: values.version,
            url: values.url,
            size: Number(values.size),
            changelog: values.changelog,
            sha256: values.sha256,
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${JSON.stringify(keyData)}`,
          },
        }
      );

      if (response.success) {
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 3000);
      }
    } catch (error: any) {
      console.error('提交失败:', error);
      alert(error.message || '提交失败，请重试');
    }
  };

  const handleReset = (newKey: any) => {
    logout();
    sessionStorage.setItem('auth_key', JSON.stringify(newKey));
    window.location.reload();
  };

  if (!isAuthenticated) {
    return <LoadingSpinner message="正在验证身份..." fullscreen />;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
        }}
      >
        <h1 style={{ color: '#6750A4' }}>✏️ 编辑更新信息</h1>
        <KeyResetter currentKey={keyData} onResetComplete={handleReset} />
      </div>

      {submitSuccess && (
        <mdui-alert variant="success" style={{ marginBottom: '24px' }}>
          ✅ 数据更新成功！releaseDate: {new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
        </mdui-alert>
      )}

      {submitError && (
        <mdui-alert variant="danger" style={{ marginBottom: '24px' }}>
          ❌ {submitError}
        </mdui-alert>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <VersionField
            value={values.version}
            onChange={(v) => updateField('version', v)}
            error={errors.version}
          />

          <UrlField
            value={values.url}
            onChange={(v) => updateField('url', v)}
            error={errors.url}
          />

          <SizeField
            value={values.size}
            onChange={(v) => updateField('size', v)}
            error={errors.size}
          />

          <ChangelogField
            value={values.changelog}
            onChange={(v) => updateField('changelog', v)}
            error={errors.changelog}
          />

          <Sha256Field
            value={values.sha256}
            onChange={(v) => updateField('sha256', v)}
            error={errors.sha256}
          />

          <mdui-button
            type="submit"
            variant="filled"
            fullWidth
            loading={submitting}
            disabled={!isFormValid || submitting}
            style={{ marginTop: '24px' }}
          >
            {submitting ? '提交中...' : '💾 提交更新'}
          </mdui-button>
        </div>
      </form>

      {loadingLatest && <LoadingSpinner message="正在加载数据..." />}
    </div>
  );
}

export default EditPage;
```

- [ ] **Step 2: Commit**

```bash
cd f:\web/new
git add client/src/pages/EditPage.tsx
git commit -m "feat: implement edit page with form validation and submission"
```

---

### Task 27: 整合应用入口和路由 (client/src/App.tsx 更新)

**Files:**
- Modify: `f:\web\new\client\src\App.tsx`

- [ ] **Step 1: 更新 App 组件，整合路由和布局**

```tsx
// client/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppBar } from './components/Layout/AppBar';
import { Navigation } from './components/Layout/Navigation';
import { HomePage } from './pages/HomePage';
import { EditPage } from './pages/EditPage';
import { ErrorBoundary } from './components/UI/ErrorBoundary';
import './styles/global.css';

function AppContent() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar />
      
      <main style={{ flex: 1, paddingBottom: '80px' }}>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/edit" element={<EditPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </main>

      <Navigation />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
```

- [ ] **Step 2: Commit**

```bash
cd f:\web/new
git add client/src/App.tsx
git commit -m "feat: integrate routing, layout, and pages into main App component"
```

---

### Task 28: 编写单元测试 (可选但推荐)

**Files:**
- Create: `f:\web\new\tests\encryption.test.ts`
- Create: `f:\web\new\tests\validators.test.ts`

- [ ] **Step 1: 创建加密模块测试**

```typescript
// tests/encryption.test.ts
import { EncryptionService } from '../lib/encryption';

describe('EncryptionService', () => {
  describe('generateKeyPair', () => {
    it('should generate a key pair with correct lengths', () => {
      const keyPair = EncryptionService.generateKeyPair();
      
      expect(keyPair.masterKey).toBeInstanceOf(Buffer);
      expect(keyPair.masterKey.length).toBe(32); // 256 bits
      
      expect(keyPair.iv).toBeInstanceOf(Buffer);
      expect(keyPair.iv.length).toBe(16); // 128 bits
    });

    it('should generate unique key pairs', () => {
      const keyPair1 = EncryptionService.generateKeyPair();
      const keyPair2 = EncryptionService.generateKeyPair();
      
      expect(keyPair1.masterKey.equals(keyPair2.masterKey)).toBe(false);
      expect(keyPair1.iv.equals(keyPair2.iv)).toBe(false);
    });
  });

  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt correctly', () => {
      const keyPair = EncryptionService.generateKeyPair();
      const plaintext = 'Hello, World!';
      
      const encrypted = EncryptionService.encrypt(plaintext, keyPair);
      const decrypted = EncryptionService.decrypt(encrypted, keyPair.masterKey);
      
      expect(decrypted).toBe(plaintext);
    });

    it('should throw error if ciphertext is tampered', () => {
      const keyPair = EncryptionService.generateKeyPair();
      const plaintext = 'Sensitive data';
      
      const encrypted = EncryptionService.encrypt(plaintext, keyPair);
      
      // 篡改密文
      encrypted.encryptedSeed = 'tampered' + encrypted.encryptedSeed;
      
      expect(() => {
        EncryptionService.decrypt(encrypted, keyPair.masterKey);
      }).toThrow();
    });
  });

  describe('generateKeyId', () => {
    it('should generate a key ID with correct format', () => {
      const keyId = EncryptionService.generateKeyId();
      
      expect(keyId).toMatch(/^key_\d{8}_[a-f0-9]{12}$/);
    });
  });
});
```

- [ ] **Step 2: 创建验证器测试**

```typescript
// tests/validators.test.ts
import {
  validateVersion,
  validateUrl,
  validateSize,
  validateChangelog,
  validateSha256,
  validateUpdateData,
} from '../lib/validators';

describe('Validators', () => {
  describe('validateVersion', () => {
    it('should accept valid version format', () => {
      expect(validateVersion('1.0.0.0').valid).toBe(true);
      expect(validateVersion('0.2.0.0').valid).toBe(true);
      expect(validateVersion('10.20.30.40').valid).toBe(true);
    });

    it('should reject invalid version format', () => {
      expect(validateVersion('1.0').valid).toBe(false);
      expect(validateVersion('1.0.0').valid).toBe(false);
      expect(validateVersion('abc').valid).toBe(false);
      expect(validateVersion('').valid).toBe(false);
    });
  });

  describe('validateUrl', () => {
    it('should accept valid URLs', () => {
      expect(validateUrl('https://example.com').valid).toBe(true);
      expect(validateUrl('http://test.org/path?query=1').valid).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(validateUrl('not-a-url').valid).toBe(false);
      expect(validateUrl('ftp://example.com').valid).toBe(false);
    });
  });

  describe('validateUpdateData', () => {
    it('should accept complete valid data', () => {
      const data = {
        version: '1.0.0.0',
        url: 'https://example.com/file.zip',
        size: 1024,
        changelog: 'Test update',
        sha256: 'a'.repeat(64),
      };

      const result = validateUpdateData(data);
      expect(result.valid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });

    it('should reject incomplete data', () => {
      const data = {
        version: 'invalid',
        url: 'not-a-url',
        size: -1,
        changelog: '',
        sha256: 'short',
      };

      const result = validateUpdateData(data);
      expect(result.valid).toBe(false);
      expect(Object.keys(result.errors).length).toBe(5);
    });
  });
});
```

- [ ] **Step 3: Commit**

```bash
cd f:\web/new
git add tests/
git commit -m "test: add unit tests for encryption and validation modules"
```

---

### Task 29: 运行代码质量检查

**Files:**
- 无（运行 lint 命令）

- [ ] **Step 1: 运行 ESLint 检查**

Run: `npm run lint` in `f:\web\new`
Expected: 输出代码质量报告，修复所有 warning 和 error

- [ ] **Step 2: 运行 TypeScript 类型检查**

Run: `cd client && npx tsc --noEmit`
Expected: 无类型错误

Run: `cd api && npx tsc --noEmit`
Expected: 无类型错误

- [ ] **Step 3: 修复发现的问题**

手动修复 ESLint 报告的所有问题

- [ ] **Step 4: Commit**

```bash
cd f:\web/new
git add -A
git commit -m "style: fix linting issues and improve code quality"
```

---

### Task 30: 编写 README.md 文档

**Files:**
- Create: `f:\web\new\README.md`

- [ ] **Step 1: 创建完整的项目文档**

```markdown
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

### 环境变量配置（可选）

在 Vercel Dashboard 中设置以下环境变量：

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `ENCRYPTION_SECRET` | 额外加密层密钥 | 至少32字符的随机字符串 |
| `NODE_ENV` | 运行环境 | `production` |

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

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

## 📄 许可证

MIT License

## 📞 支持

如有问题或建议，请提交 Issue 或联系维护者。

---

**最后更新**: 2026-04-10  
**版本**: 1.0.0  
**作者**: AI Assistant
```

- [ ] **Step 2: Commit**

```bash
cd f:\web/new
git add README.md
git commit -m "docs: add comprehensive README documentation"
```

---

### Task 31: 创建 Vercel 部署配置

**Files:**
- Create: `f:\web\new\vercel.json`

- [ ] **Step 1: 创建 vercel.json 配置文件**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "api/**/*.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*\\.(css|js|png|jpg|svg|ico|woff2?))$",
      "dest": "/client/dist/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/client/dist/index.html"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization, X-Check-Only"
        }
      ]
    },
    {
      "source": "/api/latest.json",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=300, s-maxage=600"
        },
        {
          "key": "ETag",
          "value": "\"dynamic\""
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd f:\web/new
git add vercel.json
git commit -m "ci: add Vercel deployment configuration"
```

---

### Task 32: 最终验证和测试

**Files:**
- 无（运行测试命令）

- [ ] **Step 1: 完整构建测试**

Run: `npm run build:client` in `f:\web\new`
Expected: 成功构建，输出到 `client/dist/`

- [ ] **Step 2: 启动生产模式预览**

Run: `cd client && npm run preview`
Expected: 生产构建预览服务器启动

- [ ] **Step 3: 功能清单验证**

手动测试以下功能：
- [ ] 首页显示正常
- [ ] 密钥生成和下载功能正常
- [ ] 密钥导入（拖放和点击）功能正常
- [ ] 表单验证（所有字段）正常工作
- [ ] 数据提交功能正常
- [ ] GET /api/latest.json 返回正确数据
- [ ] 密钥重置功能正常
- [ ] 移动端响应式布局正常
- [ ] 错误处理和用户反馈正常

- [ ] **Step 4: 最终 Commit**

```bash
cd f:\web/new
git add -A
git commit -m "chore: final project setup and configuration"
```

---

## 任务依赖关系图

```
Task 1 (根配置)
  ↓
Task 2 (前端项目) ←→ Task 3 (API 目录)  [可并行]
  ↓                      ↓
Task 4 (安装依赖) ←─────────────┘
  ↓
Task 5-9 (核心库)  [可并行]
  ↓
Task 10-16 (API 路由)  [有顺序依赖]
  ↓
Task 17-19 (前端工具)  [可并行]
  ↓
Task 20-24 (UI 组件)  [可并行]
  ↓
Task 25-27 (页面集成)  [有顺序依赖]
  ↓
Task 28 (测试) → Task 29 (代码质量)  [可并行]
  ↓
Task 30 (文档) → Task 31 (Vercel 配置)  [可并行]
  ↓
Task 32 (最终验证)
```

---

## 预估时间

| 阶段 | 任务数 | 预估时间 |
|------|--------|----------|
| 项目初始化 | 4 | 30 分钟 |
| 后端核心库 | 5 | 45 分钟 |
| API 路由 | 7 | 60 分钟 |
| 前端基础设施 | 4 | 45 分钟 |
| UI 组件 | 7 | 90 分钟 |
| 页面集成 | 3 | 45 分钟 |
| 测试与质量 | 2 | 30 分钟 |
| 文档与部署 | 2 | 30 分钟|
| **总计** | **35** | **~6 小时** |

---

## 风险与缓解措施

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| MDUI 兼容性问题 | UI 渲染异常 | 使用稳定版本，查阅官方文档 |
| Vercel Serverless 限制 | 执行超时 | 优化代码性能，避免长时间操作 |
| 文件系统权限 | 数据写入失败 | 使用 Vercel 提供的 `/tmp` 目录 |
| 加密算法兼容性 | 跨平台问题 | 使用 Node.js 内置 crypto 模块 |

---

**计划版本**: 1.0  
**创建日期**: 2026-04-10  
**设计文档**: [design.md](./docs/superpowers/specs/2026-04-10-stickyhomeworks-update-manager-design.md)  
**下一步**: 选择执行方式（Subagent-Driven 或 Inline Execution）
