import { allowedSources } from '../data';
import { UrlHistoryList } from './history';
import { YoutubeVideoInfoJson } from './info-json/youtube-video';

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
  jsRuntime: string;
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
  getYoutubeVideoInfoJson: (
    url: string,
    updateUrlHistory: boolean
  ) => Promise<YoutubeVideoInfoJson | null>;
  getUrlHistory: () => Promise<UrlHistoryList>;
  deleteFromUrlHistory: (id: string) => Promise<void>;
  deleteAllUrlHistory: () => Promise<void>;
};
