export function mergeArrays<T>(idRelationGrid: T[][]): T[][] {
  const merged: T[][] = []

  idRelationGrid.forEach((arr) => {
    let newMerged: T[] = [...arr]

    for (let i = merged.length - 1; i >= 0; i--) {
      const intersection = merged[i].some((item) => newMerged.includes(item))
      if (intersection) {
        newMerged = Array.from(new Set([...newMerged, ...merged[i]]))
        merged.splice(i, 1) // Remove the merged array from the list
      }
    }

    merged.push(newMerged)
  })

  return merged
}

// const idRelationGrid: number[][] = [[2, 3], [4, 5], [3, 4], [2], [6, 7]]
// console.log(mergeArrays(idRelationGrid))
