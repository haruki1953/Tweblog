<p align="center">
  <img src="https://tweblog.com/favicon.svg" alt="cover" style="width: 30%;">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white" alt="Vue.js">
  <img src="https://img.shields.io/badge/Node.js-5FA04E?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Hono-E36002?style=for-the-badge&logo=hono&logoColor=white" alt="Hono">
  <img src="https://img.shields.io/badge/Sqlite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="Sqlite">
  <img src="https://img.shields.io/badge/Drizzle-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black" alt="Drizzle">
  <img src="https://img.shields.io/badge/Electron-47848F?style=for-the-badge&logo=electron&logoColor=white" alt="Electron">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="MIT License">
</p>


这个仓库是 Tweblog 的官网/文档，同时作为整个项目的主仓库（如果愿意的话 star 这个仓库就好）
- 网站 https://tweblog.com
- 文档 https://github.com/haruki1953/Tweblog
- 后端 https://github.com/haruki1953/tweet-blog-hono
- 前端1（管理） https://github.com/haruki1953/tweet-blog-vue3
- 前端2（公开） https://github.com/haruki1953/tweet-blog-public-vue3
- 桌面版后端 https://github.com/haruki1953/tweblog-electron-hono
- 桌面版前端 https://github.com/haruki1953/tweblog-electron-vue3

# Tweblog

是一个社交媒体博客化工具，目的是为了方便同时运营多个社交媒体，自己也在打算用这个从推特出逃。

**Github：** https://github.com/haruki1953/Tweblog

**DockerHub：** https://hub.docker.com/r/harukiowo/tweblog

**网站/文档：** https://tweblog.com/

**预览：** https://haruki.tweblog.com/

**当前版本：** [0.0.2](https://tweblog.com/guide/changelog#002)

**技术栈：**
- 前端 TypeScript + Vue3 + ElementPlus
- 后端 TypeScript + Node + Hono
- 数据库 Sqlite + Drizzle

想开始尝试？跳到 [快速开始](https://tweblog.com/guide/getting-started)

## ✨ 功能

- 基本功能：发送推文、图片、回复……

- Web版，开箱即用，使用 Docker 部署，可以充当自己的博客

- 桌面版，解压即用，支持 Windows，拥有Web版的全部功能

- 支持对于 X / Twitter 的导入与转发

- ......

## 💡 计划

有谁对任何平台的api熟悉的话，可以帮帮我扩展导入或转发功能吗 👉👈 [扩展指南](https://tweblog.com/guide/extension/project) 

- telegram导入与转发（锐意制作中）
- discord导入与转发
- bluesky导入与转发
- mastodon导入与转发
- xlog导入与转发
- i18n
- rss
- 动图、音视频支持
- 移动端
- ......

## ☎️ 交流讨论 | 问题反馈

加入 [discord群组](https://discord.gg/6pMkmMBnGH)


## 📸 截图

![alt text](./src/guide/assets/image.jpg)

![alt text](./src/guide/assets/image-1.jpg)

![alt text](./src/guide/assets/image-2.jpg)

![alt text](./src/guide/assets/image-3.jpg)

![alt text](./src/guide/assets/image-5.jpg)

![alt text](./src/guide/assets/image-6.jpg)

## VitePress 📝💨
本仓库是 Tweblog 的官网/文档，使用 [VitePress](https://vitepress.dev/zh/) 制作
```sh
# Project Setup
pnpm install

# Compile and Hot-Reload for Development
pnpm docs:dev

# Type-Check, Compile and Minify for Production
pnpm docs:build
```

