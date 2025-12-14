import { Source } from '.';
import { MediaFormat, MediaInfoJson } from './info-json';

export type DownloadStatus = 'downloading' | 'completed' | 'failed' | 'paused' | 'waiting';

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
  selectedFormat: Partial<MediaFormat>;
  downloadSections: DownloadSections;
  selectedDownloadFolder: string;
  extraOptions: ExtraOptions;
  url: string;
  source: Source;
  mediaInfo: MediaInfoJson;
};

export type ProgressDetails = {
  progressString: string;
  progressPercentage?: number;
};
