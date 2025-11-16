import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { DB_PATH, MIGRATIONS_FOLDER } from '..';
import * as schema from './schema';

export let db: ReturnType<typeof drizzle> | null = null;

export function initDatabase() {
  const sqlite = new Database(DB_PATH);
  sqlite.pragma('journal_mode = WAL');

  db = drizzle(sqlite, { schema });
}

export function runMigrations() {
  try {
    if (!db) {
      throw new Error('DB not initialized');
    }
    migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error(String(error));
    }
  }
}

export { schema };
