---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Tweblog"
  text: "一个自己的微博客"
  tagline: 从推特导入推文，配置后可转发到其他平台
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
    title: web版
    details: 使用 docker 部署，开箱即用
  - icon: 💻
    title: 桌面版（锐意制作中）
    details: 正在尝试用 electron 制作 Tweblog 桌面版
---
