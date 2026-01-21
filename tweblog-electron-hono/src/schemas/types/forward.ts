import { platformKeyEnum, type PlatformKeyEnumValues, platformKeyMap } from '@/configs'
import { type UnionToTuple } from '@/types'
import { z } from 'zod'

// 【已废弃】手动组成 forwardSettingItemSchema
// forwardSystem 转发系统中数据保存的类型
// // 定义 forwardConfigX 即为X/Twitter
// export const forwardSettingXSchema = z.object({
//   uuid: z.string(),
//   name: z.string(),
//   platform: z.literal(platformKeyMap.X.key),
//   data: platformKeyMap.X.forwardSettingDataSchema
// })
// // 定义 forwardConfigT 用于测试
// export const forwardSettingTSchema = z.object({
//   uuid: z.string(),
//   name: z.string(),
//   platform: z.literal(platformKeyMap.T.key),
//   data: platformKeyMap.T.forwardSettingDataSchema
// })
// // 合并后forwardSettingList的项
// export const forwardSettingItemSchema = z.union([
//   forwardSettingXSchema,
//   forwardSettingTSchema
// ])

// 【241227】 实现了根据 platformKeyMap 动态生成 forwardSettingItemSchema
// forwardSetting 为 forwardSystem 转发系统中数据保存的类型
const forwardSettingPlatformSchemaTuple = platformKeyEnum.map((key) => {
  return z.object({
    uuid: z.string(),
    name: z.string(),
    platform: z.literal(platformKeyMap[key].key),
    data: platformKeyMap[key].forwardSettingDataSchema
  }) as ForwardSettingPlatformSchemaUnion
}) as ForwardSettingPlatformSchemaTuple

// 类型 动态生成
type ForwardSettingPlatformSchema<
  K extends PlatformKeyEnumValues
> = z.ZodObject<{
  uuid: z.ZodString
  name: z.ZodString
  platform: z.ZodLiteral<K>
  data: (typeof platformKeyMap)[K]['forwardSettingDataSchema']
}, 'strip', z.ZodTypeAny, {
  uuid: string
  name: string
  platform: K
  data: (typeof platformKeyMap)[K]['forwardSettingDataDefault']
}, {
  uuid: string
  name: string
  platform: K
  data: (typeof platformKeyMap)[K]['forwardSettingDataDefault']
}>
// 联合
type ForwardSettingPlatformSchemaUnion = {
  [K in PlatformKeyEnumValues]: ForwardSettingPlatformSchema<K>
}[PlatformKeyEnumValues]
// 元组
type ForwardSettingPlatformSchemaTuple = UnionToTuple<ForwardSettingPlatformSchemaUnion>

// 合并后 forwardSettingItem forwardSettingList
// z.union 需要元组类型的 zod 对象
export const forwardSettingItemSchema = z.union(forwardSettingPlatformSchemaTuple)
export const forwardSettingListSchema = z.array(forwardSettingItemSchema)

// ForwardStore src\systems\forward\init.ts
export const typesForwardStoreSchema = z.object({
  forwardSettingList: forwardSettingListSchema
})

// 【已废弃】手动组成 forwardSettingItemForSetSchema
// 注意：修改完上面之后，这里也要修改
// ForSetSchema 将被用于转发配置设置接口，data改为可选
// // 定义 forwardConfigX 即为X/Twitter
// export const forwardSettingXForSetSchema = z.object({
//   uuid: z.string(),
//   name: z.string(),
//   platform: z.literal(platformKeyMap.X.key),
//   data: platformKeyMap.X.forwardSettingDataSchema.optional()
// })
// // 定义 forwardConfigT 用于测试
// export const forwardSettingTForSetSchema = z.object({
//   uuid: z.string(),
//   name: z.string(),
//   platform: z.literal(platformKeyMap.T.key),
//   data: platformKeyMap.T.forwardSettingDataSchema.optional()
// })
// // 合并后forwardSettingList的项
// export const forwardSettingItemForSetSchema = z.union([
//   forwardSettingXForSetSchema,
//   forwardSettingTForSetSchema
// ])

// 【241227】 实现了根据 platformKeyMap 动态生成 forwardSettingItemForSetSchema
// ForSetSchema 将被用于转发配置设置接口，data改为可选
const forwardSettingPlatformForSetSchemaTuple = platformKeyEnum.map((key) => {
  return z.object({
    uuid: z.string(),
    name: z.string(),
    platform: z.literal(platformKeyMap[key].key),
    data: platformKeyMap[key].forwardSettingDataSchema.optional()
  }) as ForwardSettingPlatformForSetSchemaUnion
}) as ForwardSettingPlatformForSetSchemaTuple

// 类型 动态生成
type ForwardSettingPlatformForSetSchema<
  K extends PlatformKeyEnumValues
> = z.ZodObject<{
  uuid: z.ZodString
  name: z.ZodString
  platform: z.ZodLiteral<K>
  data: z.ZodOptional<(typeof platformKeyMap)[K]['forwardSettingDataSchema']>
}, 'strip', z.ZodTypeAny, {
  uuid: string
  name: string
  platform: K
  data?: (typeof platformKeyMap)[K]['forwardSettingDataDefault'] | undefined
}, {
  uuid: string
  name: string
  platform: K
  data?: (typeof platformKeyMap)[K]['forwardSettingDataDefault'] | undefined
}>
// 联合
type ForwardSettingPlatformForSetSchemaUnion = {
  [K in PlatformKeyEnumValues]: ForwardSettingPlatformForSetSchema<K>
}[PlatformKeyEnumValues]
// 元组
type ForwardSettingPlatformForSetSchemaTuple = UnionToTuple<ForwardSettingPlatformForSetSchemaUnion>

// 合并后 forwardSettingItemForSet forwardSettingListForSet
export const forwardSettingItemForSetSchema = z.union(forwardSettingPlatformForSetSchemaTuple)
export const forwardSettingListForSetSchema = z.array(forwardSettingItemForSetSchema)
