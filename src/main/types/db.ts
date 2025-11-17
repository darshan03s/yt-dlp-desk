import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { downloadsHistory, extraCommandsHistory, urlHistory } from '@main/db/schema';

export type UrlHistoryItem = InferSelectModel<typeof urlHistory>;
export type NewUrlHistoryItem = InferInsertModel<typeof urlHistory>;
export type UrlHistory = UrlHistoryItem[];

export type DownloadsHistoryItem = InferSelectModel<typeof downloadsHistory>;
export type NewDownloadsHistoryItem = InferInsertModel<typeof downloadsHistory>;
export type DownloadsHistory = DownloadsHistoryItem[];

export type ExtraCommandsHistoryItem = InferSelectModel<typeof extraCommandsHistory>;
export type NewExtraCommandsHistoryItem = InferInsertModel<typeof extraCommandsHistory>;
export type ExtraCommandsHistory = ExtraCommandsHistoryItem[];
