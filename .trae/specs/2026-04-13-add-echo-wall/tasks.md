# Tasks
- [x] Task 1: 添加后端数据存储功能
  - [x] SubTask 1.1: 在 `api/_shared.js` 中添加 `echoes` 表的创建
  - [x] SubTask 1.2: 在 `api/_shared.js` 中添加回声洞读写函数（readEchoes, writeEcho, updateEchoApproval, deleteEcho）

- [x] Task 2: 创建公共 API 端点
  - [x] SubTask 2.1: 创建 `api/echoes.js`，实现 GET 请求返回已审批回声洞列表
  - [x] SubTask 2.2: 创建 `api/echoes.js`，实现 POST 请求提交新回声洞

- [x] Task 3: 创建管理 API 端点
  - [x] SubTask 3.1: 创建 `api/echoes-admin.js`，实现 GET 请求返回待审批回声洞列表
  - [x] SubTask 3.2: 创建 `api/echoes-admin.js`，实现 POST 请求审批回声洞（同意/不同意）

- [x] Task 4: 前端 API 集成
  - [x] SubTask 4.1: 在 `client/src/utils/api.ts` 中添加回声洞相关 API 函数
  - [x] SubTask 4.2: 创建 `client/src/pages/EchoSubmitPage.tsx` 用户投稿页面（独立页面，不添加到导航）
  - [x] SubTask 4.3: 创建 `client/src/pages/EchoAdminPage.tsx` 开发者审批页面
  - [x] SubTask 4.4: 更新 `client/src/App.tsx` 添加路由
  - [x] SubTask 4.5: 在底部导航栏 `client/src/components/Layout/Navigation.tsx` 中添加回声洞审批入口

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 1
- Task 4 depends on Task 2 and Task 3
