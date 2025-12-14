import {
  DATA_DIR,
  FFMPEG_FOLDER_PATH,
  mainWindow,
  MEDIA_DATA_FOLDER_PATH,
  YTDLP_EXE_PATH,
  YTDLP_FOLDER_PATH
} from '@main/index';
import {
  getAllInfoJsonFiles,
  getFfmpegFromPc,
  getFfmpegVersionFromPc,
  getNormalizedUrl,
  getSettings,
  getSourceFromUrl,
  getYtdlpFromPc,
  getYtdlpVersionFromPc
} from '@main/utils/appUtils';
import { urlHistoryOperations, downloadHistoryOperations } from '@main/utils/dbUtils';
import { downloadFfmpeg7z } from '@main/utils/downloadFfmpeg7z';
import { downloadYtDlpLatestRelease } from '@main/utils/downloadYtdlp';
import { copyFileToFolder, copyFolder, deleteFile } from '@main/utils/fsUtils';
import { downloadFromYtdlp, getInfoJson } from '@main/utils/ytdlpUtils';
import { allowedSources } from '@shared/data';
import logger from '@shared/logger';
import { Api, AppSettingsChange, Source } from '@shared/types';
import SevenZip from '7zip-min';
import path from 'node:path';
import { dialog, IpcMainEvent, IpcMainInvokeEvent, shell } from 'electron';
import { downloadQuickJS } from '@main/utils/downloadJsRuntime';
import { is } from '@electron-toolkit/utils';
import { DownloadManager } from '@main/downloadManager';
import { NewDownloadHistoryItem } from '@main/types/db';
import { DownloadOptions } from '@shared/types/download';
import { MediaInfoJson } from '@shared/types/info-json';
import Settings from '@main/settings';

export async function rendererInit(): ReturnType<Api['rendererInit']> {
  try {
    logger.info('Renderer initialized');

    const settings = await getSettings();

    return settings;
  } catch (err) {
    logger.error('Failed to initialize renderer:', err);
    return null;
  }
}

async function addJsRuntime() {
  const settings = Settings.getInstance();
  const outputJsRuntimeZipPath = await downloadQuickJS(path.join(DATA_DIR, 'quickjs'));
  logger.info('Downloaded JS Runtime');

  if (!is.dev) {
    const sevenZipPath = path.join(
      process.resourcesPath,
      'app.asar.unpacked',
      'node_modules',
      '7zip-bin',
      'win',
      'x64',
      '7za.exe'
    );

    SevenZip.config({
      binaryPath: sevenZipPath
    });
  }

  await SevenZip.unpack(outputJsRuntimeZipPath, path.join(DATA_DIR, 'quickjs'));

  await deleteFile(outputJsRuntimeZipPath);

  settings.set('jsRuntimePath', path.join(DATA_DIR, 'quickjs', 'qjs.exe'));
}

export async function confirmYtdlp(): ReturnType<Api['confirmYtdlp']> {
  const settings = Settings.getInstance();

  try {
    logger.info('Checking yt-dlp in PC...');

    const { ytdlpVersionInPc, ytdlpPathInPc } = await getYtdlpFromPc();

    if (ytdlpPathInPc && ytdlpVersionInPc) {
      await copyFileToFolder(ytdlpPathInPc, YTDLP_FOLDER_PATH);
      settings.set('ytdlpPath', YTDLP_EXE_PATH);
      settings.set('ytdlpVersion', ytdlpVersionInPc);
    }

    logger.info(`yt-dlp path in PC: ${ytdlpPathInPc}`);
    logger.info(`yt-dlp version in PC: ${ytdlpVersionInPc}`);

    await addJsRuntime();

    return { ytdlpVersionInPc, ytdlpPathInPc };
  } catch (err) {
    logger.error(err);
    return { ytdlpPathInPc: null, ytdlpVersionInPc: null };
  }
}

export async function confirmFfmpeg(): ReturnType<Api['confirmFfmpeg']> {
  const settings = Settings.getInstance();

  try {
    logger.info('Checking ffmpeg in PC...');

    const { ffmpegVersionInPc, ffmpegPathInPc } = await getFfmpegFromPc();

    if (ffmpegPathInPc && ffmpegVersionInPc) {
      const ffmpegFolderInPc = path.dirname(ffmpegPathInPc);
      copyFolder(ffmpegFolderInPc, FFMPEG_FOLDER_PATH);
      settings.set('ffmpegPath', FFMPEG_FOLDER_PATH);
      settings.set('ffmpegVersion', ffmpegVersionInPc);
    }

    logger.info(`ffmpeg path in PC: ${ffmpegPathInPc}`);
    logger.info(`ffmpeg version in PC: ${ffmpegVersionInPc}`);

    return { ffmpegVersionInPc, ffmpegPathInPc };
  } catch (err) {
    logger.error(err);
    return { ffmpegPathInPc: null, ffmpegVersionInPc: null };
  }
}

