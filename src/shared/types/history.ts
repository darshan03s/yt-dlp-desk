import { Source } from '@/shared/types';
import { DownloadStatus } from './download';

export type UrlHistoryItem = {
  id: string;
  title: string;
  url: string;
  source: Source;
  thumbnail: string;
  thumbnail_local: string;
  uploader: string;
  uploader_url: string;
  created_at: string;
  duration: string;
  added_at: string;
};

export type UrlHistoryList = UrlHistoryItem[] | undefined;

export type DownloadHistoryItem = {
  id: string;
  title: string;
  url: string;
  source: Source;
  thumbnail: string;
  thumbnail_local: string;
  uploader: string;
  uploader_url: string;
  start_time: string;
  end_time: string;
  duration: string;
  format: string;
  command: string;
  complete_output: string;
  download_progress: number;
  download_progress_string: string;
  download_completed_at: string;
  download_status: DownloadStatus;
  added_at: string;
};

export type DownloadHistoryList = DownloadHistoryItem[] | undefined;

export type RunningDownloadItem = {
  id: string;
  title: string;
  url: string;
  source: Source;
  thumbnail: string;
  thumbnail_local: string;
  uploader: string;
  uploader_url: string;
  start_time: string;
  end_time: string;
  duration: string;
  format: string;
  command: string;
  complete_output: string;
  download_progress: number;
  download_progress_string: string;
  download_completed_at: string;
  download_status: DownloadStatus;
  added_at?: string | undefined;
};

export type RunningDownloadsList = RunningDownloadItem[] | undefined;

export type ExtraCommandsHistoryItem = {
  id: string;
  command: string;
  created_at: string;
};

export type ExtraCommandsHistoryList = ExtraCommandsHistoryItem[] | undefined;
