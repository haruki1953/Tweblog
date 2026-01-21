import fs from 'fs'
import { type ZodObject, type z } from 'zod'
import { AppError } from '@/classes'
import { systemDataPath } from '@/configs'
import { confirmSaveFolderExists } from '@/utils'
import { cloneDeep } from 'lodash'
import path from 'path'
import { useLogUtil } from '@/utils/log'

export const defineStoreSystem = <
  StoreSchema extends ReturnType<typeof z.object>
>(dependencies: {
    name: string
    filePath: string
    storeDefault: () => z.infer<StoreSchema>
    storeSchema: StoreSchema
  }) => {
  const { name, filePath, storeDefault, storeSchema } = dependencies

  const init = () => {
    try {
      confirmSaveFolderExists(systemDataPath)
      const store = load()
      return {
        store
      }
    } catch (error) {
      // throw new AppError(`${name} 系统初始化失败`)
      console.log(`${name} 系统初始化失败`)
      throw error
    }
  }

  const backup = () => {
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '')
    const dir = path.dirname(filePath)
    const ext = path.extname(filePath)
    const baseName = path.basename(filePath, ext)
    const backupFileName = `fallback-${timestamp}-${baseName}${ext}`
    const backupFilePath = path.join(dir, backupFileName)

    fs.copyFileSync(filePath, backupFilePath)
    return backupFilePath
  }

  const logUtil = useLogUtil()

  // load data from file
  const load = () => {
    let hasFile = false
    let dataObj
    try {
      // 尝试从文件中读取数据
      const dataJson = fs.readFileSync(filePath, 'utf8')
      hasFile = true
      dataObj = JSON.parse(dataJson)
    } catch (error) {
      if (hasFile) {
        // json 解析失败
        const backupFilePath = backup()
        const logContent = `解析失败 ${filePath} 。数据已重置为默认数据，旧文件另存为 ${backupFilePath}`
        console.log(logContent)
        logUtil.error({
          content: logContent
        })
      }
      // 读取失败则使用默认数据
      dataObj = storeDefault()
    }

    let dataParsed
    try {
      // 尝试用zod确保数据结构正确
      dataParsed = storeSchema.parse(dataObj)
    } catch (error) {
      // 数据结构不正确，尝试将当前数据与默认数据结合
      // 首先应备份文件
      const backupFilePath = backup()
      try {
        // 将旧数据与默认数据结合后，进行验证
        const dataMerged = deepMergeParse(storeDefault(), dataObj, storeSchema)
        dataParsed = storeSchema.parse(dataMerged)
        const logContent = `修复成功 ${filePath} 的数据结构错误。数据已与默认数据合并，旧文件另存为 ${backupFilePath}`
        console.log(logContent)
        logUtil.warning({
          content: logContent
        })
      } catch (error) {
        // 数据结合后仍不正确，直接使用默认数据
        dataParsed = storeSchema.parse(storeDefault())
        const logContent = `error 修复失败 ${filePath} 的数据结构错误。数据已重置为默认数据，旧文件另存为 ${backupFilePath}`
        console.log(logContent)
        logUtil.warning({
          content: logContent
        })
      }
    }

    // 数据解析后，始终对其做一次保存
    const dataStr = JSON.stringify(dataParsed, null, 2)
    fs.writeFileSync(filePath, dataStr, 'utf8')
    // 返回解析后的数据
    return dataParsed
  }

  const save = (newStore: z.infer<StoreSchema>) => {
    try {
      // to check before save data
      storeSchema.parse(newStore)
      // update store
      Object.keys(newStore).forEach((key) => {
        (store as any)[key] = newStore[key]
      })
      // save json
      const dataStr = JSON.stringify(newStore, null, 2)
      fs.writeFileSync(filePath, dataStr, 'utf8')
    } catch (error) {
      // save data is illegal
      throw new AppError(`${name} 系统修改失败`)
    }
  }

  const initInfo = init()

  const store: z.infer<StoreSchema> = initInfo.store

  return {
    store,
    save
  }
}

/**
 * 深度合并两个对象，并使用 zod 进行验证
 * @param target - 目标对象，将被合并的对象
 * @param source - 源对象，合并到目标对象的对象
 * @param schema - zod 验证 schema
 * @returns 合并并验证后的对象
 *
 * 该函数通过递归的方式深度合并两个对象，并使用 zod schema 对合并后的结果进行验证。
 * 具体步骤如下：
 * 1. 深度克隆目标对象和源对象，确保不修改原始对象。
 * 2. 遍历目标对象的所有键。
 * 3. 对于每个键，获取对应的 zod schema。
 * 4. 检查源对象的值是否为对象（但不是数组），并且目标对象中存在相同的键：
 *    - 如果是，则递归调用 deepMergeParse 进行深度合并。
 *    - 否则，尝试使用 zod schema 对源对象的值进行验证：
 *      - 如果验证通过，则使用源对象的值。
 *      - 如果验证失败，则使用目标对象的值。
 * 5. 返回合并并验证后的对象。
 */
const deepMergeParse = <Schema extends ZodObject<any>>(targetVal: any, sourceVal: any, schema: Schema) => {
  const target = cloneDeep(targetVal)
  const source = cloneDeep(sourceVal)
  const merged: any = {}

  // 遍历目标对象的所有键
  for (const key in target) {
    // 获取当前键的 schema
    const keySchema = schema.shape[key]

    // 检查源对象的值是否为对象（但不是数组），并且目标对象中存在相同的键
    if (target[key] instanceof Object && !Array.isArray(target[key]) && key in source) {
      // 递归合并嵌套对象
      merged[key] = deepMergeParse(target[key], source[key], keySchema as ZodObject<any>)
    } else {
      let parsed
      try {
        parsed = keySchema.parse(source[key])
      } catch (error) {
        parsed = target[key]
      }
      merged[key] = parsed
    }
  }

  return merged
}
