import { allowedSources } from '../data';
import { DownloadOptions } from './download';
import { DownloadsHistoryList, RunningDownloadsList, UrlHistoryList } from './history';

export type AppSettings = {
  appVersion: string;
  ytdlpPath: string;
  ytdlpVersion: string;
  ffmpegPath: string;
  ffmpegVersion: string;
  platform: typeof process.platform | string;
  mediaDataFolder: string;
  downloadsFolder: string;
  userDownloadsFolder: string;
  defaultFormat: string;
  jsRuntimePath: string;
  downloadTemplate: string;
};

export type Source = (typeof allowedSources)[number];

export type Api = {
  rendererInit: () => Promise<AppSettings | null>;
  confirmYtdlp: () => Promise<{
    ytdlpPathInPc: string | null;
    ytdlpVersionInPc: string | null;
  }>;
  confirmFfmpeg: () => Promise<{
    ffmpegPathInPc: string | null;
    ffmpegVersionInPc: string | null;
  }>;
  downloadYtdlp: () => Promise<{
    ytdlpPathInPc: string | null;
    ytdlpVersionInPc: string | null;
  }>;
  downloadFfmpeg: () => Promise<{
    ffmpegPathInPc: string | null;
    ffmpegVersionInPc: string | null;
  }>;
  checkUrl: (url: string) => Promise<{
    source: Source | string;
    url: string;
    isMediaDisplayAvailable: boolean;
  }>;
  getYoutubeVideoInfoJson: (url: string, updateUrlHistory: boolean) => void;
  getUrlHistory: () => Promise<UrlHistoryList>;
  deleteFromUrlHistory: (id: string) => Promise<void>;
  deleteFromDownloadsHistory: (id: string) => Promise<void>;
  deleteAllUrlHistory: () => Promise<void>;
  deleteAllDownloadsHistory: () => Promise<void>;
  download: (downloadOptions: DownloadOptions) => void;
  on: (channel: string, listener: (...args: unknown[]) => void) => () => Electron.IpcRenderer;
  off: (channel: string, listener: (...args: unknown[]) => void) => void;
  getRunningDownloads: () => Promise<RunningDownloadsList>;
  getDownloadsHistory: () => Promise<DownloadsHistoryList>;
  selectFolder: () => Promise<string | null>;
};
