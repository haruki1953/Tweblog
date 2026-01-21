import { systemTaskConfig } from '@/configs'
import { defineStoreSystem } from '@/helpers'
import { typesTaskStoreSchema } from '@/schemas'

const storeSystem = defineStoreSystem({
  name: 'task',
  filePath: systemTaskConfig.storeFile,
  storeDefault: systemTaskConfig.storeDefault,
  storeSchema: typesTaskStoreSchema
})

export const store = storeSystem.store
export const save = storeSystem.save
