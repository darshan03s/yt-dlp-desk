import { type ReleaseChannel, type SupportedCookieBrowser } from 'yt-dlp-command-builder';
import { allowedSources } from '../data';
import { DownloadOptions } from './download';
import { DownloadHistoryList, RunningDownloadsList, UrlHistoryList } from './history';

export type AppSettings = {
  appVersion: string;
  ytdlpPath: string;
  ytdlpVersion: string;
  ffmpegPath: string;
  ffmpegVersion: string;
  platform: typeof process.platform;
  mediaDataFolder: string;
  downloadsFolder: string;
  userDownloadsFolder: string;
  jsRuntimePath: string;
  downloadTemplate: string;
  rememberPreviousDownloadsFolder: boolean;
  cookiesFilePath: string;
  maxConcurrentDownloads: number;
  cookiesBrowser: SupportedCookieBrowser | string;
  cookiesBrowserProfile: string;
};

export type AppSettingsChange = Pick<
  AppSettings,
  | 'downloadsFolder'
  | 'rememberPreviousDownloadsFolder'
  | 'cookiesFilePath'
  | 'maxConcurrentDownloads'
  | 'cookiesBrowser'
  | 'cookiesBrowserProfile'
>;

export type Source = (typeof allowedSources)[number];

export type YtdlpVersions = {
  [K in ReleaseChannel]: string[];
};

export type Api = {
  minimize: () => void;
  close: () => void;
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
  getMediaInfoJson: (
    url: string,
    source: Source,
    updateUrlHistory: boolean,
    refetch?: boolean
  ) => void;
  getUrlHistory: () => Promise<UrlHistoryList>;
  deleteFromUrlHistory: (id: string) => Promise<void>;
  deleteFromDownloadHistory: (id: string) => Promise<void>;
  deleteAllUrlHistory: () => Promise<void>;
  deleteAllDownloadHistory: () => Promise<void>;
  download: (downloadOptions: DownloadOptions) => void;
  on: (channel: string, listener: (...args: unknown[]) => void) => () => Electron.IpcRenderer;
  off: (channel: string, listener: (...args: unknown[]) => void) => void;
  getRunningDownloads: () => Promise<RunningDownloadsList>;
  getQueuedDownloads: () => Promise<RunningDownloadsList>;
  getDownloadHistory: () => Promise<DownloadHistoryList>;
  selectFolder: () => Promise<string | null>;
  saveSettings: (changedSettings: AppSettingsChange) => void;
  urlHistorySearch: (searchInput: string) => Promise<UrlHistoryList>;
  downloadHistorySearch: (searchInput: string) => Promise<DownloadHistoryList>;
  pauseRunningDownload: (id: string) => void;
  pauseWaitingDownload: (id: string) => void;
  pauseWaitingDownloads: () => void;
  resumePausedDownload: (id: string) => void;
  pauseAllDownloads: () => void;
  resumePausedDownloads: () => void;
  retryFailedDownloads: () => void;
  playMedia: (filePath: string) => void;
  showInFolder: (filePath: string) => void;
  selectFile: () => Promise<string | null>;
  retryFailedDownload: (id: string) => void;
  deleteAllMetadata: () => void;
  getBrowserProfiles: (browser: SupportedCookieBrowser) => Promise<string[]>;
  getYtdlpVersions: () => Promise<YtdlpVersions>;
  updateYtdlp: (channel: ReleaseChannel, version: string) => void;
};
