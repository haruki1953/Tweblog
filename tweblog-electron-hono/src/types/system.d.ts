import { type forwardSettingItemForSetSchema, type forwardSettingItemSchema, type typesAdminStoreSchema, type typesForwardStoreSchema, type typesProfileStoreSchema, type typesFileStoreSchema, type typesTaskStoreSchema, type taskBaseItemSchema, type taskImportItemSchema, type taskForwardItemSchema, type taskImportPartSchema, type taskForwardPartSchema } from '@/schemas'
import { type z } from 'zod'

export type AdminStore = z.infer<typeof typesAdminStoreSchema>
// {
//   username: string
//   password: string
//   jwtAdminSecretKey: string
//   jwtAdminExpSeconds: number
//   loginMaxFailCount: number
//   loginLockSeconds: number
// }

export type FileStore = z.infer<typeof typesFileStoreSchema>

export type ProfileStore = z.infer<typeof typesProfileStoreSchema>

// export interface TaskCache {
//   importTaskList: Array<{
//     uuid: string
//     startAt: string
//     totalCount: number
//     completedCount: number
//   }>
// }
export type TaskStore = z.infer<typeof typesTaskStoreSchema>
export type TaskBaseItem = z.infer<typeof taskBaseItemSchema>

// 通过类型体操，设置为只有totalCount是必须的，创建任务时要用到这个类型
export type TaskBaseItemOnlyRequiredTotalCount = Partial<Omit<TaskBaseItem, 'totalCount'>> & Pick<TaskBaseItem, 'totalCount'>

export type TaskImportPart = z.infer<typeof taskImportPartSchema>
export type TaskImportItem = z.infer<typeof taskImportItemSchema>
export type TaskForwardPart = z.infer<typeof taskForwardPartSchema>
export type TaskForwardItem = z.infer<typeof taskForwardItemSchema>

export type ForwardStore = z.infer<typeof typesForwardStoreSchema>
export type ForwardSettingItem = z.infer<typeof forwardSettingItemSchema>
export type ForwardSettingItemForSet = z.infer<typeof forwardSettingItemForSetSchema>

// 【241226】实现 通过传入平台所代表字段类型，来获取对应的类型
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
//   uuid: string;
//   name: string;
//   platform: "X";
//   data: {
//       'API Key': string;
//       'API Key Secret': string;
//       'Access Token': string;
//       'Access Token Secret': string;
//   };
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
