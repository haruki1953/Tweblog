const appPackageJsonInfo = {
  // 为了方便正则替换
  // eslint-disable-next-line prettier/prettier
  "version": "1.3.0",
}

export const appInfo = {
  copyright: {
    text: 'Tweblog',
    link: 'https://github.com/Tweblog/tweblog'
  },
  version: {
    text: appPackageJsonInfo.version,
    link: 'https://github.com/Tweblog/tweblog'
  },
  officialWebsite: {
    text: 'tweblog.sakiko.top',
    link: 'https://tweblog.sakiko.top/'
  },
  officialDocs: {
    text: '网站 | 文档',
    link: 'https://tweblog.sakiko.top/'
  },
  importDocs: {
    text: '导入说明',
    link: 'https://tweblog.sakiko.top/guide/feature/tweet-import'
  },
  // 导入的高级功能说明
  importAdvancedDocs: {
    text: '请看文档',
    link: 'https://tweblog.sakiko.top/guide/feature/tweet-import#高级功能'
  },
  // 删除导入记录
  importDeleteDocs: {
    text: '说明',
    link: 'https://tweblog.sakiko.top/guide/feature/tweet-import#导入设置'
  },
  proxyDocs: {
    text: '代理说明',
    link: 'https://tweblog.sakiko.top/guide/feature/system-config#代理配置'
  },
  // 转发配置
  forwardSettingDocs: {
    text: '配置说明',
    link: 'https://tweblog.sakiko.top/guide/feature/tweet-forward'
  },
  // 删除转发记录
  forwardDeleteDocs: {
    text: '说明',
    link: 'https://tweblog.sakiko.top/guide/feature/tweet-forward#转发记录设置'
  },
  // 自动转发说明
  forwardAutoDocs: {
    text: '说明',
    link: 'https://tweblog.sakiko.top/guide/feature/tweet-forward#自动转发'
  },
  // Web端口说明
  webPortDocs: {
    text: '说明',
    link: 'https://tweblog.sakiko.top/guide/desktop#Web端口'
  }
} as const
