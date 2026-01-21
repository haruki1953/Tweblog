import { AppError } from '@/classes'
import { store, save } from '../init'
import { canAttemptLogin, recordLoginFailure, resetLoginControl } from './login-control'
import { systemAdminConfig } from '@/configs'
import { generateRandomKey, useLogUtil } from '@/utils'
import bcrypt from 'bcryptjs'

const logUtil = useLogUtil()

export const confirmAuth = (username: string, password: string) => {
  if (!canAttemptLogin()) {
    throw new AppError('多次登录失败，已锁定', 400, 1002)
  }
  if (
    username !== store.username ||
    // password !== store.password
    (() => {
      try {
        const isMatch = bcrypt.compareSync(password, store.password)
        return !isMatch
      } catch (err) {
        logUtil.error({
          title: '密码验证失败',
          content: String(err)
        })
        throw new AppError('密码验证失败', 500)
      }
    })()
  ) {
    recordLoginFailure()
    throw new AppError('用户名或密码错误', 400, 1001)
  }
  resetLoginControl()
}

export const updateAuth = (username: string, password: string) => {
  // 要重置jwt
  save({
    ...store,
    username,
    // password,
    password: (() => {
      try {
        const hash = bcrypt.hashSync(password, systemAdminConfig.passwordSaltRounds)
        return hash
      } catch (err) {
        logUtil.error({
          title: '密码哈希失败',
          content: String(err)
        })
        throw new AppError('密码哈希失败', 500)
      }
    })(),
    jwtAdminSecretKey: generateRandomKey()
  })
}

export const isAuthDefault = () => {
  const storeDefaultVal = systemAdminConfig.storeDefault()
  if (
    store.username === storeDefaultVal.username &&
    // store.password === storeDefaultVal.password
    (() => {
      try {
        const isMatch = bcrypt.compareSync(storeDefaultVal.password, store.password)
        return isMatch
      } catch (err) {
        logUtil.error({
          title: '密码验证失败',
          content: String(err)
        })
        throw new AppError('密码验证失败', 500)
      }
    })()
  ) {
    return true
  }
  return false
}

export const getJwtAdminSecretKey = () => {
  return store.jwtAdminSecretKey
}

export const getJwtAdminExpSeconds = () => {
  return store.jwtAdminExpSeconds
}

export const getAdminInfo = () => {
  return {
    jwtAdminExpSeconds: store.jwtAdminExpSeconds,
    loginMaxFailCount: store.loginMaxFailCount,
    loginLockSeconds: store.loginLockSeconds
  }
}

export const updateAdminInfo = (
  info: {
    jwtAdminExpSeconds: number
    loginMaxFailCount: number
    loginLockSeconds: number
  }
) => {
  save({
    ...store,
    ...info
  })
}

export const getProxyInfo = () => {
  const {
    proxyAddressHttp
  } = store
  return {
    proxyAddressHttp
  }
}

export const updateProxyInfo = (info: {
  proxyAddressHttp: string
}) => {
  save({
    ...store,
    ...info
  })
}
