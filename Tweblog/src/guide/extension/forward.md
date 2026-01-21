# 扩展转发功能

## 转发功能原理
转发功能的原理是，后端保存转发配置数组，每个配置项包含平台所需的认证信息。在进行推文转发时，用户选择指定的转发配置，后端根据该配置调用相应平台的 API，使用其中的认证信息数据完成转发操作。

## 转发配置数据结构
```ts
type ForwardSettingItem = {
    uuid: string;
    name: string;
    platform: "X";
    data: {
        'API Key': string;
        'API Key Secret': string;
        'Access Token': string;
        'Access Token Secret': string;
    };
} | {
    uuid: string;
    name: string;
    platform: "T";
    data: {
        token: string;
    };
}
```

这个数据结构会根据 [platform.ts](./platform-ts.md) 自动生成

```ts
// tweet-blog-hono: src\schemas\types\forward.ts
const forwardSettingPlatformSchemaTuple = platformKeyEnum.map((key) => {
  return z.object({
    uuid: z.string(),
    name: z.string(),
    platform: z.literal(platformKeyMap[key].key),
    data: platformKeyMap[key].forwardSettingDataSchema
  }) as ForwardSettingPlatformSchemaUnion
}) as ForwardSettingPlatformSchemaTuple

export const forwardSettingItemSchema = z.union(forwardSettingPlatformSchemaTuple)

// tweet-blog-hono: src\types\system.d.ts
export type ForwardSettingItem = z.infer<typeof forwardSettingItemSchema>
```

## 关键代码
```
tweet-blog-hono: src\services\post-control\control-forward\forward-post
|   dependencies.ts
|   index.ts
|   services.ts
|   type.d.ts
\---post-platform
    |   dependencies.ts
    |   index.ts
    \---x-twitter
            dependencies.ts
            index.ts
            services.ts
```

`forward-post/services.ts` 中导出了 `postControlForwardPostService`

`postControlForwardPostService` 根据参数得到对应 帖子 和 转发配置，并根据转发配置中的 `platform` 调用对应平台的转发函数，如 `forwardPostXtwitterService`
```ts
// 按照平台对应字段，调用不同平台的转发方法
const postControlForwardPostService_SwitchPlatformPart = async (
  data: DataForForwardPost
): Promise<ReturnForForwardPost> => {
  if (isDataForPlatform(data, platformKeyMap.X.key)) {
    // 调用 X/Twitter 的转发方法
    return await forwardPostXtwitterService(data)
  }

  throw new AppError('当前平台暂不支持转发', 400)
}

// data 类型守卫（类型体操真是酣畅淋漓😇）
// 通过传入平台所代表字段，来判断对应的类型
const isDataForPlatform = <Platform extends PlatformKeyEnumValues>(
  data: DataForForwardPost, platform: Platform
): data is DataForForwardPostPlatform<Platform> => {
  return data.targetForwardSetting.platform === platform
}

// postControlForwardPostService
export const postControlForwardPostService = async (json: PostControlForwardPostJsonType) => {
  const {
    postId,
    forwardConfigId
  } = json

  // 获取目标转发配置 targetForwardSetting ...
  // 获取目标帖子 targetPost ...
  // 预处理帖子数据 targetPostData ...
  // 预处理图片数据 targetImageList ...
  const dataForForwardPostPlatformd: DataForForwardPost = {
    targetForwardSetting,
    targetPostData,
    targetImageList
  }
  // 按照平台对应字段，调用不同平台的转发方法
  const returnForForwardPostPlatform: ReturnForForwardPost =
    await postControlForwardPostService_SwitchPlatformPart(
      dataForForwardPostPlatformd
    )

  // 最后，将转发后得到的信息，关联至帖子，关联至图片
  // ...
}
```

## DataForForwardPost 和 ReturnForForwardPost 类型
关于 `DataForForwardPost` 和 `ReturnForForwardPost` 这两个类型是比较关键的

`DataForForwardPost` 是各个平台的转发方法所需要的数据，在转发方法中将使用此数据作为帖子内容

`ReturnForForwardPost` 是各个平台的转发方法所返回的数据，将使用此数据关联帖子与图片，创建转发记录

```ts
// src\services\post-control\control-forward\forward-post\type.d.ts
export interface DataForForwardPost {
  // 转发配置
  targetForwardSetting: ForwardSettingItem
  // 帖子数据
  targetPostData: {
    // 帖子id
    id: string
    // 帖子内容
    content: string
    // 帖自在目标平台的父帖id
    parentPostSamePlatformPostId: string | undefined
  }
  // 图片数据数组
  targetImageList: Array<{
    // 图片id
    id: string
    // 图片alt
    alt: string | null
    // 图片（大图）在本地（后端）的绝对路径
    localLargeImagePath: string
  }>
}

// 通过传入平台所代表字段类型，来获取对应的类型
export interface DataForForwardPostPlatform<
  Platform extends PlatformKeyEnumValues
> extends DataForForwardPost {
  targetForwardSetting: ForwardSettingPlatform<Platform>
}

export interface ReturnForForwardPost {
  resPostInfo: {
    // 帖子id
    postId: string
    // 帖子在目标平台的id
    platformPostId: string
    // 帖子在目标平台的链接
    platformPostLink: string
  }
  resImageList: Array<{
    // 图片id
    imageId: string
    // 图片在目标平台的id
    platformImageId: string
    // 图片在目标平台的链接
    platformImageLink: string
  }>
}
```

关于 `ForwardSettingPlatform` 泛型类型，用于传入平台所代表字段类型，来获取对应的转发配置类型，这样即可缩小类型范围

