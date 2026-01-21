import { AppError } from '@/classes'
import { type StatusCode } from 'hono/utils/http-status'
import { handleResData } from './data'
import { HTTPException } from 'hono/http-exception'
import { type Hono } from 'hono'
import { useLogUtil } from '@/utils'

// handle error (call in services function on catch error)
export const handleAppError = (
  error: any, message: string, statusCode?: StatusCode, errorCode?: number
): void => {
  if (error instanceof AppError) {
    error.message = `${message} | ${error.message}`
    if (statusCode !== undefined) error.statusCode = statusCode
    if (errorCode !== undefined) error.errorCode = errorCode
    throw error
  } else {
    throw new AppError(`${message}`, statusCode)
  }
}

const logUtil = useLogUtil()

// handle global error
export const handleGlobalError: Parameters<Hono['onError']>[0] = (error, c) => {
  // handle AppError
  if (error instanceof AppError) {
    c.status(error.statusCode ?? 500)
    return c.json(handleResData(
      error.errorCode ?? 1,
      error.message
    ))
  }

  // handle HTTPException
  // for example: Malformed JSON in request body
  if (error instanceof HTTPException) {
    // console.log(error) // !!! for test、
    logUtil.info({
      title: '发生 HTTPException 错误',
      content: String(error)
    })
    c.status(error.status)
    // return c.json(handleResData(1, error.message))
    return c.json(handleResData(1, 'HTTPException'))
  }

  // unknown error
  // throw error
  // console.log(error)
  logUtil.info({
    title: '发生未知错误',
    content: String(error)
  })
  c.status(500)
  // return c.json(handleResData(1, `unknown error: ${error.message}`))
  return c.json(handleResData(1, 'unknown error'))
}
