import { loginControlStore, store } from '../init'

export const canAttemptLogin = () => {
  const { lockUntil } = loginControlStore
  if ((lockUntil != null) && new Date() < lockUntil) {
    return false // 仍在锁定期内
  }
  return true // 可以尝试登录
}

export const recordLoginFailure = () => {
  loginControlStore.failCount += 1
  if (loginControlStore.failCount >= store.loginMaxFailCount) {
    loginControlStore.failCount = 0
    loginControlStore.lockUntil =
    new Date(new Date().getTime() + store.loginLockSeconds * 1000) // 锁定一段时间
  }
}

export const resetLoginControl = () => {
  loginControlStore.failCount = 0
  loginControlStore.lockUntil = null
}
