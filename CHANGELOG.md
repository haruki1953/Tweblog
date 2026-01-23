# 更新日志

本文件记录了 Tweblog 的所有重要变更。

本项目遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/) 的格式，
并遵循 [语义化版本号](https://semver.org/lang/zh-CN/)。

## [1.5.2] - 2026-01-23

### 🐛 修复
- 文档中修正 ghcr 路径，组织名应小写如 ghcr.io/tweblog/tweblog:latest by @haruki1953 in https://github.com/Tweblog/tweblog/pull/8

## [1.5.0] - 2026-01-23

### ✨ 新增
- 支持对于 [PocketChat](https://github.com/PocketTogether/pocket-chat) 的转发 by @haruki1953 in https://github.com/Tweblog/tweblog/pull/5

### 🔧 变更
- 调整项目显示的文档地址，调整前端 forward-config 批量转发显示 by @haruki1953 in https://github.com/Tweblog/tweblog/pull/6

## [1.4.0] - 2026-01-22

### 🔧 变更
- 将项目仓库整理为一个仓库以利于CICD，完善文档 by @haruki1953 in https://github.com/Tweblog/tweblog/pull/2

### 🐛 修复
- 解决 X推文导入解析失败问题 https://github.com/Tweblog/tweblog/issues/1

## [1.3.0] - 2025-02-22

### ✨ 新增
- 新增 [Bluesky](./Tweblog/src/guide/feature/import/bluesky) 导入功能
- 新增 [Bluesky](./Tweblog/src/guide/feature/forward/bluesky) 转发功能

### 🧱 改进
- 桌面版新增本地文档

## [1.2.0] - 2025-02-16

### ✨ 新增
- 新增 [Discord](./Tweblog/src/guide/feature/import/discord) 导入功能
- 新增 [Discord](./Tweblog/src/guide/feature/forward/discord) 转发功能

### 🧱 改进
- 推文转发时，图片 alt 超过平台限制将自动截断，避免转发失败
- 推文转发页面新增可选 JSON 文本域（从 Discord 导入时需要）

## [1.1.0] - 2025-02-10

### ✨ 新增
- 新增 [Telegram](./Tweblog/src/guide/feature/import/telegram) 导入功能
- 新增 [Telegram](./Tweblog/src/guide/feature/forward/telegram) 转发功能

### 🧱 改进
- 推文发送时，图片选择数量从 4 张提升至 **40 张**
- 推文发送页输入框新增各平台字数限制提示
- 超过平台字数或图片数量限制的推文，将以 [串联回复](./Tweblog/src/guide/feature/tweet-forward#串联回复) 的方式完整发送

### 🛠 修复
- 修复推文存在回复时无法永久删除的问题
- 修复清空回收站时“同时删除图片”选项失效的问题

## [1.0.0] - 2025-01-31

### 🎉 Tweblog 1.0 发布
在改进 Web 版的同时，推出了 Electron 桌面版。

### ✨ 新增
- 新增 [桌面版](./Tweblog/src/guide/desktop)，具备 Web 版全部功能，并可通过 Web 端口远程控制

### 🧱 改进
- 得益于 Drizzle，Docker 镜像从 280MB 缩小至 **199MB**
- 关于页 markdown 支持直接编写 HTML
- 导航栏激活条件优化
- 推文转发页新增加载后过渡动画
- 推文、图片、日志的“加载更多”按钮样式优化
- 图片无限滚动的初始值与增量调整
- 图片预览按钮新增悬停样式与过渡
- `index.html` 新增 Open Graph 元标签，分享至 Twitter 等平台时可显示简介与封面图

### 🛠 修复
- 关于页 markdown 链接不再在当前页打开，而是在新窗口打开
- 推文导入时，图片按推文时间排序，而非添加顺序
- 前端图标从 SVG 换为兼容性更好的 PNG，并进行了放大

### ⚙ 重构
- 数据库框架从 Prisma 迁移至 Drizzle

### ⚠ 注意
- **1.0 与 0.0 版本数据库不兼容**
  - 旧数据库：`data/sqlite.db`
  - 新数据库：`data/database-1_0_0.sqlite`
  - 暂无迁移方案，请重新从 Twitter 等平台导入
  - 1.0 之后的版本将保持数据库兼容性

## [0.0.2] - 2025-01-14

### ✨ 新增
- 新增 [批量导入](./Tweblog/src/guide/feature/tweet-import.md#批量导入)
- 新增 [高级功能](./Tweblog/src/guide/feature/tweet-import.md#高级功能)：导入时可关联至转发记录
- 导入、转发任务支持 [任务中止](./Tweblog/src/guide/feature/tweet-import.md#任务中止)
- 新增 [批量转发](./Tweblog/src/guide/feature/tweet-forward.md#批量转发)
- 新增 [转发记录设置](./Tweblog/src/guide/feature/tweet-forward.md#转发记录设置)

### 🧱 改进
- 修复图片预览白边问题并优化动画
- 浏览器滚动条样式优化
- 修复分割线高度不一致
- 推文卡片分割线样式优化
- 尽可能减少页面切换卡顿
- 数字、秒数输入框支持动态步进
- 任务信息轮询新增退避逻辑

## [0.0.1] - 2025-01-04

### 初始版本
- 基础功能：发送推文、图片、回复等
- 支持 X / Twitter 导入与转发
- Web 版可作为个人博客使用

[1.5.2]: https://github.com/Tweblog/tweblog/compare/v1.5.0...v1.5.2
[1.5.0]: https://github.com/Tweblog/tweblog/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/Tweblog/tweblog/compare/1.3.0...v1.4.0
[1.3.0]: https://github.com/Tweblog/tweblog/compare/1.2.0...1.3.0
[1.2.0]: https://github.com/Tweblog/tweblog/compare/1.1.0...1.2.0
[1.1.0]: https://github.com/Tweblog/tweblog/compare/1.0.0...1.1.0
[1.0.0]: https://github.com/Tweblog/tweblog/compare/0.0.2...1.0.0
[0.0.2]: https://github.com/Tweblog/tweblog/compare/0.0.1...0.0.2
[0.0.1]: https://github.com/Tweblog/tweblog/releases/tag/0.0.1
