import { db } from '@main/db';
import { downloadsHistory, urlHistory } from '@main/db/schema';
import {
  DownloadsHistoryItem,
  NewDownloadsHistoryItem,
  NewUrlHistoryItem,
  UrlHistoryItem
} from '@main/types/db';
import { eq, desc, asc } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

export const urlHistoryOperations = {
  getById: async (id: string) => {
    return db
      ?.select()
      .from(urlHistory)
      .where(eq(urlHistory.id, id))
      .then((rows) => rows[0] ?? null);
  },

  getByUrl: async (url: string) => {
    return db
      ?.select()
      .from(urlHistory)
      .where(eq(urlHistory.url, url))
      .then((rows) => rows[0] ?? null);
  },

  getAllByAddedAtDesc: async () => {
    return db?.select().from(urlHistory).orderBy(desc(urlHistory.added_at));
  },

  getAllByAddedAtAsc: async () => {
    return db?.select().from(urlHistory).orderBy(asc(urlHistory.added_at));
  },

  deleteById: async (id: string) => {
    return db?.delete(urlHistory).where(eq(urlHistory.id, id));
  },

  deleteByUrl: async (url: string) => {
    return db?.delete(urlHistory).where(eq(urlHistory.url, url));
  },

  deleteAll: async () => {
    return db?.delete(urlHistory);
  },

  updateById: async (id: string, data: Partial<Omit<UrlHistoryItem, 'id' | 'added_at'>>) => {
    return db?.update(urlHistory).set(data).where(eq(urlHistory.id, id));
  },

  updateByUrl: async (url: string, data: Partial<Omit<UrlHistoryItem, 'id' | 'added_at'>>) => {
    return db?.update(urlHistory).set(data).where(eq(urlHistory.url, url));
  },

  addNew: async (data: Omit<UrlHistoryItem, 'id' | 'added_at'>) => {
    const completeData: NewUrlHistoryItem = {
      ...data,
      id: randomUUID(),
      added_at: new Date().toISOString()
    };
    return db?.insert(urlHistory).values(completeData);
  },
  upsertByUrl: async (url: string, data: Omit<UrlHistoryItem, 'id' | 'added_at'>) => {
    const existing = await db?.select().from(urlHistory).where(eq(urlHistory.url, url));

    if (existing && existing.length > 0) {
      await db?.delete(urlHistory).where(eq(urlHistory.url, url));
    }

    return urlHistoryOperations.addNew(data);
  }
};

export const downloadsHistoryOperations = {
  getById: async (id: string) => {
    return db
      ?.select()
      .from(downloadsHistory)
      .where(eq(downloadsHistory.id, id))
      .then((rows) => rows[0] ?? null);
  },

  getByUrl: async (url: string) => {
    return db
      ?.select()
      .from(downloadsHistory)
      .where(eq(downloadsHistory.url, url))
      .then((rows) => rows[0] ?? null);
  },

  getAllByAddedAtDesc: async () => {
    return db?.select().from(downloadsHistory).orderBy(desc(downloadsHistory.added_at));
  },

  getAllByAddedAtAsc: async () => {
    return db?.select().from(downloadsHistory).orderBy(asc(downloadsHistory.added_at));
  },

  getAllByCompletedAtDesc: async () => {
    return db
      ?.select()
      .from(downloadsHistory)
      .orderBy(desc(downloadsHistory.download_completed_at));
  },

  getAllByCompletedAtAsc: async () => {
    return db?.select().from(downloadsHistory).orderBy(asc(downloadsHistory.download_completed_at));
  },

  deleteById: async (id: string) => {
    return db?.delete(downloadsHistory).where(eq(downloadsHistory.id, id));
  },

  deleteByUrl: async (url: string) => {
    return db?.delete(downloadsHistory).where(eq(downloadsHistory.url, url));
  },

  deleteAll: async () => {
    return db?.delete(downloadsHistory);
  },

  updateById: async (id: string, data: Partial<Omit<DownloadsHistoryItem, 'id' | 'added_at'>>) => {
    return db?.update(downloadsHistory).set(data).where(eq(downloadsHistory.id, id));
  },

  updateByUrl: async (
    url: string,
    data: Partial<Omit<DownloadsHistoryItem, 'id' | 'added_at'>>
  ) => {
    return db?.update(downloadsHistory).set(data).where(eq(downloadsHistory.url, url));
  },

  addNew: async (data: NewDownloadsHistoryItem) => {
    return db?.insert(downloadsHistory).values(data);
  }
};
