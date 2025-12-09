import {
  DATA_DIR,
  FFMPEG_FOLDER_PATH,
  mainWindow,
  YTDLP_EXE_PATH,
  YTDLP_FOLDER_PATH
} from '@main/index';
import { getStoreManager } from '@main/store';
import {
  getFfmpegFromPc,
  getFfmpegVersionFromPc,
  getNormalizedUrl,
  getSettings,
  getSourceFromUrl,
  getYtdlpFromPc,
  getYtdlpVersionFromPc,
  terminateProcess
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
import { dialog, IpcMainEvent, IpcMainInvokeEvent } from 'electron';
import { downloadQuickJS } from '@main/utils/downloadJsRuntime';
import { is } from '@electron-toolkit/utils';
import { DownloadManager } from '@main/downloadManager';
import { NewDownloadHistoryItem } from '@main/types/db';
import { DownloadOptions } from '@shared/types/download';
import { MediaInfoJson } from '@shared/types/info-json';

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
  const store = await getStoreManager();
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

  store.set('jsRuntimePath', path.join(DATA_DIR, 'quickjs', 'qjs.exe'));
}

export async function confirmYtdlp(): ReturnType<Api['confirmYtdlp']> {
  const store = await getStoreManager();

  try {
    logger.info('Checking yt-dlp in PC...');

    const { ytdlpVersionInPc, ytdlpPathInPc } = await getYtdlpFromPc();

    if (ytdlpPathInPc && ytdlpVersionInPc) {
      await copyFileToFolder(ytdlpPathInPc, YTDLP_FOLDER_PATH);
      store.set('ytdlpPath', YTDLP_EXE_PATH);
      store.set('ytdlpVersion', ytdlpVersionInPc);
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
  const store = await getStoreManager();

  try {
    logger.info('Checking ffmpeg in PC...');

    const { ffmpegVersionInPc, ffmpegPathInPc } = await getFfmpegFromPc();

    if (ffmpegPathInPc && ffmpegVersionInPc) {
      const ffmpegFolderInPc = path.dirname(ffmpegPathInPc);
      copyFolder(ffmpegFolderInPc, FFMPEG_FOLDER_PATH);
      store.set('ffmpegPath', FFMPEG_FOLDER_PATH);
      store.set('ffmpegVersion', ffmpegVersionInPc);
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
  const store = await getStoreManager();

  try {
    logger.info('Downloading yt-dlp...');

    const outputPath = await downloadYtDlpLatestRelease(YTDLP_FOLDER_PATH);
    logger.info('Downloaded yt-dlp latest release');

    const ytdlpVersionInPc = await getYtdlpVersionFromPc(outputPath);

    store.set('ytdlpPath', outputPath);
    store.set('ytdlpVersion', ytdlpVersionInPc);

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
  const store = await getStoreManager();

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

    store.set('ffmpegPath', ffmpegBinPath);
    store.set('ffmpegVersion', ffmpegVersionInPc);

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
            thumbnail: infoJson.thumbnail ?? infoJson.thumbnails.at(-1)?.url ?? '',
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
  const store = await getStoreManager();
  store.update(changedSettings);
  const settings = store.getAll();
  mainWindow.webContents.send('settings:updated', settings);
}

export async function urlHistorySearch(_event: IpcMainInvokeEvent, searchInput: string) {
  return urlHistoryOperations.search(searchInput);
}

export async function downloadHistorySearch(_event: IpcMainInvokeEvent, searchInput: string) {
  return downloadHistoryOperations.search(searchInput);
}

export async function pauseDownload(_event: IpcMainEvent, downloadId: string) {
  const downloadManager = DownloadManager.getInstance();
  const currentlyRunningDownloads = downloadManager.currentlyRunningDownloads;

  const downloadToPause = currentlyRunningDownloads.find(
    (d) => d.downloadingItem.id === downloadId
  );

  if (!downloadToPause) {
    logger.error(`Download item to pause not found`);
    return;
  }

  const { downloadingItem, downloadProcess } = downloadToPause;

  downloadingItem.download_status = 'paused';
  terminateProcess(downloadProcess);
}

export async function resumeDownload(_event: IpcMainEvent, downloadId: string) {
  const downloadManager = DownloadManager.getInstance();

  const pausedDownload = await downloadHistoryOperations.getById(downloadId);

  if (!pausedDownload) {
    logger.error(`Download item to resume not found`);
    return;
  }

  pausedDownload!.download_status = 'downloading';

  const downloadCommandBase = pausedDownload!.download_command_base;

  const downloadCommandArgs = JSON.parse(pausedDownload!.download_command_args);

  downloadManager.addDownload(pausedDownload!, downloadCommandBase, downloadCommandArgs);

  downloadHistoryOperations.deleteById(downloadId);

  mainWindow.webContents.send('refresh-downloads');
}

export async function pauseAllDownloads() {
  const downloadManager = DownloadManager.getInstance();
  const running = downloadManager.currentlyRunningDownloads;

  if (running.length === 0) {
    mainWindow.webContents.send('yt-dlp:paused-all-downloads');
    return;
  }

  let exited = 0;

  for (const d of running) {
    const { downloadingItem, downloadProcess } = d;

    downloadingItem.download_status = 'paused';

    downloadProcess.once('exit', () => {
      exited++;
      if (exited === running.length) {
        mainWindow.webContents.send('yt-dlp:paused-all-downloads');
      }
    });

    terminateProcess(downloadProcess);
  }
}
