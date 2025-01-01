# 扩展转发功能

## 转发功能原理
转发功能的原理是，后端保存转发配置数组，每个配置项包含平台所需的认证信息，如令牌。在进行推文转发时，用户选择指定的转发配置，后端根据该配置调用相应平台的 API，使用其中的令牌等数据完成转发操作。

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

这个数据结构会根据 [platform.ts](./project.md#platform-ts-说明) 自动生成

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
