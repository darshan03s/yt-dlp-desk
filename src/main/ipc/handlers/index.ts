import {
  DATA_DIR,
  FFMPEG_FOLDER_PATH,
  MEDIA_DATA_FOLDER_PATH,
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
  getYtdlpVersionFromPc
} from '@main/utils/appUtils';
import { urlHistoryOperations } from '@main/utils/dbUtils';
import { downloadFfmpeg7z } from '@main/utils/downloadFfmpeg7z';
import { downloadYtDlpLatestRelease } from '@main/utils/downloadYtdlp';
import {
  copyFileToFolder,
  copyFolder,
  deleteFile,
  downloadFile,
  filePathToFileUrl,
  pathExists,
  sanitizeFileName
} from '@main/utils/fsUtils';
import { getInfoJson } from '@main/utils/ytdlpUtils';
import { allowedSources } from '@shared/data';
import logger from '@shared/logger';
import { Api, Source } from '@shared/types';
import { YoutubeVideoInfoJson } from '@shared/types/info-json/youtube-video';
import { writeFile } from 'node:fs/promises';
import SevenZip from '7zip-min';
import path from 'node:path';

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

export async function confirmYtdlp(): ReturnType<Api['confirmYtdlp']> {
  const store = await getStoreManager();

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
}

export async function confirmFfmpeg(): ReturnType<Api['confirmFfmpeg']> {
  const store = await getStoreManager();

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
}

export async function downloadYtdlp(): ReturnType<Api['downloadYtdlp']> {
  const store = await getStoreManager();

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
}

export async function downloadFfmpeg(): ReturnType<Api['downloadFfmpeg']> {
  const store = await getStoreManager();

  try {
    logger.info('Downloading ffmpeg...');

    const output7zPath = await downloadFfmpeg7z(DATA_DIR);
    logger.info('Downloaded ffmpeg');

    await SevenZip.unpack(output7zPath, DATA_DIR);

    await deleteFile(output7zPath);

    const ffmpegExePath = path.join(DATA_DIR, 'ffmpeg-8.0-full_build', 'bin', 'ffmpeg.exe');
    const ffmpegBinPath = path.join(DATA_DIR, 'ffmpeg-8.0-full_build', 'bin');

    const ffmpegVersionInPc = await getFfmpegVersionFromPc(ffmpegExePath);

    store.set('settings.ffmpegPath', ffmpegBinPath);
    store.set('settings.ffmpegVersion', ffmpegVersionInPc);

    logger.info(`ffmpeg downloaded: ${ffmpegBinPath}`);
    logger.info(`ffmpeg downloaded version: ${ffmpegVersionInPc}`);

    return { ffmpegVersionInPc, ffmpegPathInPc: ffmpegBinPath };
  } catch (err) {
    logger.error('Failed to download ffmpeg:', err);
    return { ffmpegVersionInPc: null, ffmpegPathInPc: null };
  }
}

export async function checkUrl(_event, url): ReturnType<Api['checkUrl']> {
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

export async function getYoutubeVideoInfoJson(_event, url): Promise<YoutubeVideoInfoJson | null> {
  logger.info(`Fetching info json for ${url}`);
  // get info json
  const infoJson = (await getInfoJson(
    url,
    'youtube-video' as Source
  )) as YoutubeVideoInfoJson | null;
  if (infoJson) {
    logger.info(`Fetched info json for ${url}`);
    const thumbnailUrl = `https://i.ytimg.com/vi/${infoJson.id}/maxresdefault.jpg`;
    const safeTitle = sanitizeFileName(infoJson.fulltitle);
    const thumbnailLocalPath = path.join(
      MEDIA_DATA_FOLDER_PATH,
      'youtube-video',
      infoJson.id,
      safeTitle + '.jpg'
    );
    const descriptionLocalPath = path.join(
      MEDIA_DATA_FOLDER_PATH,
      'youtube-video',
      infoJson.id,
      safeTitle + '.description'
    );
    if (!(await pathExists(thumbnailLocalPath))) {
      try {
        // download thumbnail
        await downloadFile({ url: thumbnailUrl, destinationPath: thumbnailLocalPath });
        logger.info(`Downloaded thumbnail for ${url} to ${thumbnailLocalPath}`);
      } catch (error) {
        logger.error(error);
      }
    } else {
      logger.info(`Thumbnail exists for ${url} at ${thumbnailLocalPath}`);
    }
    if (!(await pathExists(descriptionLocalPath))) {
      try {
        // write description
        await writeFile(descriptionLocalPath, infoJson.description, 'utf-8');
        logger.info(`Wrote description for ${url} to ${descriptionLocalPath}`);
      } catch (error) {
        logger.error(error);
      }
    } else {
      logger.info(`Description exists for ${url} at ${descriptionLocalPath}`);
    }
    try {
      await urlHistoryOperations.upsertByUrl(url, {
        url,
        thumbnail: infoJson.thumbnail,
        title: infoJson.fulltitle,
        source: 'youtube-video' as Source,
        thumbnail_local: filePathToFileUrl(thumbnailLocalPath)
      });
      logger.info('Updated url history');
    } catch {
      logger.error('Could not update url history');
    }
    return infoJson;
  } else {
    logger.error(`Could not fetch info json for ${url}`);
  }
  return null;
}
