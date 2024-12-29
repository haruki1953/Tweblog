import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: './src',
  title: "Tweblog",
  description: "A Self-Hosted Microblog",
  head: [['link', { rel: 'icon', href: '/favicon.svg' }]],
  cleanUrls: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/favicon.svg',
    search: {
      provider: 'local'
    },

    nav: [
      { text: '主页', link: '/' },
      { text: '指南', link: '/guide/what-is-tweblog' }
    ],

    sidebar: [
      {
        // text: '项目说明',
        items: [
          { text: '什么是 Tweblog', link: '/guide/what-is-tweblog' },
          { text: '快速开始', link: '/guide/getting-started' },
          { text: '部署', link: '/guide/deploy' }
        ]
      },
      {
        text: '基本功能',
        items: [
          { text: '推文发送', link: '/markdown-examples' },
          { text: '系统设置', link: '/markdown-examples' },
          { text: '个人信息', link: '/markdown-examples' },
          { text: '推文导入', link: '/markdown-examples' },
          { text: '推文转发', link: '/markdown-examples' },
        ]
      },
      {
        text: '导入说明',
        items: [
          { text: 'X / Twitter', link: '/markdown-examples' }
        ]
      },
      {
        text: '转发说明',
        items: [
          { text: 'X / Twitter', link: '/markdown-examples' }
        ]
      },
      {
        text: '扩展说明',
        items: [
          { text: '扩展导入功能', link: '/markdown-examples' },
          { text: '扩展转发功能', link: '/api-examples' }
        ]
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/haruki1953/Tweblog' },
      { icon: 'discord', link: 'https://discord.gg/nZWpvz2WNW' },
      { icon: 'x', link: 'https://x.com/harukiO_0' },
    ],

    // footer: {
    //   message:
    //     'Powered by <a target="_blank" href="https://vitepress.dev">VitePress</a> & Released under the MIT License</a>.',
    //   copyright:
    //     'Copyright © 2024-present <a target="_blank" href="https://x.com/harukiO_0">@harukiO_0</a>'
    // }
  }
})
