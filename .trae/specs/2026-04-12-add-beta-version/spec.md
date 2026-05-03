# Beta Version API Spec

## Why
需要支持测试版本（Beta）的发布管理，与正式版本（Latest）分开管理。这样可以在正式发布前测试新版本，同时保持两个独立的数据源。

## What Changes
- 添加 `api/beta.json.js` - GET 返回测试版本信息，POST 更新测试版本
- 添加 `api/betamd.md.js` - GET 返回测试版本的 Markdown 更新日志
- 在 `api/_shared.js` 中添加 beta 数据的读写函数
- 在 `api/update.js` 中添加更新 beta 数据的支持
- 前端添加 beta 版本的编辑和展示

## Impact
- Affected specs: 版本管理、更新日志管理
- Affected code: `api/_shared.js`, `api/update.js`, 前端编辑页面和主页

## ADDED Requirements

### Requirement: Beta Version API
系统 shall 提供测试版本的读取和更新接口，格式与正式版一致。

#### Scenario: 获取测试版本信息
- **WHEN** 用户访问 `/api/beta.json`
- **THEN** 返回格式与 `/api/latest.json` 一致的 JSON

#### Scenario: 更新测试版本
- **WHEN** 用户 POST 数据到 `/api/update` 并指定 beta 模式
- **THEN** 测试版本数据被更新

### Requirement: Beta Changelog API
系统 shall 提供测试版本更新日志的读取接口。

#### Scenario: 获取测试版本更新日志
- **WHEN** 用户访问 `/api/betamd.md`
- **THEN** 返回 Markdown 格式的测试版本更新日志

### Requirement: Data Storage
测试版本数据 shall 与正式版本数据存储在不同的数据库表中。
