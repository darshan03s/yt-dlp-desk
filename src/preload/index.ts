import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import logger from '@shared/logger';
import { AppSettingsChange, Source, type Api } from '@shared/types';
import { DownloadOptions } from '@shared/types/download';

// Custom APIs for renderer
const api: Api = {
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
  getDownloadHistory: () => ipcRenderer.invoke('download-history:get-all'),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  saveSettings: (changedSettings: AppSettingsChange) =>
    ipcRenderer.send('settings:save', changedSettings),
  urlHistorySearch: (searchInput: string) => ipcRenderer.invoke('url-history:search', searchInput),
  downloadHistorySearch: (searchInput: string) =>
    ipcRenderer.invoke('download-history:search', searchInput),
  pauseDownload: (id: string) => ipcRenderer.send('yt-dlp:pause-download', id),
  resumeDownload: (id: string) => ipcRenderer.send('yt-dlp:resume-download', id),
  pauseAllDownloads: () => ipcRenderer.send('yt-dlp:pause-all-downloads'),
  playMedia: (filePath: string) => ipcRenderer.send('play-media', filePath),
  showInFolder: (filePath: string) => ipcRenderer.send('show-in-folder', filePath),
  selectFile: () => ipcRenderer.invoke('select-file')
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
