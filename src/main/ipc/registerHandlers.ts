import { ipcMain } from 'electron';
import {
  checkUrl,
  confirmFfmpeg,
  confirmYtdlp,
  deleteOneFromUrlHistory,
  deleteAllFromUrlHistory,
  downloadFfmpeg,
  downloadYtdlp,
  getUrlHistory,
  getMediaInfoJson,
  rendererInit,
  downloadMedia,
  getRunningDownloads,
  selectFolder,
  saveSettings,
  urlHistorySearch,
  downloadHistorySearch,
  deleteOneFromDownloadHistory,
  deleteAllFromDownloadHistory,
  getDownloadHistory,
  pauseDownload,
  resumeDownload,
  pauseAllDownloads,
  play
} from './handlers';
import { mainWindow } from '..';

async function registerHanlders() {
  ipcMain.on('win:min', () => mainWindow.minimize());
  ipcMain.on('win:close', () => mainWindow.close());

  ipcMain.handle('renderer:init', rendererInit);

  ipcMain.handle('yt-dlp:confirm', confirmYtdlp);

  ipcMain.handle('ffmpeg:confirm', confirmFfmpeg);

  ipcMain.handle('yt-dlp:download', downloadYtdlp);

  ipcMain.handle('ffmpeg:download', downloadFfmpeg);

  ipcMain.handle('check-url', checkUrl);

  ipcMain.on('yt-dlp:get-media-info-json', getMediaInfoJson);

  ipcMain.handle('url-history:get-all', getUrlHistory);

  ipcMain.handle('url-history:delete-one', deleteOneFromUrlHistory);

  ipcMain.handle('download-history:delete-one', deleteOneFromDownloadHistory);

  ipcMain.handle('url-history:delete-all', deleteAllFromUrlHistory);

  ipcMain.handle('download-history:delete-all', deleteAllFromDownloadHistory);

  ipcMain.on('download', downloadMedia);

  ipcMain.handle('running-downloads:get-all', getRunningDownloads);

  ipcMain.handle('download-history:get-all', getDownloadHistory);

  ipcMain.handle('select-folder', selectFolder);

  ipcMain.on('settings:save', saveSettings);

  ipcMain.handle('url-history:search', urlHistorySearch);

  ipcMain.handle('download-history:search', downloadHistorySearch);

  ipcMain.on('yt-dlp:pause-download', pauseDownload);

  ipcMain.on('yt-dlp:resume-download', resumeDownload);

  ipcMain.on('yt-dlp:pause-all-downloads', pauseAllDownloads);

  ipcMain.on('play', play);
}

export default registerHanlders;
