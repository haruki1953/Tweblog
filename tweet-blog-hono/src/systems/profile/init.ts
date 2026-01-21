import { systemProfileConfig } from '@/configs'
import { defineStoreSystem } from '@/helpers'
import { typesProfileStoreSchema } from '@/schemas'

const storeDefault = () => {
  return systemProfileConfig.storeDefault()
}

const storeSystem = defineStoreSystem({
  name: 'profile',
  filePath: systemProfileConfig.storeFile,
  storeDefault,
  storeSchema: typesProfileStoreSchema
})

export const store = storeSystem.store
export const save = storeSystem.save
