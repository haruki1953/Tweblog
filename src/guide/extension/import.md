# 扩展导入功能

::: details 导入和转发功能，都通过 platform.ts 来控制平台信息
```ts
/*
  此文件在前后端中内容一致
  前端：src\config\platform.ts
  后端：src\configs\platform.ts

  对于推文导入（解析）的主要逻辑在前端：
    src\views\control\views\tweet-import\services\process.ts
  对于推文转发的主要逻辑在后端：
    src\services\post-control\control-forward\forward-post\forward-post.ts
  对于推文导入处理在后端的位置：
    src\services\post-control\control-import\import-post.ts
*/

import { z } from 'zod'

// 转发配置中，各平台所对应的 data 数据结构
// X / Twitter
const forwardSettingDataSchemaX = z.object({
  'API Key': z.string(),
  'API Key Secret': z.string(),
  'Access Token': z.string(),
  'Access Token Secret': z.string()
})
// 用于测试
const forwardSettingDataSchemaT = z.object({
  token: z.string()
})
// data 数据例，前端要用
const forwardSettingDataDefaultX: z.infer<typeof forwardSettingDataSchemaX> = {
  'API Key': '',
  'API Key Secret': '',
  'Access Token': '',
  'Access Token Secret': ''
}
const forwardSettingDataDefaultT: z.infer<typeof forwardSettingDataSchemaT> = {
  token: ''
}
// 全部平台的 forwardSettingDataDefault
export const forwardSettingDataDefaultAll = {
  ...forwardSettingDataDefaultX,
  ...forwardSettingDataDefaultT
}

// 关于导入与导出所需的平台数据
export const platformKeyMap = {
  X: {
    key: 'X',
    name: 'X / Twitter',
    fontawesomeClass: 'fa-brands fa-x-twitter',
    // 是否支持导入或导出，这个会控制对应 radio 单选框
    couldImport: true,
    couldForward: true,
    // 转发配置中，data 的 schema 与 默认值
    forwardSettingDataSchema: forwardSettingDataSchemaX,
    forwardSettingDataDefault: forwardSettingDataDefaultX
  },
  T: {
    key: 'T',
    name: 'Test',
    fontawesomeClass: 'fa-brands fa-font-awesome',
    couldImport: false,
    couldForward: false,
    forwardSettingDataSchema: forwardSettingDataSchemaT,
    forwardSettingDataDefault: forwardSettingDataDefaultT
  }
} as const
// 这个手动写出来的原因是，zod枚举需要字面量类型数组
export const platformKeyEnum = ['X', 'T'] as const

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
```
:::

## 推文导入功能的实现原理
推文导入的原理是前端对 JSON 数据进行解析，将整理后的数据发送至后端，后端保存文字内容，并请求获取图片，以此完成导入。

### 前端解析数据
前端对 JSON 数据进行解析，解析为这个结构
```ts
// tweet-blog-vue3: src\types\data\import.d.ts
import type { PlatformKeyEnumValues } from '@/config' // src\config\platform.ts

export type ImportPostItem = {
  // 帖子内容
  content: string
  // 帖子时间
  createdAt: string
  // 帖子所属平台
  platform: PlatformKeyEnumValues
  // 帖子在所属平台的id
  platformId: string
  // 帖子在所属平台的链接
  platformLink: string
  // 帖子在所属平台的父帖id
  platformParentId: string | null
  // 帖子的图片
  importImages: {
    // 图片链接，后端将请求此url来获取图片
    link: string
    // 图片描述
    alt: string
    // 图片所属平台
    platform: PlatformKeyEnumValues
    // 图片在所属平台的id
    platformId: string
  }[]
}

export type ImportPostList = ImportPostItem[]
```

关键代码位置
```
tweet-blog-vue3\src\views\control\views\tweet-import
|   TweetImport.vue
+---components
|       dependencies.ts
|       ImportProcess.vue
|       ImportSubmit.vue
|       ……
\---services
    |   index.ts
    |   process.ts
    \---data-process
        |   index.ts
        \---x-twitter
                index.ts
                schemas.ts
                services.ts
                types.d.ts
                utils.ts
```

`components/ImportProcess.vue` 中存在一个文本域，其会调用 `services/process.ts` 导出的 `processJsonToImportPostsByPlatform` 函数来解析 json 数据

processJsonToImportPostsByPlatform 会根据传入的 platform（平台代表字段） 来调用对应各平台的解析函数，并接收其类型为 `ImportPostList` 的返回值
```ts
// services/process.ts
import { platformKeyMap, type PlatformKeyEnumValues } from '@/config'
import { dataProcessXtwitterService } from './data-process'
import type { ImportPostList } from '@/types'

export const processJsonToImportPostsByPlatform = (data: {
  jsonData: string
  platform: PlatformKeyEnumValues
}) => {
  const { jsonData, platform } = data
  let importPosts: ImportPostList | null = null

  if (platform === platformKeyMap.X.key) {
    importPosts = dataProcessXtwitterService(jsonData)
  }

  return importPosts
}
```

如 `dataProcessXtwitterService`函数 就是 X 的解析函数，由 `data-process/x-twitter` 导出

如果要扩展的话，比如添加从 Telegram 解析数据，可以创建 `data-process/telegram` 目录来编写对应的函数。也就是说，关于各个平台的数据解析方法，都放在 `data-process` 目录下

### 后端处理数据

