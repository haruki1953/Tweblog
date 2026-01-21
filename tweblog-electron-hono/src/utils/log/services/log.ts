import { type LogTypeEnumValues, logTypeMap } from '@/configs'
import { drizzleDb, drizzleSchema } from '@/db'

export const logWithPromiseReturn = async (data: {
  content: string
  title?: string | null
  type?: LogTypeEnumValues
}) => {
  const {
    content, title, type = logTypeMap.info.key
  } = data
  const log = await drizzleDb.insert(drizzleSchema.logs)
    .values({
      content,
      title,
      type,
      createdAt: new Date()
    })
  return log
}

export const log = (data: {
  content: string
  title?: string | null
  type?: LogTypeEnumValues
}) => {
  logWithPromiseReturn(data).catch(() => {})
}

export const error = (data: {
  content: string
  title?: string | null
}) => {
  log({
    ...data,
    type: logTypeMap.error.key
  })
}

export const warning = (data: {
  content: string
  title?: string | null
}) => {
  log({
    ...data,
    type: logTypeMap.warning.key
  })
}

export const success = (data: {
  content: string
  title?: string | null
}) => {
  log({
    ...data,
    type: logTypeMap.success.key
  })
}

export const info = (data: {
  content: string
  title?: string | null
}) => {
  log({
    ...data,
    type: logTypeMap.info.key
  })
}