```ts
// src\types\system.d.ts

type ExtractPlatform<
  Platform extends PlatformKeyEnumValues, Item
> = Item extends { platform: Platform } ? Item : never

// 传入平台所代表字段类型，来获取对应的转发配置类型
export type ForwardSettingPlatform<
  Platform extends PlatformKeyEnumValues
> = ExtractPlatform<Platform, ForwardSettingItem>

// 测试
// type x = ForwardSettingPlatform<'X'>
// type x = {
//     uuid: string;
//     name: string;
//     platform: "X";
//     data: {
//         'API Key': string;
//         'API Key Secret': string;
//         'Access Token': string;
//         'Access Token Secret': string;
//     };
// }
// type t = ForwardSettingPlatform<'T'>
// type t = {
//   uuid: string;
//   name: string;
//   platform: "T";
//   data: {
//       token: string;
//   };
// }
```

## 转发功能扩展流程

现在以扩展转发推文至 Telegram 为例，来梳理扩展流程

### 修改前后端的 platform.ts
```ts
// 前端：src\config\platform.ts
// 后端：src\configs\platform.ts

// 添加 Telegram 所需的认证信息
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
    couldImport: false,
    couldForward: true,
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


### 编写转发方法

```
tweet-blog-hono: src\services\post-control\control-forward\forward-post
|   dependencies.ts
|   index.ts
|   services.ts
|   type.d.ts
\---post-platform
    |   dependencies.ts
    |   index.ts
    +---telegram
    |       dependencies.ts
    |       index.ts
    |       services.ts
    \---x-twitter
            dependencies.ts
            index.ts
            services.ts
```

创建 `post-platform/telegram` 目录，在其中创建 `services.ts` `index.ts` `dependencies.ts`

`dependencies.ts` 中导出上级目录的 `dependencies.ts` ，`services.ts` 将通过其来导入 `DataForForwardPostPlatform` `ReturnForForwardPost` 类型
```ts
// dependencies.ts
export * from '../dependencies'

// services.ts
import type { DataForForwardPostPlatform, ReturnForForwardPost } from './dependencies'
```

::: info dependencies.ts 存在的意义
dependencies.ts 主要是为了方便在重构时的路径管理，不过这个自己想的方法可能不太专业，自己姑且先这么用着。

笔记： https://github.com/haruki1953/240630-web-note/blob/master/240810-tweet-blog-dev/%E7%AC%94%E8%AE%B0241207/241207-%E7%94%A8dependencies%E6%96%87%E4%BB%B6%E4%BC%98%E5%8C%96%E8%B7%AF%E5%BE%84%E7%AE%A1%E7%90%86.md
:::


`index.ts` 中导出 `services.ts` 的所有导出 `export * from './services'`

`services.ts` 导出 `forwardPostTelegramService` 函数，即为转发帖子到 Telegram 的函数。
```ts
type DataForForwardPostTelegram = DataForForwardPostPlatform<typeof platformKeyMap.Telegram.key>

export const forwardPostTelegramService = async (
  data: DataForForwardPostTelegram
): Promise<ReturnForForwardPost> => {
  const {
    targetForwardSetting,
    targetPostData,
    targetImageList
  } = data

  // ...
}
```

::: details 可以参考 `forwardPostXtwitterService`
这个是使用 twitter-api-v2 包实现了推文转发： https://www.npmjs.com/package/twitter-api-v2
```ts
// src\services\post-control\control-forward\forward-post\post-platform\x-twitter\services.ts

import { TwitterApi } from 'twitter-api-v2'
// ...

type DataForForwardPostXtwitter = DataForForwardPostPlatform<typeof platformKeyMap.X.key>

export const forwardPostXtwitterService = async (
  data: DataForForwardPostXtwitter
): Promise<ReturnForForwardPost> => {
  const {
    targetForwardSetting,
    targetPostData,
    targetImageList
  } = data

  // 新建 twitterClient
  const twitterClient = new TwitterApi({
    appKey: targetForwardSetting.data['API Key'],
    appSecret: targetForwardSetting.data['API Key Secret'],
    accessToken: targetForwardSetting.data['Access Token'],
    accessSecret: targetForwardSetting.data['Access Token Secret']
  }, {
    // 使用代理
    httpAgent: fetchSystem.getAgent()
  }).readWrite

  // ...

  // 发送推文
  const postTweetRes = await twitterClient.v2.tweet({
    text: targetPostData.content,
    media: mediaForTweet,
    reply: replyForTweet
  })

  // ...
  // 将得到的数据处理为指定格式 resPostInfo resImageList
  return {
    resPostInfo,
    resImageList
  }
}
```
:::

`forwardPostTelegramService` 函数完成后，要在 `post-platform/index.ts` 中导出 telegram 文件夹
```ts
export * from './x-twitter'
export * from './telegram'
```

最后要在 `forward-post/service.ts` 中调用 `forwardPostTelegramService`
```ts
import { 
  forwardPostXtwitterService,
  forwardPostTelegramService
} from './post-platform'

// 按照平台对应字段，调用不同平台的转发方法
const postControlForwardPostService_SwitchPlatformPart = async (
  data: DataForForwardPost
): Promise<ReturnForForwardPost> => {
  if (isDataForPlatform(data, platformKeyMap.X.key)) {
    // 调用 X/Twitter 的转发方法
    return await forwardPostXtwitterService(data)
  }

  // 添加
  if (isDataForPlatform(data, platformKeyMap.Telegram.key)) {
    // 调用 Telegram 的转发方法
    return await forwardPostTelegramService(data)
  }

  throw new AppError('当前平台暂不支持转发', 400)
}
```
