import { pgTable, serial, varchar, integer, timestamp, boolean, jsonb, text, uniqueIndex, index } from 'drizzle-orm/pg-core'

export const UserRole = ['admin', 'user'] as const
export const DocumentStatus = ['draft', 'review', 'published', 'archived'] as const

export const sectors = pgTable('sectors', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 150 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: varchar('role', { length: 20 }).notNull().default('user'),
  sectorId: integer('sector_id').references(() => sectors.id).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userSectorIdx: index('idx_users_sector').on(table.sectorId),
}))

export const documentCategories = pgTable('document_categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: varchar('description', { length: 500 }),
  parentId: integer('parent_id').references((): any => documentCategories.id),
  sectorId: integer('sector_id').references(() => sectors.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  parentIdx: index('idx_category_parent').on(table.parentId),
  sectorCategoryIdx: index('idx_category_sector').on(table.sectorId),
}))

export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  color: varchar('color', { length: 7 }).default('#6366f1'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const documentTags = pgTable('document_tags', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id').references(() => documents.id).notNull(),
  tagId: integer('tag_id').references(() => tags.id).notNull(),
}, (table) => ({
  docTagUnique: uniqueIndex('idx_doc_tag').on(table.documentId, table.tagId),
}))

export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  contentJson: jsonb('content_json').notNull().default({}),
  contentType: varchar('content_type', { length: 20 }).notNull().default('rich-text'),
  contentUrl: varchar('content_url', { length: 500 }),
  imageUrl: varchar('image_url', { length: 500 }),
  summary: varchar('summary', { length: 500 }),
  sectorId: integer('sector_id').references(() => sectors.id).notNull(),
  authorId: integer('author_id').references(() => users.id).notNull(),
  categoryId: integer('category_id').references(() => documentCategories.id),
  status: varchar('status', { length: 20 }).default('draft'),
  version: integer('version').notNull().default(1),
  isTemplate: boolean('is_template').notNull().default(false),
  templateForSectorId: integer('template_for_sector_id').references(() => sectors.id),
  reviewedBy: integer('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  isEditing: boolean('is_editing').notNull().default(false),
  editingBy: integer('editing_by').references(() => users.id),
  editingExpiresAt: timestamp('editing_expires_at'),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  sectorIdx: index('idx_documents_sector').on(table.sectorId),
  statusIdx: index('idx_documents_status').on(table.status),
  categoryIdx: index('idx_documents_category').on(table.categoryId),
  templateIdx: index('idx_documents_template').on(table.isTemplate),
  authorIdx: index('idx_documents_author').on(table.authorId),
  reviewedByIdx: index('idx_documents_reviewed_by').on(table.reviewedBy),
  editingByIdx: index('idx_documents_editing_by').on(table.editingBy),
  templateSectorIdx: index('idx_documents_template_sector').on(table.templateForSectorId),
}))

export const documentVersions = pgTable('document_versions', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id').references(() => documents.id).notNull(),
  version: integer('version').notNull(),
  contentJson: jsonb('content_json').notNull(),
  authorId: integer('author_id').references(() => users.id).notNull(),
  changeDescription: varchar('change_description', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  versionDocIdx: index('idx_versions_document').on(table.documentId),
}))

export const documentComments = pgTable('document_comments', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id').references(() => documents.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  resolved: boolean('resolved').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  docCommentIdx: index('idx_comment_document').on(table.documentId),
}))

export const documentChunks = pgTable('document_chunks', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id').references(() => documents.id).notNull(),
  chunkIndex: integer('chunk_index').notNull(),
  chunkText: text('chunk_text').notNull(),
  embedding: jsonb('embedding'),
}, (table) => ({
  docIdx: index('idx_chunks_document').on(table.documentId),
}))

export const trainingProgress = pgTable('training_progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  documentId: integer('document_id').references(() => documents.id).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('in_progress'),
  score: integer('score').default(0),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userDocUnique: uniqueIndex('idx_training_user_doc').on(table.userId, table.documentId),
}))

export const trainingAssignments = pgTable('training_assignments', {
  id: serial('id').primaryKey(),
  adminId: integer('admin_id').references(() => users.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  documentId: integer('document_id').references(() => documents.id).notNull(),
  dueDate: timestamp('due_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  assignUnique: uniqueIndex('idx_assign_user_doc').on(table.userId, table.documentId),
}))

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  message: text('message').notNull(),
  link: varchar('link', { length: 500 }),
  read: boolean('read').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  notifUserReadIdx: index('idx_notif_user_read').on(table.userId, table.read),
}))

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  action: varchar('action', { length: 50 }).notNull(),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: integer('entity_id'),
  details: jsonb('details'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  logUserIdx: index('idx_log_user').on(table.userId),
  logEntityIdx: index('idx_log_entity').on(table.entityType, table.entityId),
  logCreatedAtIdx: index('idx_log_created').on(table.createdAt),
}))

export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const refreshTokens = pgTable('refresh_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  revokedAt: timestamp('revoked_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  refreshTokenIdx: index('idx_refresh_token').on(table.token),
  refreshUserIdx: index('idx_refresh_user').on(table.userId),
}))

export const systemConfigs = pgTable('system_configs', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: text('value'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
