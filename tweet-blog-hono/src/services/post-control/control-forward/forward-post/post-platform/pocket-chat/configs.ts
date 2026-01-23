// src/services/post-control/control-forward/forward-post/post-platform/pocket-chat/configs.ts

export const pocketChatConfig = {
  // 单条消息最大字数
  maxPostCharactersOnSend: 2000,

  // 单条消息最大图片数
  maxImageNumberOnSend: 4,

  // Session 缓存刷新时间（秒）
  sessionCacheRefreshExpiredSeconds: 20 * 60 // 20 分钟
} as const

export const pocketChatImageProcessConfig = {
  bigConfig: {
    filename: 'image.jpg',
    format: 'image/jpeg',
    quality: 0.85,
    sumWidthHeightLimit: 4000
  },
  imageConfig: {
    filename: 'image.jpg',
    format: 'image/jpeg',
    quality: 0.75,
    sumWidthHeightLimit: 2000
  },
  smallConfig: {
    filename: 'image.jpg',
    format: 'image/jpeg',
    quality: 0.75,
    sumWidthHeightLimit: 1200
  },
  tinyConfig: {
    filename: 'image.jpg',
    format: 'image/jpeg',
    quality: 0.75,
    sumWidthHeightLimit: 800
  }
} as const
