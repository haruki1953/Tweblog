import { systemForwardConfig } from '@/configs'
import { defineStoreSystem } from '@/helpers'
import { typesForwardStoreSchema } from '@/schemas'

const storeDefault = () => {
  return systemForwardConfig.storeDefault()
}
// console.log('typesForwardStoreSchema', typesForwardStoreSchema)
const storeSystem = defineStoreSystem({
  name: 'forward',
  filePath: systemForwardConfig.storeFile,
  storeDefault,
  storeSchema: typesForwardStoreSchema
})

export const store = storeSystem.store
export const save = storeSystem.save
