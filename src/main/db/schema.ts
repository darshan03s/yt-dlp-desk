import { real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const downloadStatusEnum = ['downloading', 'completed', 'failed'] as const;

export const urlHistory = sqliteTable('url_history', {
  id: text('id').primaryKey().notNull(),
  title: text('title').notNull(),
  url: text('url').notNull(),
  source: text('source').notNull(),
  thumbnail: text('thumbnail').notNull(),
  thumbnail_local: text('thumbnail_local').notNull(),
  uploader: text('uploader').notNull(),
  uploader_url: text('uploader_url').notNull(),
  duration: text('duration'),
  created_at: text('created_at').notNull(),
  added_at: text('added_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull()
});

export const downloadsHistory = sqliteTable('downloads_history', {
  id: text('id').primaryKey().notNull(),
  title: text('title').notNull(),
  url: text('url').notNull(),
  source: text('source').notNull(),
  thumbnail: text('thumbnail').notNull(),
  thumbnail_local: text('thumbnail_local').notNull(),
  uploader: text('uploader').notNull(),
  uploader_url: text('uploader_url').notNull(),
  start_time: text('start_time').notNull(),
  end_time: text('end_time').notNull(),
  duration: text('duration').notNull(),
  format: text('format').notNull(),
  command: text('command').notNull(),
  complete_output: text('complete_output').notNull(),
  download_path: text('download_path').notNull(),
  download_progress: real('download_progress').notNull(),
  download_progress_string: text('download_progress_string').notNull(),
  added_at: text('added_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  download_completed_at: text('download_completed_at').notNull(),
  download_status: text('download_status', {
    enum: downloadStatusEnum
  }).notNull()
});

export const extraCommandsHistory = sqliteTable('extra_commands_history', {
  id: text('id').primaryKey().notNull(),
  command: text('command').notNull(),
  created_at: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull()
});
