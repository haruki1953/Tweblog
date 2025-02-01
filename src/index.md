---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Tweblog"
  text: "社交媒体博客化工具"
  tagline: 针对推特等平台的内容进行导入与转发
  image:
    src: /favicon.svg
    alt: Tweblog
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 指南
      link: /guide/what-is-tweblog
    - theme: alt
      text: 预览
      link: https://haruki.tweblog.com/

features:
  - icon: 👀
    title: 什么是 Tweblog
    details: 是 tweet + weblog 拼凑来的项目名
  - icon: 🛒
    title: 推文导入
    details: 解析推特的 UserTweets 响应数据，实现推文导入
  - icon: 🔗
    title: 推文转发
    details: 配置推特 OAuth 1.0a 验证信息后，实现推文转发
  - icon: 🏗
    title: 良好的扩展性
    details: 有谁对任何平台的api熟悉的话，可以帮帮我扩展导入或转发功能吗 👉👈。参考：扩展指南
  - icon: 🐳
    title: Web版
    details: 开箱即用，使用 Docker 部署，可以充当自己的博客
  - icon: 💻
    title: 桌面版
    details: 解压即用，支持 Windows，拥有Web版的全部功能
---
