import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import logger from '@shared/logger';
import { type Api } from '@shared/types';
import { DownloadOptions } from '@shared/types/download';

// Custom APIs for renderer
const api: Api = {
  rendererInit: () => ipcRenderer.invoke('renderer:init'),
  confirmYtdlp: () => ipcRenderer.invoke('yt-dlp:confirm'),
  confirmFfmpeg: () => ipcRenderer.invoke('ffmpeg:confirm'),
  downloadYtdlp: () => ipcRenderer.invoke('yt-dlp:download'),
  downloadFfmpeg: () => ipcRenderer.invoke('ffmpeg:download'),
  checkUrl: (url: string) => ipcRenderer.invoke('check-url', url),
  getYoutubeVideoInfoJson: (url: string, updateUrlHistory: boolean) =>
    ipcRenderer.send('yt-dlp:get-youtube-video-info-json', url, updateUrlHistory),
  getUrlHistory: () => ipcRenderer.invoke('url-history:get-all'),
  deleteFromUrlHistory: (id: string) => ipcRenderer.invoke('url-history:delete-one', id),
  deleteFromDownloadsHistory: (id: string) =>
    ipcRenderer.invoke('downloads-history:delete-one', id),
  deleteAllUrlHistory: () => ipcRenderer.invoke('url-history:delete-all'),
  deleteAllDownloadsHistory: () => ipcRenderer.invoke('downloads-history:delete-all'),
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
  getDownloadsHistory: () => ipcRenderer.invoke('downloads-history:get-all'),
  selectFolder: () => ipcRenderer.invoke('select-folder')
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
