# Tasks
- [x] Task 1: 添加后端数据存储功能
  - [x] SubTask 1.1: 在 `api/_shared.js` 中添加 `beta_data` 表的创建和读写函数
  - [x] SubTask 1.2: 在 `api/_shared.js` 中添加 `beta_changelog_data` 表的创建和读写函数

- [x] Task 2: 创建 beta.json API 端点
  - [x] SubTask 2.1: 创建 `api/beta.json.js`，实现 GET 请求返回测试版本信息
  - [x] SubTask 2.2: 确保格式与 latest.json 完全一致

- [x] Task 3: 创建 betamd.json API 端点
  - [x] SubTask 3.1: 创建 `api/betamd.json.js`，实现 GET 请求返回测试版本 Markdown 更新日志

- [x] Task 4: 前端 API 集成
  - [x] SubTask 4.1: 在 `client/src/utils/api.ts` 中添加 `getBetaVersion()` 和 `getBetaChangelog()` 函数
  - [x] SubTask 4.2: 在 `client/src/pages/HomePage.tsx` 中添加测试版本展示区域
  - [x] SubTask 4.3: 在 `client/src/pages/EditPage.tsx` 中添加测试版本编辑功能

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 1
- Task 4 depends on Task 2 and Task 3