import { forwardingOrderEnum, taskStatusEnum } from '@/configs'
import { z } from 'zod'

// 任务项的基础结构
export const taskBaseItemSchema = z.object({
  uuid: z.string(),
  startedAt: z.string(),
  updatedAt: z.string(),
  totalCount: z.number(),
  completedCount: z.number(),
  status: z.enum(taskStatusEnum)
})

// 导入任务
export const taskImportPartSchema = z.object({})
export const taskImportItemSchema = taskBaseItemSchema.merge(taskImportPartSchema)

// 转发任务
export const taskForwardPartSchema = z.object({
  forwardConfigId: z.string(),
  forwardingOrder: z.enum(forwardingOrderEnum),
  forwardingNumber: z.number().int().positive(),
  forwardingIntervalSeconds: z.number().int().positive(),
  lastForwardedPostId: z.string().nullable()
})
export const taskForwardItemSchema = taskBaseItemSchema.merge(taskForwardPartSchema)

export const typesTaskStoreSchema = z.object({
  taskImportList: z.array(taskImportItemSchema),
  taskForwardList: z.array(taskForwardItemSchema)
})
