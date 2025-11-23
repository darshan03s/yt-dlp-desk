import { Source } from '@/shared/types';

export type UrlHistoryItem = {
  id: string;
  url: string;
  source: Source;
  thumbnail: string;
  thumbnail_local: string;
  uploader: string;
  uploader_url: string;
  created_at: string;
  duration: string;
  title: string;
  added_at: string;
};

export type UrlHistoryList = UrlHistoryItem[] | undefined;

export type DownloadsHistoryItem = {
  id: string;
  thumbnail: string;
  title: string;
  format: string;
  downloadProgress: string;
  downloadProgressString: string;
  downloadedAt: string;
  downloadStatus: 'pending' | 'downloading' | 'completed' | 'failed';
  command: string;
};

export type DownloadsHistoryList = DownloadsHistoryItem[] | undefined;

export type ExtraCommandsHistoryItem = {
  id: string;
  command: string;
  createdAt: string;
};

export type ExtraCommandsHistoryList = ExtraCommandsHistoryItem[] | undefined;
