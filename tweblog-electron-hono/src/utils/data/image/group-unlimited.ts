// 将图片数组分组，每组中不超过4个，且平均，组中图片较多的在后
export const imageListToMax4GroupList = <T>(imageList: T[]) => {
  return imageListToMaxNumGroupList({
    imageList,
    maxNum: 4
  })
}

// 将图片数组分组，指定数量，且平均，组中图片较多的在后
export const imageListToMaxNumGroupList = <T>(data: {
  imageList: T[]
  maxNum: number
}) => {
  const { imageList, maxNum } = data

  // 一行中的最大个数
  const itemCountInRow = maxNum
  // 总共的行数
  const rowCountInBox = Math.ceil(imageList.length / itemCountInRow)
  // 计算应分配到每行的基础数量
  const baseItemCount = Math.floor(imageList.length / rowCountInBox)
  // 计算需要多放一个项目的行数
  const extraItemsCount = imageList.length % rowCountInBox

  const grid: T[][] = []
  let currentIndex = 0
  for (let i = 0; i < rowCountInBox; i++) {
    // 后 extraItemsCount 行分配 baseItemCount + 1 个项目，剩余行分配 baseItemCount 个项目
    const itemsInThisRow = (() => {
      if (rowCountInBox - i <= extraItemsCount) {
        return baseItemCount + 1
      }
      return baseItemCount
    })()
    grid.push(imageList.slice(currentIndex, currentIndex + itemsInThisRow))
    currentIndex += itemsInThisRow
  }
  return grid
}
