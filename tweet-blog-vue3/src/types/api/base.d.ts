import type { AxiosResponse } from 'axios'

// api方法返回值类型的，dataType为返回数据的类型
export type ResData<DataType = undefined> = Promise<
  AxiosResponse<{
    code: number
    message: string
    data: DataType
  }>
>

export * from '../data'