export async function downloadYtdlp(): ReturnType<Api['downloadYtdlp']> {
  const settings = Settings.getInstance();

  try {
    logger.info('Downloading yt-dlp...');

    const outputPath = await downloadYtDlpLatestRelease(YTDLP_FOLDER_PATH);
    logger.info('Downloaded yt-dlp latest release');

    const ytdlpVersionInPc = await getYtdlpVersionFromPc(outputPath);

    settings.set('ytdlpPath', outputPath);
    settings.set('ytdlpVersion', ytdlpVersionInPc);

    logger.info(`yt-dlp downloaded: ${outputPath}`);
    logger.info(`yt-dlp downloaded version: ${ytdlpVersionInPc}`);

    await addJsRuntime();

    return { ytdlpVersionInPc, ytdlpPathInPc: outputPath };
  } catch (err) {
    logger.error('Failed to download yt-dlp:', err);
    return { ytdlpVersionInPc: null, ytdlpPathInPc: null };
  }
}

export async function downloadFfmpeg(): ReturnType<Api['downloadFfmpeg']> {
  const settings = Settings.getInstance();

  try {
    logger.info('Downloading ffmpeg...');

    const output7zPath = await downloadFfmpeg7z(DATA_DIR);
    logger.info('Downloaded ffmpeg');

    if (!is.dev) {
      const sevenZipPath = path.join(
        process.resourcesPath,
        'app.asar.unpacked',
        'node_modules',
        '7zip-bin',
        'win',
        'x64',
        '7za.exe'
      );

      SevenZip.config({
        binaryPath: sevenZipPath
      });
    }

    await SevenZip.unpack(output7zPath, DATA_DIR);

    await deleteFile(output7zPath);

    const ffmpegExePath = path.join(DATA_DIR, 'ffmpeg-8.0-full_build', 'bin', 'ffmpeg.exe');
    const ffmpegBinPath = path.join(DATA_DIR, 'ffmpeg-8.0-full_build', 'bin');

    const ffmpegVersionInPc = await getFfmpegVersionFromPc(ffmpegExePath);

    settings.set('ffmpegPath', ffmpegBinPath);
    settings.set('ffmpegVersion', ffmpegVersionInPc);

    logger.info(`ffmpeg downloaded: ${ffmpegBinPath}`);
    logger.info(`ffmpeg downloaded version: ${ffmpegVersionInPc}`);

    return { ffmpegVersionInPc, ffmpegPathInPc: ffmpegBinPath };
  } catch (err) {
    logger.error('Failed to download ffmpeg:', err);
    return { ffmpegVersionInPc: null, ffmpegPathInPc: null };
  }
}

export async function checkUrl(
  _event: IpcMainInvokeEvent,
  url: string
): ReturnType<Api['checkUrl']> {
  const source = getSourceFromUrl(url);
  if (!source) {
    return { source: '', url: url, isMediaDisplayAvailable: false };
  }
  if (allowedSources.includes(source as Source)) {
    const normalizedUrl = getNormalizedUrl(source, url);
    return { source: source, url: normalizedUrl, isMediaDisplayAvailable: true };
  }
  return { source: source, url: url, isMediaDisplayAvailable: false };
}

let fetchingInfoJsonForUrls: string[] = [];

export async function getMediaInfoJson(
  _event: IpcMainEvent,
  url: string,
  source: Source,
  updateUrlHistory: boolean,
  refetch?: boolean
) {
  if (fetchingInfoJsonForUrls.includes(url)) {
    return;
  }
  logger.info(`Fetching info json for ${url}`);
  fetchingInfoJsonForUrls.push(url);
  try {
    const infoJson = (await getInfoJson(url, source, refetch)) as MediaInfoJson;
    if (infoJson) {
      logger.info(`Fetched info json for ${url}`);
      if (updateUrlHistory) {
        try {
          const newUrlHistoryItem = {
            url,
            thumbnail: infoJson.thumbnail ?? infoJson.thumbnails?.at(-1)?.url ?? '',
            title: infoJson.fulltitle ?? infoJson.title ?? '',
            source: source,
            thumbnail_local: infoJson.thumbnail_local ?? '',
            uploader: infoJson.uploader ?? infoJson.channel ?? '',
            uploader_url: infoJson.uploader_url ?? infoJson.channel_url ?? '',
            created_at: infoJson.upload_date ?? infoJson.modified_date,
            duration: infoJson.duration_string ?? ''
          };
          await urlHistoryOperations.upsertByUrl(url, newUrlHistoryItem);
          logger.info('Updated url history');
          const updatedUrlHistory = await getUrlHistory();
          mainWindow.webContents.send('url-history:updated', updatedUrlHistory);
        } catch (e) {
          logger.error(`Could not update url history \n${e}`);
        }
      }
      mainWindow.webContents.send('yt-dlp:recieve-media-info-json', infoJson);
      fetchingInfoJsonForUrls = fetchingInfoJsonForUrls.filter((u) => u != url);
    } else {
      logger.error(`Could not fetch info json for ${url}`);
      mainWindow.webContents.send('yt-dlp:recieve-media-info-json', null);
      fetchingInfoJsonForUrls = fetchingInfoJsonForUrls.filter((u) => u != url);
    }
  } catch (e) {
    logger.error(e);
  }
}

