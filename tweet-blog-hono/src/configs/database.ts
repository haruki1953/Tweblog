import path from 'path'
import { systemDataPath } from './system'

// 数据库目录名，文件名，路径
const databaseDir = systemDataPath
const databaseFile = 'database-1_0_0.sqlite'
const databasePath = path.join(databaseDir, databaseFile)

const migrationsFolder = path.join(__dirname, '../../drizzle')

export const databaseConfig = {
  databasePath,
  databaseFile,
  databaseDir,
  migrationsFolder
} as const
