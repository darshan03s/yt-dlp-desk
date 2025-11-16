import { eq, desc, asc } from 'drizzle-orm';
import { db } from '../db';
import { urlHistory } from '../db/schema';
import type { NewUrlHistoryItem, UrlHistoryItem } from '../types/db';
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
    return db?.select().from(urlHistory).orderBy(desc(urlHistory.addedAt));
  },

  getAllByAddedAtAsc: async () => {
    return db?.select().from(urlHistory).orderBy(asc(urlHistory.addedAt));
  },

  deleteById: async (id: string) => {
    return db?.delete(urlHistory).where(eq(urlHistory.id, id));
  },

  deleteByUrl: async (url: string) => {
    return db?.delete(urlHistory).where(eq(urlHistory.url, url));
  },

  updateById: async (
    id: string,
    data: Pick<UrlHistoryItem, 'thumbnail' | 'title' | 'url' | 'source'>
  ) => {
    return db?.update(urlHistory).set(data).where(eq(urlHistory.id, id));
  },

  updateByUrl: async (
    url: string,
    data: Pick<UrlHistoryItem, 'thumbnail' | 'title' | 'url' | 'source'>
  ) => {
    return db?.update(urlHistory).set(data).where(eq(urlHistory.url, url));
  },

  addNew: async (data: Pick<UrlHistoryItem, 'thumbnail' | 'title' | 'url' | 'source'>) => {
    const completeData: NewUrlHistoryItem = {
      ...data,
      id: randomUUID()
    };
    return db?.insert(urlHistory).values(completeData);
  },
  upsertByUrl: async (
    url: string,
    data: Pick<UrlHistoryItem, 'thumbnail' | 'title' | 'url' | 'source'>
  ) => {
    const existing = await db?.select().from(urlHistory).where(eq(urlHistory.url, url));

    if (existing && existing.length > 0) {
      await db?.delete(urlHistory).where(eq(urlHistory.url, url));
    }

    return urlHistoryOperations.addNew(data);
  }
};
