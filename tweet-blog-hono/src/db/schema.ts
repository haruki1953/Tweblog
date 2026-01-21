import { sqliteTable, text, integer, primaryKey, foreignKey, index } from 'drizzle-orm/sqlite-core'
import { relations, sql } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'
import { logTypeEnum, platformKeyEnum } from '@/configs'

// 帖子表
export const posts = sqliteTable(
  'posts',
  {
    id: text('id').primaryKey().$default(() => uuidv4()),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
    addedAt: integer('added_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
    content: text('content').notNull(),
    isDeleted: integer('is_deleted', { mode: 'boolean' }).notNull().default(false),
    imagesOrder: text('images_order'),
    parentPostId: text('parent_post_id')
    // 对于指向自身的外键，这样设置是不行的
    // .references(() => posts.id)
  },
  // 需要通过回调函数来设置指向自身的外键
  (table) => [
    foreignKey({
      columns: [table.parentPostId],
      foreignColumns: [table.id],
      name: 'fk-posts-parent_post_id'
    }),
    index('idx-posts-created_at').on(table.createdAt),
    index('idx-posts-parent_post_id').on(table.parentPostId)
  ]
)

// 图片表
export const images = sqliteTable(
  'images',
  {
    id: text('id').primaryKey().$default(() => uuidv4()),
    alt: text('alt'),
    path: text('path').notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
    addedAt: integer('added_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
    smallSize: integer('small_size').notNull().default(0),
    largeSize: integer('large_size').notNull().default(0),
    originalSize: integer('original_size').notNull().default(0),
    originalPath: text('original_path')
  },
  (table) => [
    index('idx-images-created_at').on(table.createdAt)
  ]
)

// 帖子与图片的多对多关系表
export const postsToImages = sqliteTable(
  'posts_to_images',
  {
    postId: text('post_id').notNull().references(() => posts.id),
    imageId: text('image_id').notNull().references(() => images.id)
  },
  // 复合主键好像导致了已弃用警告：
  // @deprecated — sqliteTable 的第三个参数正在更改，并且只接受数组而不是对象
  // 原来是需要使用数组来定义复合主键，以此避免弃用警告
  // (t) => ({
  //   pk: primaryKey({ columns: [t.postId, t.imageId] })
  // })
  (t) => [
    primaryKey({ columns: [t.postId, t.imageId] })
  ]
)

// 帖子转发记录表
export const postForwards = sqliteTable(
  'post_forwards',
  {
    id: text('id').primaryKey().$default(() => uuidv4()),
    platform: text('platform', {
    // Drizzle居然支持元组，这下可以统一用configs管理了
      enum: platformKeyEnum
    }).notNull(),
    platformPostId: text('platform_post_id').notNull(),
    link: text('link').notNull(),
    forwardAt: integer('forward_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
    forwardConfigId: text('forward_config_id').notNull(),
    postId: text('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' })
  },
  (table) => [
    index('idx-post_forwards-post_id').on(table.postId)
  ]
)

// 帖子导入记录表
export const postImports = sqliteTable(
  'post_imports',
  {
    id: text('id').primaryKey().$default(() => uuidv4()),
    platform: text('platform', {
      enum: platformKeyEnum
    }).notNull(),
    platformPostId: text('platform_post_id').notNull(),
    link: text('link').notNull(),
    importedAt: integer('imported_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
    postId: text('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' })
  },
  (table) => [
    index('idx-post_imports-post_id').on(table.postId)
  ]
)

// 图片转发记录表
export const imageForwards = sqliteTable(
  'image_forwards',
  {
    id: text('id').primaryKey().$default(() => uuidv4()),
    platform: text('platform', {
      enum: platformKeyEnum
    }).notNull(),
    platformImageId: text('platform_image_id').notNull(),
    link: text('link').notNull(),
    forwardAt: integer('forward_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
    forwardConfigId: text('forward_config_id').notNull(),
    imageId: text('image_id').notNull().references(() => images.id, { onDelete: 'cascade' })
  },
  (table) => [
    index('idx-image_forwards-image_id').on(table.imageId)
  ]
)

// 图片导入记录表
export const imageImports = sqliteTable(
  'image_imports',
  {
    id: text('id').primaryKey().$default(() => uuidv4()),
    platform: text('platform', {
      enum: platformKeyEnum
    }).notNull(),
    platformImageId: text('platform_image_id').notNull(),
    link: text('link').notNull(),
    importedAt: integer('imported_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
    imageId: text('image_id').notNull().references(() => images.id, { onDelete: 'cascade' })
  },
  (table) => [
    index('idx-image_imports-image_id').on(table.imageId)
  ]
)

// 日志表
export const logs = sqliteTable(
  'logs',
  {
    id: text('id').primaryKey().$default(() => uuidv4()),
    title: text('title'),
    content: text('content').notNull(),
    type: text('type', {
      enum: logTypeEnum
    }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`)
  },
  (table) => [
    index('idx-logs-created_at').on(table.createdAt),
    index('idx-logs-type').on(table.type)
  ]
)

/* 关系 */

export const postsRelations = relations(posts, ({ many, one }) => ({
  postsToImages: many(postsToImages, { relationName: 'PostsRelationsPostsToImages' }),
  parentPost: one(posts, {
    fields: [posts.parentPostId],
    references: [posts.id],
    relationName: 'PostReplies'
  }),
  replies: many(posts, {
    relationName: 'PostReplies'
  }),
  postForwards: many(postForwards, { relationName: 'PostForwards' }),
  postImports: many(postImports, { relationName: 'PostImports' })
}))

export const imagesRelations = relations(images, ({ many }) => ({
  postsToImages: many(postsToImages, { relationName: 'ImagesRelationsPostsToImages' }),
  imageImports: many(imageImports, { relationName: 'ImageImports' }),
  imageForwards: many(imageForwards, { relationName: 'ImageForwards' })
}))

export const postsToImagesRelations = relations(postsToImages, ({ one }) => ({
  post: one(posts, {
    fields: [postsToImages.postId],
    references: [posts.id],
    relationName: 'PostsRelationsPostsToImages'
  }),
  image: one(images, {
    fields: [postsToImages.imageId],
    references: [images.id],
    relationName: 'ImagesRelationsPostsToImages'
  })
}))

export const postForwardsRelations = relations(postForwards, ({ one }) => ({
  post: one(posts, {
    fields: [postForwards.postId],
    references: [posts.id],
    relationName: 'PostForwards'
  })
}))

export const postImportsRelations = relations(postImports, ({ one }) => ({
  post: one(posts, {
    fields: [postImports.postId],
    references: [posts.id],
    relationName: 'PostImports'
  })
}))

export const imageForwardsRelations = relations(imageForwards, ({ one }) => ({
  image: one(images, {
    fields: [imageForwards.imageId],
    references: [images.id],
    relationName: 'ImageForwards'
  })
}))

export const imageImportsRelations = relations(imageImports, ({ one }) => ({
  image: one(images, {
    fields: [imageImports.imageId],
    references: [images.id],
    relationName: 'ImageImports'
  })
}))
