import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import logger from '@shared/logger';
import { type Api } from '@shared/types';

// Custom APIs for renderer
const api: Api = {
  rendererInit: () => ipcRenderer.invoke('renderer:init'),
  confirmYtdlp: () => ipcRenderer.invoke('yt-dlp:confirm'),
  confirmFfmpeg: () => ipcRenderer.invoke('ffmpeg:confirm'),
  downloadYtdlp: () => ipcRenderer.invoke('yt-dlp:download'),
  downloadFfmpeg: () => ipcRenderer.invoke('ffmpeg:download'),
  checkUrl: (url: string) => ipcRenderer.invoke('check-url', url),
  getYoutubeVideoInfoJson: (url: string, updateUrlHistory: boolean) =>
    ipcRenderer.invoke('yt-dlp:get-youtube-video-info-json', url, updateUrlHistory),
  getUrlHistory: () => ipcRenderer.invoke('url-history:get-all')
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
