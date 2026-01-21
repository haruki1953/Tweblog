import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import * as drizzleOrm from 'drizzle-orm'
import * as drizzleSchema from './schema'
import { databaseConfig } from '@/configs'

// 确保数据库目录存在
mkdirSync(databaseConfig.databaseDir, { recursive: true })

// 将 Drizzle ORM 连接到数据库
const sqlite = new Database(databaseConfig.databasePath)
const drizzleDb = drizzle(sqlite, { schema: drizzleSchema })

// 每次启动都要迁移
migrate(drizzleDb, { migrationsFolder: databaseConfig.migrationsFolder })

export {
  drizzleDb,
  drizzleSchema,
  drizzleOrm
}
