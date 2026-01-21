import { type StatusCode } from 'hono/utils/http-status'

// 自定义错误类
export class AppError extends Error {
  statusCode: StatusCode | undefined
  errorCode: number | undefined
  constructor (message: string, statusCode?: StatusCode, errorCode?: number) {
    super(message)
    this.name = 'AppError'
    this.message = message
    this.statusCode = statusCode
    this.errorCode = errorCode
  }
}
