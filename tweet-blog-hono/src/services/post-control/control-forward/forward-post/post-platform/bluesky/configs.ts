export const blueskyConfig = {
  // 链接在显示时的长度限制
  linkContentMaxLength: 30,
  // 发推时的最大字数（length即可）
  maxPostCharactersOnSend: 300,
  maxAltCharactersOnSend: 2000,
  maxImageNumberOnSend: 4,
  // session缓存过期时间配置
  sessionCacheCreateExpiredSeconds: 10 * 60 * 60,
  sessionCacheRefreshExpiredSeconds: 60
} as const
