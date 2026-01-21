import { defineConfig } from 'drizzle-kit'
import { databaseConfig } from './src/configs'

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: `file:${databaseConfig.databasePath}`
  }
})
