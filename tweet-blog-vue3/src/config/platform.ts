/*
  此文件在前后端中内容一致
  前端：src\config\platform.ts
  后端：src\configs\platform.ts

  对于推文导入（解析）的主要逻辑在前端：
    src\views\control\views\tweet-import\services\process.ts
  对于推文转发的主要逻辑在后端：
    src\services\post-control\control-forward\forward-post\forward-post.ts
*/

import { z } from 'zod'

// 转发配置中，各平台所对应的 data 数据结构
// X / Twitter
const forwardSettingDataSchemaX = z.object({
  'API Key': z.string().default(''),
  'API Key Secret': z.string().default(''),
  'Access Token': z.string().default(''),
  'Access Token Secret': z.string().default('')
})
// data 数据例，前端要用
const forwardSettingDataDefaultX: z.infer<typeof forwardSettingDataSchemaX> = {
  'API Key': '',
  'API Key Secret': '',
  'Access Token': '',
  'Access Token Secret': ''
}
// Telegram
const forwardSettingDataSchemaTelegram = z.object({
  'Bot Token': z.string().default(''),
  'Chat Id': z.string().default('')
})
const forwardSettingDataDefaultTelegram: z.infer<
  typeof forwardSettingDataSchemaTelegram
> = {
  'Bot Token': '',
  'Chat Id': ''
}
// Discord
const forwardSettingDataSchemaDiscord = z.object({
  Authorization: z.string().default(''),
  'Guild Id': z.string().default(''),
  'Channel Id': z.string().default('')
})
const forwardSettingDataDefaultDiscord: z.infer<
  typeof forwardSettingDataSchemaDiscord
> = {
  Authorization: '',
  'Guild Id': '',
  'Channel Id': ''
}
// Bluesky
const forwardSettingDataSchemaBluesky = z.object({
  'PDS Host': z.string().default(''),
  'Web Host': z.string().default(''),
  'CDN Host': z.string().default(''),
  Identifier: z.string().default(''),
  Password: z.string().default('')
})
const forwardSettingDataDefaultBluesky: z.infer<
  typeof forwardSettingDataSchemaBluesky
> = {
  'PDS Host': '',
  'Web Host': '',
  'CDN Host': '',
  Identifier: '',
  Password: ''
}
// 全部平台的 forwardSettingDataDefault
export const forwardSettingDataDefaultAll = {
  ...forwardSettingDataDefaultX,
  ...forwardSettingDataDefaultTelegram,
  ...forwardSettingDataDefaultDiscord,
  ...forwardSettingDataDefaultBluesky
}

// 关于导入与导出所需的平台数据
export const platformKeyMap = {
  X: {
    key: 'X',
    name: 'X / Twitter',
    // https://fontawesome.com/v6/search?o=v&ic=brands
    fontawesomeClass: 'fa-brands fa-x-twitter',
    // 是否支持导入或导出，这个会控制对应 radio 单选框
    couldImport: true,
    couldForward: true,
    // 转发配置中，data 的 schema 与 默认值
    forwardSettingDataSchema: forwardSettingDataSchemaX,
    forwardSettingDataDefault: forwardSettingDataDefaultX
  },
  Telegram: {
    key: 'Telegram',
    name: 'Telegram',
    fontawesomeClass: 'fa-brands fa-telegram',
    couldImport: true,
    couldForward: true,
    forwardSettingDataSchema: forwardSettingDataSchemaTelegram,
    forwardSettingDataDefault: forwardSettingDataDefaultTelegram
  },
  Discord: {
    key: 'Discord',
    name: 'Discord',
    fontawesomeClass: 'fa-brands fa-discord',
    couldImport: true,
    couldForward: true,
    forwardSettingDataSchema: forwardSettingDataSchemaDiscord,
    forwardSettingDataDefault: forwardSettingDataDefaultDiscord
  },
  Bluesky: {
    key: 'Bluesky',
    name: 'Bluesky',
    fontawesomeClass: 'fa-brands fa-bluesky',
    couldImport: true,
    couldForward: true,
    forwardSettingDataSchema: forwardSettingDataSchemaBluesky,
    forwardSettingDataDefault: forwardSettingDataDefaultBluesky
  }
} as const
// 这个手动写出来的原因是，zod枚举需要字面量类型数组
export const platformKeyEnum = ['X', 'Telegram', 'Discord', 'Bluesky'] as const

// 类型检查以确保 platformKeyEnum 与 platformKeyMap 的值是同步的
export type PlatformKeyMapValues =
  | (typeof platformKeyMap)[keyof typeof platformKeyMap]['key']
  | keyof typeof platformKeyMap
export type PlatformKeyEnumValues = (typeof platformKeyEnum)[number]
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const platformKeyMapTest: PlatformKeyMapValues[] = [] as PlatformKeyEnumValues[]
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const platformKeyEnumTest: PlatformKeyEnumValues[] =
  [] as PlatformKeyMapValues[]
