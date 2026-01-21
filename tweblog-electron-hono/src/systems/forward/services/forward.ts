import { store } from './dependencies'
import { forwardSettingGet } from './forward-setting'

export const forwardStore = () => {
  return {
    ...store,
    forwardSettingList: forwardSettingGet()
  }
}
