import type { LogTypeEnumValues } from '@/config'

export interface LogData {
  id: string
  title: string | null
  content: string
  type: LogTypeEnumValues
  // createdAt: Date;
  createdAt: string
}
