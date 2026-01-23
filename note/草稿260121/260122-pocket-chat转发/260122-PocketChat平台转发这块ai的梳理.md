
你这块需求信息量很大，但结构其实已经很清晰了，我先用你熟悉的“平台模块心智模型”帮你把 PocketChat 这条链路勾勒出来——先不写代码，实现思路先对齐。

---

### 1. 平台定位与约束总结（PocketChat）

**平台关键点：**

- **后端：**PocketBase，自带 REST-ish API
- **集合：**`images`、`messages`
- **登录：**`POST /api/collections/users/auth-with-password`
    - 请求：`{ identity, password }`
    - 响应：`{ token, record: { id } }`
    - `record.id` → 所有 `ImagesRecord` / `MessagesRecord` 的 `author`
    - `token` → 后续所有请求的 `Authorization: Bearer <token>`

**消息约束：**

- `MessagesRecord` **不能同时**是文字+图片：
    - 不允许：`content` 为非空字符串 **且** `images` 长度 > 0
    - 允许：
        - 纯文字：`content` 非空，`images` 为空或未设置
        - 纯图片：`content` 为空或未设置，`images` 长度 1–4
- 单条消息：
    - **最大字数：** 2000
    - **最大图片数：** 4

**图片约束：**

- `images` 集合字段：
    - 必填：`image`、`imageSmall`、`imageTiny`
    - 可选：`imageBig`（当原图尺寸较大时才需要）
    - `image*Width` / `image*Height` / `image*FileSize`：由我们在处理时填入
- 图片处理配置（用 Jimp）：

```json
{
  "bigConfig":    { "format": "image/jpeg", "quality": 0.9, "sumWidthHeightLimit": 4000 },
  "imageConfig":  { "format": "image/jpeg", "quality": 0.8, "sumWidthHeightLimit": 2000 },
  "smallConfig":  { "format": "image/jpeg", "quality": 0.8, "sumWidthHeightLimit": 1200 },
  "tinyConfig":   { "format": "image/jpeg", "quality": 0.8, "sumWidthHeightLimit": 800 }
}
```

- 如果原图 `width + height < imageConfig.sumWidthHeightLimit`：
    - **不上传** `imageBig`
    - `imageBigWidth` / `imageBigHeight` 可设为 `0` 或不填（你后面可以再定规范）

---

### 2. 目录与模块结构规划

你希望放在：

`src/services/post-control/control-forward/forward-post/post-platform/pocket-chat/`

我建议直接镜像 Bluesky / Telegram 的结构：

```txt
post-platform/pocket-chat/
  configs.ts
  dependencies.ts
  apis/
    base.ts          // 通用响应处理、错误包装
    pocket-auth.ts   // 登录 & token 获取
    pocket-images.ts // images 集合相关
    pocket-messages.ts // messages 集合相关
  utils/
    image.ts         // Jimp 图片处理（big/image/small/tiny）
    text.ts          // 文本长度检查 & 拆分
  services/
    pocket-session.ts // 登录缓存（参考 bluesky-session）
    pocket-post.ts    // 发送单条消息（文字 / 图片）
    forward.ts        // 【转发方法】PocketChat（多条消息逻辑）
  index.ts
```

---

### 3. configs.ts（平台配置）

模仿 Telegram / Bluesky：

```ts
export const pocketChatConfig = {
  // 发推时的最大字数
  maxPostCharactersOnSend: 2000,
  // 单条消息最大图片数
  maxImageNumberOnSend: 4
} as const
```

---

### 4. Session 缓存（pocket-session.ts）

参考 `bluesky-session.ts`，但字段换成 PocketChat 的：

```ts
interface PocketChatSessionCacheItem {
  host: string            // "PocketChat Host"
  identity: string        // "Username or Email"
  password: string        // "Password"
  token: string           // JWT
  authorId: string        // record.id
  createAt: Date
}

let pocketChatSessionCache: PocketChatSessionCacheItem[] = []
```

**行为：**

- 查找缓存：`host + identity + password`
- 不存在 → 调用 `pocketAuthApi` 登录，写入缓存
- 存在 → 直接返回
- 你可以先不做 refresh 逻辑，等后面需要再加（PocketBase token 过期策略你可以之后再查）

---

### 5. 图片处理与上传流程（images 集合）

**目标：**

- 在发送任何 `messages` 之前：
    - 对当前帖子的所有图片进行处理（big/image/small/tiny）
    - 全部上传到 `images` 集合
    - 拿到所有 `image.id`，并保留与原始 `targetImageList` 的对应关系

**处理步骤（utils/image.ts）：**

对每个 `localLargeImagePath`：

