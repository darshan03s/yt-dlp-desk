import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const downloadStatusEnum = ['pending', 'downloading', 'completed', 'failed'] as const;

export const urlHistory = sqliteTable('url_history', {
  id: text('id').primaryKey().notNull(),
  url: text('url').notNull(),
  source: text('source').notNull(),
  thumbnail: text('thumbnail').notNull(),
  title: text('title').notNull(),
  addedAt: text('added_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull()
});

export const downloadsHistory = sqliteTable('downloads_history', {
  id: text('id').primaryKey().notNull(),
  thumbnail: text('thumbnail').notNull(),
  title: text('title').notNull(),
  format: text('format').notNull(),
  downloadProgress: text('download_progress').notNull(),
  downloadProgressString: text('download_progress_string').notNull(),
  downloadedAt: text('downloaded_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  downloadStatus: text('download_status', {
    enum: downloadStatusEnum
  }).notNull(),
  command: text('command').notNull()
});

export const extraCommandsHistory = sqliteTable('extra_commands_history', {
  id: text('id').primaryKey().notNull(),
  command: text('command').notNull(),
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull()
});
