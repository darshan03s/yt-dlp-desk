import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import logger from '@shared/logger';
import { AppSettingsChange, Source, type Api } from '@shared/types';
import { DownloadOptions } from '@shared/types/download';
import { ReleaseChannel, SupportedCookieBrowser } from 'yt-dlp-command-builder';

// Custom APIs for renderer
const api: Api = {
  minimize: () => ipcRenderer.send('win:min'),
  close: () => ipcRenderer.send('win:close'),
  rendererInit: () => ipcRenderer.invoke('renderer:init'),
  confirmYtdlp: () => ipcRenderer.invoke('yt-dlp:confirm'),
  confirmFfmpeg: () => ipcRenderer.invoke('ffmpeg:confirm'),
  downloadYtdlp: () => ipcRenderer.invoke('yt-dlp:download'),
  downloadFfmpeg: () => ipcRenderer.invoke('ffmpeg:download'),
  checkUrl: (url: string) => ipcRenderer.invoke('check-url', url),
  getMediaInfoJson: (url: string, source: Source, updateUrlHistory: boolean, refetch?: boolean) =>
    ipcRenderer.send('yt-dlp:get-media-info-json', url, source, updateUrlHistory, refetch),
  getUrlHistory: () => ipcRenderer.invoke('url-history:get-all'),
  deleteFromUrlHistory: (id: string) => ipcRenderer.invoke('url-history:delete-one', id),
  deleteFromDownloadHistory: (id: string) => ipcRenderer.invoke('download-history:delete-one', id),
  deleteAllUrlHistory: () => ipcRenderer.invoke('url-history:delete-all'),
  deleteAllDownloadHistory: () => ipcRenderer.invoke('download-history:delete-all'),
  download: (downloadOptions: DownloadOptions) => ipcRenderer.send('download', downloadOptions),
  on: (channel: string, listener: (...args: unknown[]) => void) => {
    const wrapped = (_: unknown, ...args: unknown[]) => listener(...args);
    ipcRenderer.on(channel, wrapped);
    return () => ipcRenderer.removeListener(channel, wrapped);
  },
  off: (channel: string, listener: (...args: unknown[]) => void) => {
    ipcRenderer.removeListener(channel, listener);
  },
  getRunningDownloads: () => ipcRenderer.invoke('running-downloads:get-all'),
  getQueuedDownloads: () => ipcRenderer.invoke('queued-downloads:get-all'),
  getDownloadHistory: () => ipcRenderer.invoke('download-history:get-all'),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  saveSettings: (changedSettings: AppSettingsChange) =>
    ipcRenderer.send('settings:save', changedSettings),
  urlHistorySearch: (searchInput: string) => ipcRenderer.invoke('url-history:search', searchInput),
  downloadHistorySearch: (searchInput: string) =>
    ipcRenderer.invoke('download-history:search', searchInput),
  pauseRunningDownload: (id: string) => ipcRenderer.send('app:pause-running-download', id),
  pauseWaitingDownload: (id: string) => ipcRenderer.send('app:pause-waiting-download', id),
  resumePausedDownload: (id: string) => ipcRenderer.send('app:resume-paused-download', id),
  pauseAllDownloads: () => ipcRenderer.send('app:pause-all-downloads'),
  pauseWaitingDownloads: () => ipcRenderer.send('app:pause-waiting-downloads'),
  resumePausedDownloads: () => ipcRenderer.send('app:resume-paused-downloads'),
  retryFailedDownloads: () => ipcRenderer.send('app:retry-failed-downloads'),
  playMedia: (filePath: string) => ipcRenderer.send('play-media', filePath),
  showInFolder: (filePath: string) => ipcRenderer.send('show-in-folder', filePath),
  selectFile: () => ipcRenderer.invoke('select-file'),
  retryFailedDownload: (id: string) => ipcRenderer.send('app:retry-download', id),
  deleteAllMetadata: () => ipcRenderer.send('app:delete-all-metadata'),
  getBrowserProfiles: (browser: SupportedCookieBrowser) =>
    ipcRenderer.invoke('get-browser-profiles', browser),
  getYtdlpVersions: () => ipcRenderer.invoke('yt-dlp:get-versions'),
  updateYtdlp: (channel: ReleaseChannel, version: string) =>
    ipcRenderer.send('yt-dlp:update', channel, version)
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    logger.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
