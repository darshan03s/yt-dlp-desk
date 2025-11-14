import { ipcMain } from 'electron';
import { getStoreManager } from './store';
import logger from '../shared/logger';
import {
  getFfmpegFromPc,
  getFfmpegVersionFromPc,
  getNormalizedUrl,
  getSettings,
  getSourceFromUrl,
  getYtdlpFromPc,
  getYtdlpVersionFromPc
} from './utils/appUtils';
import { DATA_DIR, FFMPEG_FOLDER_PATH, mainWindow, YTDLP_EXE_PATH, YTDLP_FOLDER_PATH } from '.';
import { copyFileToFolder, copyFolder } from './utils/fsUtils';
import path from 'node:path';
import { downloadYtDlpLatestRelease } from './utils/downloadYtdlp';
import { downloadFfmpeg } from './utils/downloadFfmpeg';
import SevenZip from '7zip-min';
import { type Api } from '../shared/types';
import { allowedSources } from './data';

export async function addListeners() {
  ipcMain.on('win:min', () => mainWindow.minimize());
  ipcMain.on('win:close', () => mainWindow.close());

  const store = await getStoreManager();

  ipcMain.handle('renderer:init', async () => {
    try {
      logger.info('Renderer initialized');

      const settings = await getSettings();

      return settings;
    } catch (err) {
      logger.error('Failed to initialize renderer:', err);
      return { ytdlpPath: null, ytdlpVersion: null, ffmpegPath: null, ffmpegVersion: null };
    }
  });

  ipcMain.handle('yt-dlp:confirm', async () => {
    try {
      logger.info('Checking yt-dlp in PC...');

      const { ytdlpVersionInPc, ytdlpPathInPc } = await getYtdlpFromPc();

      if (ytdlpPathInPc) {
        await copyFileToFolder(ytdlpPathInPc, YTDLP_FOLDER_PATH);
        store.set('settings.ytdlpPath', YTDLP_EXE_PATH);
        store.set('settings.ytdlpVersion', ytdlpVersionInPc);
      }

      logger.info(`yt-dlp path in PC: ${ytdlpPathInPc}`);
      logger.info(`yt-dlp version in PC: ${ytdlpVersionInPc}`);

      return { ytdlpVersionInPc, ytdlpPathInPc };
    } catch (err) {
      logger.error(err);
      return { ytdlpPathInPc: null, ytdlpVersionInPc: null };
    }
  });

  ipcMain.handle('ffmpeg:confirm', async () => {
    try {
      logger.info('Checking ffmpeg in PC...');

      const { ffmpegVersionInPc, ffmpegPathInPc } = await getFfmpegFromPc();

      if (ffmpegPathInPc) {
        const ffmpegFolderInPc = path.dirname(ffmpegPathInPc);
        copyFolder(ffmpegFolderInPc, FFMPEG_FOLDER_PATH);
        store.set('settings.ffmpegPath', FFMPEG_FOLDER_PATH);
        store.set('settings.ffmpegVersion', ffmpegVersionInPc);
      }

      logger.info(`ffmpeg path in PC: ${ffmpegPathInPc}`);
      logger.info(`ffmpeg version in PC: ${ffmpegVersionInPc}`);

      return { ffmpegVersionInPc, ffmpegPathInPc };
    } catch (err) {
      logger.error(err);
      return { ffmpegPathInPc: null, ffmpegVersionInPc: null };
    }
  });

  ipcMain.handle('yt-dlp:download', async () => {
    try {
      logger.info('Downloading yt-dlp...');

      const outputPath = await downloadYtDlpLatestRelease(YTDLP_FOLDER_PATH);
      logger.info('Downloaded yt-dlp latest release');

      const ytdlpVersionInPc = await getYtdlpVersionFromPc(outputPath);

      store.set('settings.ytdlpPath', outputPath);
      store.set('settings.ytdlpVersion', ytdlpVersionInPc);

      logger.info(`yt-dlp downloaded: ${outputPath}`);
      logger.info(`yt-dlp downloaded version: ${ytdlpVersionInPc}`);

      return { ytdlpVersionInPc, ytdlpPathInPc: outputPath };
    } catch (err) {
      logger.error('Failed to download yt-dlp:', err);
      return { ytdlpVersionInPc: null, ytdlpPathInPc: null };
    }
  });

  ipcMain.handle('ffmpeg:download', async () => {
    try {
      logger.info('Downloading ffmpeg...');

      const output7zPath = await downloadFfmpeg(DATA_DIR);
      logger.info('Downloaded ffmpeg');

      await SevenZip.unpack(output7zPath, DATA_DIR);

      const ffmpegExePath = path.join(DATA_DIR, 'ffmpeg-8.0-full_build', 'bin', 'ffmpeg.exe');
      const ffmpegBinPath = path.join(DATA_DIR, 'ffmpeg-8.0-full_build', 'bin');

      const ffmpegVersionInPc = await getFfmpegVersionFromPc(ffmpegExePath);

      store.set('settings.ffmpegPath', ffmpegBinPath);
      store.set('settings.ffmpegVersion', ffmpegVersionInPc);

      logger.info(`ffmpeg downloaded: ${ffmpegBinPath}`);
      logger.info(`ffmpeg downloaded version: ${ffmpegVersionInPc}`);

      return { ffmpegVersionInPc, ffmpegPathInPc: ffmpegBinPath };
    } catch (err) {
      logger.error('Failed to download yt-dlp:', err);
      return { ytdlpVersionInPc: null, ytdlpPathInPc: null };
    }
  });

  ipcMain.handle('check-url', async (_event, url): ReturnType<Api['checkUrl']> => {
    const source = getSourceFromUrl(url);
    if (!source) {
      return { source: source, url: url, isMediaDisplayAvailable: false };
    }
    if (allowedSources.includes(source)) {
      const normalizedUrl = getNormalizedUrl(source, url);
      return { source: source, url: normalizedUrl, isMediaDisplayAvailable: true };
    }
    return { source: source, url: url, isMediaDisplayAvailable: false };
  });
}
