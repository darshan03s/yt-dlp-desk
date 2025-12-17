import pkg from '../../package.json';
import { app } from 'electron';
import { MEDIA_DATA_FOLDER_PATH } from '.';
import { AppSettings } from '@shared/types';
import { DEFAULT_MAX_CONCURRENT_DOWNLOADS } from '@shared/data';

export function getDefaultAppSettings(): AppSettings {
  return {
    appVersion: pkg.version,
    downloadsFolder: app.getPath('downloads'),
    ffmpegPath: '',
    ffmpegVersion: '',
    mediaDataFolder: MEDIA_DATA_FOLDER_PATH,
    platform: process.platform,
    userDownloadsFolder: app.getPath('downloads'),
    ytdlpPath: '',
    ytdlpVersion: '',
    jsRuntimePath: '',
    downloadTemplate: '',
    rememberPreviousDownloadsFolder: false,
    cookiesFilePath: '',
    maxConcurrentDownloads: DEFAULT_MAX_CONCURRENT_DOWNLOADS,
    cookiesBrowser: '',
    cookiesBrowserProfile: ''
  };
}
