import { db } from '@main/db';
import { urlHistory } from '@main/db/schema';
import { NewUrlHistoryItem, UrlHistoryItem } from '@main/types/db';
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

  deleteAll: async () => {
    return db?.delete(urlHistory);
  },

  updateById: async (id: string, data: Omit<UrlHistoryItem, 'id' | 'addedAt'>) => {
    return db?.update(urlHistory).set(data).where(eq(urlHistory.id, id));
  },

  updateByUrl: async (url: string, data: Omit<UrlHistoryItem, 'id' | 'addedAt'>) => {
    return db?.update(urlHistory).set(data).where(eq(urlHistory.url, url));
  },

  addNew: async (data: Omit<UrlHistoryItem, 'id' | 'addedAt'>) => {
    const completeData: NewUrlHistoryItem = {
      ...data,
      id: randomUUID(),
      addedAt: new Date().toISOString()
    };
    return db?.insert(urlHistory).values(completeData);
  },
  upsertByUrl: async (url: string, data: Omit<UrlHistoryItem, 'id' | 'addedAt'>) => {
    const existing = await db?.select().from(urlHistory).where(eq(urlHistory.url, url));

    if (existing && existing.length > 0) {
      await db?.delete(urlHistory).where(eq(urlHistory.url, url));
    }

    return urlHistoryOperations.addNew(data);
  }
};
