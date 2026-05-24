# 回声洞 (Echo Wall) 功能规范

## Why
需要为用户提供一个可以投稿心声、表达想法的"回声洞"功能，同时开发者可以审批投稿内容，决定哪些内容可以被展示。通过 API 接口返回已审批的回声洞内容供调用。

## What Changes
- 添加 `api/echoes.js` - GET 返回已审批回声洞列表，POST 提交新回声洞
- 添加 `api/echoes-admin.js` - 开发者审批回声洞（同意/不同意）
- 在 `api/_shared.js` 中添加回声洞数据表的创建和读写函数
- 添加用户投稿页面 `client/src/pages/EchoSubmitPage.tsx`（独立页面，不添加到导航中）
- 添加开发者审批页面 `client/src/pages/EchoAdminPage.tsx`
- 在底部导航栏中添加回声洞审批入口
- 更新路由配置

## Impact
- Affected specs: 新功能模块
- Affected code: `api/_shared.js`, `App.tsx`, 导航组件, 前端页面

## ADDED Requirements

### Requirement: 回声洞数据库存储
系统 shall 提供回声洞数据的持久化存储，包含主内容、投稿人称呼、审批状态、提交时间等字段。

#### Scenario: 数据表结构
- **WHEN** 系统初始化
- **THEN** 创建 `echoes` 表，包含 id, text, user, approved (boolean), created_at 字段

### Requirement: 用户投稿回声洞
用户 shall 能够提交新的回声洞内容，包含主内容和投稿人称呼。投稿页面为独立页面，不添加到应用导航中，通过直接访问 URL 进入。

#### Scenario: 用户提交回声洞
- **WHEN** 用户访问投稿页面 `/echo-submit`，输入内容和称呼后提交
- **THEN** 内容被保存到数据库，审批状态为"待审批"(false)
- **AND** 用户收到提交成功提示

#### Scenario: 投稿表单验证
- **WHEN** 用户未填写必填字段就提交
- **THEN** 显示相应的验证错误提示

### Requirement: 开发者审批回声洞
开发者（已认证）shall 能够查看待审批的回声洞列表，并对每个条目进行同意或不同意的操作。审批页面集成在应用内，通过底部导航栏访问。

#### Scenario: 查看待审批列表
- **WHEN** 开发者通过底部导航栏访问审批页面
- **THEN** 显示所有待审批的回声洞内容和投稿人称呼

#### Scenario: 同意回声洞
- **WHEN** 开发者点击"同意"按钮
- **THEN** 该回声洞的 approved 状态更新为 true
- **AND** 从待审批列表中移除

#### Scenario: 不同意回声洞
- **WHEN** 开发者点击"不同意"按钮
- **THEN** 该回声洞从数据库中删除
- **AND** 从待审批列表中移除

### Requirement: 底部导航栏
底部导航栏 shall 包含回声洞审批入口，供开发者访问审批页面。

#### Scenario: 导航入口
- **WHEN** 开发者查看底部导航栏
- **THEN** 显示回声洞审批入口图标和文字

### Requirement: 回声洞 API 调用接口
系统 shall 提供公共 API 接口返回已审批的回声洞列表，格式为 JSON 数组。

#### Scenario: 获取已审批回声洞
- **WHEN** 客户端调用 GET `/api/echoes`
- **THEN** 返回所有 approved=true 的回声洞列表
- **AND** 每个条目包含 text 和 user 字段

#### Scenario: 无回声洞数据
- **WHEN** 没有已审批的回声洞
- **THEN** 返回空数组 `[]`

### Requirement: 页面风格一致性
新页面 shall 遵循现有页面的设计风格和布局模式。

#### Scenario: 视觉一致性
- **WHEN** 用户浏览回声洞相关页面
- **THEN** 使用与 HomePage、EditPage 相同的 AppBar、Navigation、配色和布局模式