1. 用 Jimp 读取原图
2. 计算 `width + height`
3. 按四个 config 生成不同尺寸：
    - 通用逻辑：
        - 如果 `width + height > sumWidthHeightLimit`：
            - 按比例缩放，使 `width + height == sumWidthHeightLimit`（或不超过）
        - 设置 `format`（`mime`）和 `quality`
        - 导出为 buffer（`image/jpeg`）
        - 记录：
            - `width` / `height`
            - `buffer.length` → `FileSize`
4. 关于 `imageBig`：
    - 如果原图 `width + height < imageConfig.sumWidthHeightLimit`：
        - 不生成 `imageBig`，相关字段设为 `0` 或不填
    - 否则按 `bigConfig` 生成

**上传（apis/pocket-images.ts）：**

- `POST /api/collections/images/records`
- `Content-Type: multipart/form-data`
- 字段：
    - `author`: `session.authorId`
    - `alt`: 来自 `targetImageList[i].alt`（可截断长度，如果你有上限）
    - `image` / `imageBig` / `imageSmall` / `imageTiny`: 对应 buffer + 文件名
    - `imageWidth` / `imageHeight` / `imageFileSize` 等：来自处理结果
- 响应：
    - `id` → 之后 `messages.images` 使用

---

### 6. 消息发送策略（messages 集合）

你希望的顺序是：

1. **先发送文字消息**
2. 拿到文字消息 `id`
3. 再发送图片消息，`replyMessage` 指向文字消息 `id`

再叠加“超长文本 / 超多图片 → 多条消息”的需求，就变成：

#### 6.1 文本拆分（utils/text.ts）

类似 Bluesky 的 `blueskyPostContentSplitUtil`：

- 输入：`content: string`
- 输出：`string[]`，每个不超过 `pocketChatConfig.maxPostCharactersOnSend`（2000）
- 是否需要 `(1/3)` 这种计数尾巴，你可以沿用 Bluesky 的逻辑，或者 PocketChat 简化为纯拆分。

#### 6.2 图片分组

- 使用类似 `imageListToMaxNumGroupList` 的工具：
    - 每组最多 `pocketChatConfig.maxImageNumberOnSend`（4）
    - 尽量平均分配

#### 6.3 组合策略（forward.ts）

假设：

- `textChunks: string[]`（拆分后的文本）
- `imageGroups: ImageInfo[][]`（每组 ≤4）

你之前对 Bluesky 的多回复策略是“文字+图片混合分组”，但 PocketChat 有“文字消息”和“图片消息”类型的硬约束，所以这里策略要稍微不一样。

你当前明确的期望是：

> 先发送文字消息，然后拿到文字消息的id，然后发送图片消息且 replyMessage 为文字消息 id

在“多条消息”语义下，可以这样定义 PocketChat 的转发模型：

1. **文字部分：**
    
    - 如果 `textChunks.length === 0`：
        - 不发送文字消息（但你刚才的描述是“先发送文字消息”，这时可以考虑发一条空内容的占位消息，或者直接只发图片消息——这个可以后面再定）
    - 如果 `textChunks.length >= 1`：
        - 依次发送文字消息：
            - 第一条：`replyMessage` 为空
            - 后续每条：`replyMessage` 指向上一条文字消息的 `id`
        - 最后一条文字消息的 `id` 记为 `rootMessageId`（或 `lastTextMessageId`）
2. **图片部分：**
    
    - 对每个 `imageGroup`：
        - 发送一条 **纯图片消息**：
            - `content` 不填或为空字符串
            - `images`: 当前组的图片 `id[]`
            - `replyMessage`: 指向 `rootMessageId`（或者你也可以选择链式回复上一条图片消息，这取决于你希望 PocketChat 里呈现的结构）
3. **返回值：**
    
    - `resPostInfo`：
        - `postId`: 原帖 id
        - `platformPostId`: 可以用 `rootMessageId` 或最后一条消息的 `id`
        - `platformPostLink`: 你后面可以根据 PocketChat 的前端路由规则拼接
    - `resImageList`：
        - `imageId`: 原始图片 id
        - `platformImageId`: 对应 `images` 集合的 `id`
        - `platformImageLink`: 如果 PocketChat 有公开图片 URL，可以拼；否则可以留空或用 API 路径

---

### 7. 单条消息发送服务（pocket-post.ts）

类似 `blueskySendPostService`，但拆成两类：

- `pocketSendTextMessageService`
    - 输入：`{ host, token, authorId, content, replyMessage? }`
    - 约束：`content` 非空，`images` 不设置
