import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: './src',
  title: "Tweblog",
  description: "一个社交媒体博客化工具",
  head: [
    ['link', { rel: 'icon', href: '/favicon256.png' }],
    ['meta', { property: 'og:title', content: 'Tweblog' }],
    ['meta', { property: 'og:description', content: '一个社交媒体博客化工具' }],
    ['meta', { property: 'og:image', content: '/social.jpg' }],
    ['meta', { property: 'og:url', content: 'https://tweblog.com/' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'Tweblog' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: 'Tweblog' }],
    ['meta', { name: 'twitter:description', content: '一个社交媒体博客化工具' }],
    ['meta', { name: 'twitter:image', content: '/social.jpg' }],
    ['meta', { name: 'twitter:site', content: '@harukiO_0' }]
  ],
  cleanUrls: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/favicon256.png',
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
          { text: '部署', link: '/guide/deploy' },
          { text: '常见问题', link: '/guide/faq' },
          { text: '更新日志', link: '/guide/changelog' }
        ]
      },
      {
        text: '基本功能',
        items: [
          { text: '推文发送', link: '/guide/feature/tweet-post' },
          { text: '系统设置', link: '/guide/feature/system-config' },
          { text: '个人信息', link: '/guide/feature/profile-config' },
          { text: '推文导入', link: '/guide/feature/tweet-import' },
          { text: '推文转发', link: '/guide/feature/tweet-forward' },
        ]
      },
      {
        text: '导入说明',
        items: [
          { text: 'X / Twitter', link: '/guide/feature/import/x-twitter' }
        ]
      },
      {
        text: '转发配置',
        items: [
          { text: 'X / Twitter', link: '/guide/feature/forward/x-twitter' }
        ]
      },
      {
        text: '扩展指南',
        items: [
          { text: '项目说明', link: '/guide/extension/project' },
          { text: '关键配置 platform.ts', link: '/guide/extension/platform-ts' },
          { text: '导入功能', link: '/guide/extension/import' },
          { text: '转发功能', link: '/guide/extension/forward' }
        ]
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/haruki1953/Tweblog' },
      { icon: 'discord', link: 'https://discord.gg/tYXj9ShnVr' },
      { icon: 'x', link: 'https://x.com/harukiO_0' },
    ],

    footer: {
      message:
        'Powered by <a target="_blank" href="https://vitepress.dev">VitePress</a> & Released under the MIT License</a>.',
      // copyright:
      //   'Copyright © 2024-present <a target="_blank" href="https://x.com/harukiO_0">@harukiO_0</a>'
    }
  },
  markdown: {
    image: {
      // 默认禁用；设置为 true 可为所有图片启用懒加载。
      lazyLoading: true
    }
  }
})
