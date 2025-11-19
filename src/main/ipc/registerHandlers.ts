import { ipcMain } from 'electron';
import {
  checkUrl,
  confirmFfmpeg,
  confirmYtdlp,
  downloadFfmpeg,
  downloadYtdlp,
  getUrlHistory,
  getYoutubeVideoInfoJson,
  rendererInit
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

  ipcMain.handle('yt-dlp:get-youtube-video-info-json', getYoutubeVideoInfoJson);

  ipcMain.handle('url-history:get-all', getUrlHistory);
}

export default registerHanlders;
