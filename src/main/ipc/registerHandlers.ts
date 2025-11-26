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
  getYoutubeVideoInfoJson,
  rendererInit,
  downloadMedia,
  getRunningDownloads,
  getDownloadsHistory,
  selectFolder,
  deleteOneFromDownloadsHistory,
  deleteAllFromDownloadsHistory
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

  ipcMain.on('yt-dlp:get-youtube-video-info-json', getYoutubeVideoInfoJson);

  ipcMain.handle('url-history:get-all', getUrlHistory);

  ipcMain.handle('url-history:delete-one', deleteOneFromUrlHistory);

  ipcMain.handle('downloads-history:delete-one', deleteOneFromDownloadsHistory);

  ipcMain.handle('url-history:delete-all', deleteAllFromUrlHistory);

  ipcMain.handle('downloads-history:delete-all', deleteAllFromDownloadsHistory);

  ipcMain.on('download', downloadMedia);

  ipcMain.handle('running-downloads:get-all', getRunningDownloads);

  ipcMain.handle('downloads-history:get-all', getDownloadsHistory);

  ipcMain.handle('select-folder', selectFolder);
}

export default registerHanlders;
