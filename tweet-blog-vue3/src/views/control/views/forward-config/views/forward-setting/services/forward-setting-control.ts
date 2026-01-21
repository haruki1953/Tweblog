import type { ForwardSettingItemInForm } from '@/types'
import { cloneDeep } from 'lodash'
import type { Ref } from 'vue'

export const createForwardSettingListInFormControl = (dependencies: {
  forwardSettingListInForm: Ref<ForwardSettingItemInForm[]>
}) => {
  const { forwardSettingListInForm } = dependencies
  const useForwardSettingListInFormControl = () => {
    const couldMoveSetting = (uuid: string, move: 'up' | 'down') => {
      let couldMove = true
      const findIndex = forwardSettingListInForm.value.findIndex(
        (i) => i.uuid === uuid
      )
      if (findIndex === -1) {
        couldMove = false
      } else {
        if (move === 'up') {
          if (findIndex === 0) {
            couldMove = false
          }
        } else {
          if (findIndex === forwardSettingListInForm.value.length - 1) {
            couldMove = false
          }
        }
      }
      return {
        couldMove,
        findIndex
      }
    }
    const moveSetting = (uuid: string, move: 'up' | 'down') => {
      // const findIndex = forwardSettingListInForm.value.findIndex(
      //   (i) => i.uuid === uuid
      // )
      // if (findIndex === -1) {
      //   return
      // }
      const couldIndex = couldMoveSetting(uuid, move)
      if (!couldIndex.couldMove) {
        return
      }
      const findIndex = couldIndex.findIndex
      const targetItem = forwardSettingListInForm.value[findIndex]
      const targetIndex = (() => {
        if (move === 'up') {
          // if (findIndex === 0) {
          //   return findIndex
          // }
          return findIndex - 1
        } else {
          // if (findIndex === forwardSettingListInForm.value.length - 1) {
          //   return findIndex
          // }
          return findIndex + 1
        }
      })()

      let newList = [...forwardSettingListInForm.value]
      newList = newList.filter((i) => i.uuid !== targetItem.uuid)
      newList.splice(targetIndex, 0, targetItem)

      forwardSettingListInForm.value = newList
    }

    const addSetting = (item: ForwardSettingItemInForm) => {
      forwardSettingListInForm.value.push(cloneDeep(item))
    }

    const updateSetting = (item: ForwardSettingItemInForm) => {
      const findIndex = forwardSettingListInForm.value.findIndex(
        (i) => i.uuid === item.uuid
      )
      if (findIndex === -1) {
        return
      }
      forwardSettingListInForm.value[findIndex] = cloneDeep(item)
    }

    const findSetting = (uuid: string) => {
      return forwardSettingListInForm.value.find((i) => i.uuid === uuid)
    }

    return {
      couldMoveSetting,
      moveSetting,
      addSetting,
      updateSetting,
      findSetting
    }
  }

  return useForwardSettingListInFormControl
}

export type UseForwardSettingListInFormControl = ReturnType<
  typeof createForwardSettingListInFormControl
>
