import { computed, ref, type ComputedRef } from 'vue'
import type { Image } from '@/types'
import { imgLargeUrl, imgSamllUrl } from '../../data-handle'
import axios from 'axios'
import { axiosConfig } from '@/config'

// 全局储存已加载的图片信息
const imageLoadedInfos = ref<
  {
    imageId: string
    isLoaded: boolean
  }[]
>([])

export const useImageViewerPreviewOptimization = (dependencies: {
  images: ComputedRef<Image[]>
}) => {
  const { images } = dependencies

  // 片预览优化，先显示小图，大图加载完毕再显示
  const previewSrcList = computed(() => {
    return images.value.map((img) => {
      const findImageLoadedInfo = imageLoadedInfos.value.find(
        (info) => info.imageId === img.id
      )
      if (findImageLoadedInfo?.isLoaded) {
        return imgLargeUrl(img)
      } else {
        return imgSamllUrl(img)
      }
    })
  })
  // 在预览打开时加载大图
  const loadImageOnViewerShow = async () => {
    const promiseList = images.value.map(async (img) => {
      const findImageLoadedInfo = imageLoadedInfos.value.find(
        (info) => info.imageId === img.id
      )
      // 未加载（findImageLoadedInfo===undefined）
      // 加载中（isLoaded===false）
      // 已加载（isLoaded===true）
      // 已加载或加载中直接返回
      if (findImageLoadedInfo) {
        return
      }
      // 未加载，进行加载
      const newLength = imageLoadedInfos.value.push({
        imageId: img.id,
        isLoaded: false
      })
      const loadingImageIndex = newLength - 1
      await axios
        .get(imgLargeUrl(img), { timeout: axiosConfig.timeout })
        .catch(() => {})
      imageLoadedInfos.value[loadingImageIndex].isLoaded = true
    })
    await Promise.all(promiseList)
  }

  return {
    previewSrcList,
    loadImageOnViewerShow
  }
}
