import { YoutubePlaylistInfoJson } from './info-json/youtube-playlist';
import { YoutubeFormat, YoutubeVideoInfoJson } from './info-json/youtube-video';

export type DownloadStatus = 'downloading' | 'completed' | 'failed' | 'paused';

export type DownloadSections = {
  startTime: string;
  endTime: string;
  forceKeyframesAtCuts: boolean;
};

export interface ExtraOptions {
  embedThumbnail: boolean;
  embedChapters: boolean;
  embedSubs: boolean;
  embedMetadata: boolean;
  writeDescription: boolean;
  writeComments: boolean;
  writeThumbnail: boolean;
  writeSubs: boolean;
  writeAutoSubs: boolean;
  liveFromStart: boolean;
}

export type DownloadOptions = {
  downloadId: string;
  selectedFormat: Partial<YoutubeFormat>;
  downloadSections: DownloadSections;
  selectedDownloadFolder: string;
  extraOptions: ExtraOptions;
  url: string;
  source: string;
  mediaInfo: YoutubeVideoInfoJson | YoutubePlaylistInfoJson | object;
};

export type ProgressDetails = {
  progressString: string;
  progressPercentage?: number;
};
