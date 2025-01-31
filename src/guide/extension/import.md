# 扩展导入功能

## 导入功能原理
主要的业务逻辑是在前端，前端对 JSON 数据进行解析，将整理后的数据发送至后端。不管从哪个平台导入，后端接收的数据结构是一样的。

后端将请求获取数据中的图片，处理后与数据中的其他内容一同保存在数据库。

## 导入的数据结构
前端对 JSON 数据进行解析，解析为这个结构

前端中的类型标注：
```ts
// tweet-blog-vue3: src\types\data\import.d.ts

export type ImportPostItem = {
  // 帖子内容
  content: string
  // 帖子时间
  createdAt: string
  // 帖子所属平台 src\config\platform.ts
  platform: PlatformKeyEnumValues
  // 帖子在所属平台的id
  platformId: string
  // 帖子在所属平台的链接
  platformLink: string
  // 帖子在所属平台的父帖id
  platformParentId: string | null
  // 帖子的图片
  importImages: {
    // 图片时间
    createdAt: string
    // 图片链接，后端将请求此url来获取图片
    link: string
    // 图片描述
    alt: string
    // 图片所属平台 src\config\platform.ts
    platform: PlatformKeyEnumValues
    // 图片在所属平台的id
    platformId: string
  }[]
}

export type ImportPostList = ImportPostItem[]
```

::: info 或许需要留意的一点
解析后的导入数据数组中，要保持父帖在子帖之前

不过自己在处理 X 的数据时，并没有针对这一点进行处理，因为一般的顺序就是正确的，别的平台可能也是这样的吧
:::

## 关键代码
```
tweet-blog-vue3: src\views\control\views\tweet-import
|   TweetImport.vue
+---services
|   |   index.ts
|   |   process.ts
|   \---data-process
|       |   index.ts
|       \---x-twitter
|               index.ts
|               schemas.ts
|               services.ts
|               types.d.ts
|               utils.ts
\---views
    |   dependencies.ts
    +---import
    |   |   dependencies.ts
    |   |   ImportPage.vue
    |   \---components
    |           dependencies.ts
    |           ImportProcess.vue
    |           ImportSubmit.vue
    |           ...
    ...
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

如果要扩展的话，比如添加从 Telegram 解析数据，可以创建 `data-process/telegram` 目录来编写对应的函数，并在 `services/process.ts` 调用


## 导入功能扩展流程

现在以扩展从 Telegram 导入推文为例，来梳理扩展流程

### 修改前后端的 platform.ts
```ts
// 前端：src\config\platform.ts
// 后端：src\configs\platform.ts

// 添加
// 虽然对于导入功能来说，用不到Schema之类的，但是还是需要模仿着创建一个
const forwardSettingDataSchemaTelegram = z.object({
  tokenTelegram: z.string()
})
const forwardSettingDataDefaultTelegram: z.infer<typeof forwardSettingDataSchemaTelegram> = {
  tokenTelegram: ''
}

// 修改
// 全部平台的 forwardSettingDataDefault
export const forwardSettingDataDefaultAll = {
  ...forwardSettingDataDefaultX,
  ...forwardSettingDataDefaultT,
  ...forwardSettingDataDefaultTelegram
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
  T: {
    key: 'T',
    name: 'Test',
    fontawesomeClass: 'fa-brands fa-font-awesome',
    couldImport: false,
    couldForward: false,
    forwardSettingDataSchema: forwardSettingDataSchemaT,
    forwardSettingDataDefault: forwardSettingDataDefaultT
  },
  // 添加
  Telegram: {
    key: 'Telegram',
    name: 'Telegram',
    fontawesomeClass: 'fa-brands fa-telegram',
    couldImport: true,
    couldForward: false,
    forwardSettingDataSchema: forwardSettingDataSchemaTelegram,
    forwardSettingDataDefault: forwardSettingDataDefaultTelegram
  }
} as const
// 这个手动写出来的原因是，zod枚举需要字面量类型数组
export const platformKeyEnum = [
  'X', 
  'T', 
  'Telegram' // 添加
] as const
```

::: info 关于 platform.ts
详细的说明请看 [platform.ts 说明](./platform-ts.md)
:::

### 编写解析函数
```
tweet-blog-vue3: src\views\control\views\tweet-import
|   TweetImport.vue
+---services
|   |   index.ts
|   |   process.ts
|   \---data-process
|       |   index.ts
|       +---telegram
|       |       services.ts
|       |       index.ts
|       \---x-twitter
|               index.ts
|               schemas.ts
|               services.ts
|               types.d.ts
|               utils.ts
...
```


创建 `data-process/telegram` 目录，在其中创建 `services.ts` `index.ts`、

`index.ts` 中导出 `services.ts` 的所有导出 `export * from './services'`

`services.ts` 导出 `dataProcessTelegramService` 函数。

`dataProcessTelegramService` 函数类型为
```ts
type DataProcessTelegramService = (jsonData: string) => ImportPostList | null
```

可以参考 x-twitter 文件夹中的内容来完善
```
schemas.ts 用来编写和导出 zod 校验对象
types.d.ts 用来管理类型
utils.ts 用来写比较零碎的字符串处理之类的函数
```

完成后，需要在 `data-process/index.ts` 中导出 telegram 文件夹
```ts
export * from './x-twitter'
export * from './telegram'
```

最后要在 `services/process.ts` 中调用 `dataProcessTelegramService`
```ts
import { 
  dataProcessXtwitterService,
  dataProcessTelegramService
} from './data-process'

export const processJsonToImportPostsByPlatform = (data: {
  jsonData: string
  platform: PlatformKeyEnumValues
}) => {
  const { jsonData, platform } = data
  let importPosts: ImportPostList | null = null

  if (platform === platformKeyMap.X.key) {
    importPosts = dataProcessXtwitterService(jsonData)
  }

  // 添加
  if (platform === platformKeyMap.Telegram.key) {
    importPosts = dataProcessTelegramService(jsonData)
  }

  return importPosts
}
```



