import { log, logWithPromiseReturn, success, warning, error, info } from './services'

export const useLogUtil = () => {
  return {
    log,
    error,
    warning,
    success,
    info,
    logWithPromiseReturn
  }
}