export async function getUrlHistory() {
  return urlHistoryOperations.getAllByAddedAtDesc();
}

export async function deleteOneFromUrlHistory(_event: IpcMainInvokeEvent, id: string) {
  try {
    urlHistoryOperations.deleteById(id);
  } catch (e) {
    logger.error(`Could not delete from url history for id -> ${id}\n${e}`);
  }
}

export async function deleteOneFromDownloadHistory(_event: IpcMainInvokeEvent, id: string) {
  try {
    downloadHistoryOperations.deleteById(id);
  } catch (e) {
    logger.error(`Could not delete from url history for id -> ${id}\n${e}`);
  }
}

export async function deleteAllFromUrlHistory() {
  try {
    urlHistoryOperations.deleteAll();
  } catch (e) {
    logger.error(`Could not delete all url history \n${e}`);
  }
}

export async function deleteAllFromDownloadHistory() {
  try {
    downloadHistoryOperations.deleteAll();
  } catch (e) {
    logger.error(`Could not delete all url history \n${e}`);
  }
}

export function downloadMedia(_event: IpcMainEvent, downloadOptions: DownloadOptions) {
  downloadFromYtdlp(downloadOptions);
}

export async function getRunningDownloads() {
  const runningDownloads: NewDownloadHistoryItem[] = [];
  const downloadManager = DownloadManager.getInstance();
  downloadManager.currentlyRunningDownloads.forEach((data) => {
    runningDownloads.push(data.downloadingItem);
  });
  return runningDownloads;
}

export async function getQueuedDownloads() {
  const downloadManager = DownloadManager.getInstance();
  return downloadManager.getQueuedDownloads();
}

export async function getDownloadHistory() {
  return downloadHistoryOperations.getAllByCompletedAtDesc();
}

export async function selectFolder() {
  const result = await dialog.showOpenDialog({
    title: 'Select a folder',
    properties: ['openDirectory']
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  return result.filePaths[0];
}

export async function saveSettings(_event: IpcMainEvent, changedSettings: AppSettingsChange) {
  const settings = Settings.getInstance();
  settings.update(changedSettings);
  const updatedSettings = settings.getAll();
  mainWindow.webContents.send('settings:updated', updatedSettings);
}

export async function urlHistorySearch(_event: IpcMainInvokeEvent, searchInput: string) {
  return urlHistoryOperations.search(searchInput);
}

export async function downloadHistorySearch(_event: IpcMainInvokeEvent, searchInput: string) {
  return downloadHistoryOperations.search(searchInput);
}

export async function pauseRunningDownload(_event: IpcMainEvent, downloadId: string) {
  const downloadManager = DownloadManager.getInstance();

  downloadManager.pauseRunningDownload(downloadId);
}

export async function pauseWaitingDownload(_event: IpcMainEvent, downloadId: string) {
  const downloadManager = DownloadManager.getInstance();

  downloadManager.pauseWaitingDownload(downloadId);
}

export async function resumePausedDownload(_event: IpcMainEvent, downloadId: string) {
  const downloadManager = DownloadManager.getInstance();

  await downloadManager.resumePausedDownload(downloadId);
}

export async function pauseAllDownloads() {
  const downloadManager = DownloadManager.getInstance();

  downloadManager.pauseAllWaitingDownloads();

  await downloadManager.pauseAllRunningDownloadsAndWait();

  mainWindow.webContents.send('yt-dlp:paused-all-downloads');
}

export async function playMedia(_event: IpcMainEvent, filePath: string) {
  const result = await shell.openPath(filePath);
  if (result) {
    throw new Error(result);
  }
}

export async function showInFolder(_event: IpcMainEvent, filePath: string) {
  const folder = path.dirname(filePath);
  const result = await shell.openPath(folder);
  if (result) {
    throw new Error(result);
  }
}

export async function selectFile() {
  const result = await dialog.showOpenDialog({
    title: 'Select cookies file',
    properties: ['openFile'],
    filters: [{ name: 'Text Files', extensions: ['txt'] }]
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  return result.filePaths[0];
}

export async function retryFailedDownload(_event: IpcMainEvent, downloadId: string) {
  const downloadManager = DownloadManager.getInstance();

  await downloadManager.retryFailedDownload(downloadId);
}

export async function deleteAllMetadata() {
  const allInfoJsonFiles = await getAllInfoJsonFiles(MEDIA_DATA_FOLDER_PATH);

  logger.info(`Deleting ${allInfoJsonFiles.length} info json files`);

  for (const relativePath of allInfoJsonFiles) {
    const absolutePath = path.join(MEDIA_DATA_FOLDER_PATH, relativePath);

    try {
      logger.info(`Deleting ${absolutePath}`);
      await deleteFile(absolutePath);
    } catch (error) {
      logger.error(error);
    }
  }

  mainWindow.webContents.send('app:delete-all-metadata');
}
