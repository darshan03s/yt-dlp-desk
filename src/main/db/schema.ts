import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const downloadStatusEnum = ['pending', 'downloading', 'completed', 'failed'] as const;

export const urlHistory = sqliteTable('url_history', {
  id: text('id').primaryKey().notNull(),
  url: text('url').notNull(),
  source: text('source').notNull(),
  thumbnail: text('thumbnail').notNull(),
  thumbnail_local: text('thumbnail_local').notNull(),
  uploader: text('uploader').notNull(),
  uploader_url: text('uploader_url').notNull(),
  created_at: text('created_at').notNull(),
  duration: text('duration'),
  title: text('title').notNull(),
  added_at: text('added_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull()
});

export const downloadsHistory = sqliteTable('downloads_history', {
  id: text('id').primaryKey().notNull(),
  thumbnail: text('thumbnail').notNull(),
  title: text('title').notNull(),
  format: text('format').notNull(),
  download_progress: text('download_progress').notNull(),
  download_progress_string: text('download_progress_string').notNull(),
  downloaded_at: text('downloaded_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  download_status: text('download_status', {
    enum: downloadStatusEnum
  }).notNull(),
  command: text('command').notNull()
});

export const extraCommandsHistory = sqliteTable('extra_commands_history', {
  id: text('id').primaryKey().notNull(),
  command: text('command').notNull(),
  created_at: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull()
});