- `pocketSendImageMessageService`
    - 输入：`{ host, token, authorId, imageIds: string[], replyMessage? }`
    - 约束：`imageIds.length > 0 && imageIds.length <= 4`，`content` 不设置

---

### 8. forwardPostPocketChatService 的整体流程

在 `services/forward.ts` 中，模仿 `forwardPostBlueskyService`：

1. 从 `targetForwardSetting.data` 取：
    - `PocketChat Host`
    - `Username or Email`
    - `Password`
2. 获取 session：
    - `pocketGetSessionService` → `{ token, authorId }`
3. 预处理并上传所有图片：
    - 输入：`targetImageList`
    - 输出：`resUploadImageInfoList`（包含 `imageRecordId`、原始 `id`、本地路径等）
4. 文本拆分、图片分组：
    - `textChunks = pocketPostContentSplitUtil(targetPostData.content)`
    - `imageGroups = pocketImageListToMaxNumGroupList(targetImageListProcessed)`
5. 发送文字消息（可能多条）：
    - 记录最后一条文字消息的 `id` 为 `rootMessageId`
6. 发送图片消息（可能多条）：
    - 每组图片 → 一条图片消息，`replyMessage = rootMessageId`
7. 组装返回值：
    - `resPostInfo`
    - `resImageList`（基于 `resUploadImageInfoList`）

---

如果你愿意，下一步我可以直接按这个结构给你：

- 完整的 `pocket-chat/configs.ts`
- `pocket-chat/services/pocket-session.ts`
- `pocket-chat/utils/image.ts` 的 Jimp 处理骨架
- `pocket-chat/services/forward.ts` 的主流程骨架（不写死 API 路径细节，只留 TODO）

你现在更想要的是“先把机制和结构定死”，还是“直接来一版可运行的初稿代码，然后你再做风格与细节调整”？


## 我的一些建议

```
关于 4. Session 缓存（pocket-session.ts）
我希望做令牌刷新逻辑，其实就类似blueskybluesky-session.ts
如 PocketChatSessionCacheItem 加上 refreshAt: Date
再改改结构
interface PocketChatSessionCacheItem {
  host: string            // "PocketChat Host"
  identity: string        // "Username or Email"
  password: string        // "Password"
  token: string           // JWT
  authorId: string        // record.id
  session: //这个或许登录接口的响应值即可
{
  "token": "JWT_TOKEN",
  "record": {
    // ...
    "id": "xw762r8c59hd4ro",
  }
}
  createAt: Date
  refreshAt: Date
}
令牌刷新逻辑其实也就类似blueskybluesky-session.ts
不过其不必有专用的刷新接口，刷新时重新调用登录接口即可
pocketChatGetSessionService 好像这个函数是在每次请求前会调用一下对吧
其中就可以判断一下refreshAt，如果距今超过 十分钟就刷新
```

```
关于 6.1 文本拆分（utils/text.ts）
你说的 是否需要 `(1/3)` 这种计数尾巴，你可以沿用 Bluesky 的逻辑，或者 PocketChat 简化为纯拆分。
我觉得这样比较好：沿用 Bluesky 的逻辑 要 `(1/3)` 这种计数尾巴 比较好

关于 6.3 组合策略（forward.ts）文字部分
你说的 如果 `textChunks.length === 0`：不发送文字消息（但你刚才的描述是“先发送文字消息”，这时可以考虑发一条空内容的占位消息，或者直接只发图片消息——这个可以后面再定）这一块
我希望的就是直接只发图片消息，我希望的就是直接只发图片消息，我希望的就是直接只发图片消息，
绝对不要发空内容的消息，绝对不要发空内容的消息，绝对不要发空内容的消息

关于 6.3 组合策略（forward.ts）图片部分
你说的 `replyMessage`: 指向 `rootMessageId`（或者你也可以选择链式回复上一条图片消息，这取决于你希望 PocketChat 里呈现的结构）
我觉得指向rootMessageId就可以。我觉得链式回复上一条图片消息不太好

关于 6.3 组合策略（forward.ts）返回值
关于 platformPostLink 是类似这样的
如 http://127.0.0.1:58090/?id=ve0p4tl9f78veij&created=2026-01-18+09:29:29.827Z
如 https://sakiko.top/?id=54trnmgnjie2fj4&created=2026-01-21+12:23:29.897Z
即伪代码 urlJoinUtil(
	PocketChat Host ，
	`?id=${消息id}&created=${消息created（创建时间）}`,
)
```

```
我想让你给我类似 文件夹结构、功能骨架之类 的东西
我就是想，之后用你给我的一些东西，让你 一部分一部分、一组文件一组文件、 给我生成代码
要便于以后我指挥你生成代码
```