import { forwardSettingFind, forwardSettingGet, forwardSettingSet, forwardStore } from './services'

export const useForwardSystem = () => {
  return {
    forwardStore,
    forwardSettingFind,
    forwardSettingGet,
    forwardSettingSet
  }
}
