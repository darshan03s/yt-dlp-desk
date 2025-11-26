import { spawn } from 'node:child_process';
import { MEDIA_DATA_FOLDER_PATH, YTDLP_EXE_PATH } from '..';
import path from 'node:path';
import { URL } from 'node:url';
import {
  downloadFile,
  makeDirs,
  pathExists,
  readJson,
  sanitizeFileName,
  writeJson
} from './fsUtils';
import { YoutubeVideoInfoJson } from '@shared/types/info-json/youtube-video';
import { Source } from '@shared/types';
import { YoutubePlaylistInfoJson } from '@shared/types/info-json/youtube-playlist';
import logger from '@shared/logger';
import { writeFile } from 'node:fs/promises';
import { getStoreManager } from '@main/store';
import { DownloadManager } from '@main/downloadManager';
import { NewDownloadsHistoryItem } from '@main/types/db';
import { DownloadOptions } from '@shared/types/download';

function getInfoJsonPath(url: string, source: Source): string {
  if (source === 'youtube-video') {
    const videoId = new URL(url).searchParams.get('v') as string;
    const infoJsonPath = path.join(MEDIA_DATA_FOLDER_PATH, source, videoId, videoId + '.info.json');
    return infoJsonPath;
  }
  return '';
}

export async function getInfoJson(
  url: string,
  source: Source
): Promise<YoutubeVideoInfoJson | YoutubePlaylistInfoJson | null> {
  if (source === 'youtube-video') {
    const infoJsonPath = getInfoJsonPath(url, source);
    if (await pathExists(infoJsonPath)) {
      const expireTime = await getExpireTime(infoJsonPath);
      if (new Date().toISOString() > expireTime!) {
        logger.info(`Video Links expired for ${url} on ${new Date(expireTime!)}`);
        logger.info(`Re-creating info-json for ${url}`);
        return (await createInfoJson(url, source, infoJsonPath)) as YoutubeVideoInfoJson;
      } else {
        logger.info(`Video Links for ${url} expire at ${new Date(expireTime!)}`);
        return await readJson<YoutubeVideoInfoJson>(infoJsonPath);
      }
    } else {
      return await createInfoJson(url, source, infoJsonPath);
    }
  }
  return null;
}

export async function createInfoJson(
  url: string,
  source: Source,
  infoJsonPath: string
): Promise<YoutubeVideoInfoJson | YoutubePlaylistInfoJson | null> {
  const store = await getStoreManager();

  return await new Promise((resolve, reject) => {
    const jsRuntimePath = `quickjs:${store.get('jsRuntimePath')}`;
    const infoJsonCommandBase = YTDLP_EXE_PATH;
    const infoJsonCommandArgs = [
      '--js-runtimes',
      jsRuntimePath,
      '--skip-download',
      '--write-info-json',
      '-o',
      infoJsonPath.split('.info.json')[0],
      url
    ];

    const completeCommand = infoJsonCommandBase.concat(' ').concat(infoJsonCommandArgs.join(' '));
    logger.info(`Creating info-json for ${url}\nCommand: ${completeCommand}`);
    const child = spawn(infoJsonCommandBase, infoJsonCommandArgs);

    child.on('error', reject);

    child.on('close', async (code) => {
      if (code !== 0) return resolve(null);

      logger.info(`Created info json for ${url}`);

      if (source === 'youtube-video') {
        let infoJson = await readJson<YoutubeVideoInfoJson>(infoJsonPath);
        infoJson = await addCreatedAt(infoJson);
        infoJson = await addExpiresAt(infoJson);
        infoJson = await downloadThumbnail(infoJson);
        infoJson = await writeDescription(infoJson);

        await writeJson(infoJsonPath, infoJson);

        return resolve(infoJson);
      }

      resolve(null);
    });
  });
}

async function addCreatedAt(infoJson: YoutubeVideoInfoJson) {
  infoJson.created_at = new Date().toISOString();
  return infoJson;
}

async function addExpiresAt(infoJson: YoutubeVideoInfoJson) {
  const format = infoJson.formats.find((f) => f.vcodec !== 'none' && f.url);

  console.log(`Adding expires_at from ${format}`);

  if (!format?.url) {
    infoJson.expires_at = new Date().toISOString();
    return infoJson;
  }

  const url = format.url;

  const expireParam = url.match(/[?&]expire=(\d+)/)?.[1];

  if (!expireParam) {
    infoJson.expires_at = new Date().toISOString();
    return infoJson;
  }

  const expireIso = new Date(Number(expireParam) * 1000).toISOString();
  infoJson.expires_at = expireIso;

  return infoJson;
}

async function getExpireTime(infoJsonPath: string) {
  const json = await readJson<YoutubeVideoInfoJson>(infoJsonPath);
  return json.expires_at;
}

async function downloadThumbnail(infoJson: YoutubeVideoInfoJson) {
  const safeTitle = sanitizeFileName(infoJson.fulltitle);
  const thumbnailUrl = new URL(infoJson.thumbnail);
  thumbnailUrl.search = '';
  const thumbnailUrlCleaned = thumbnailUrl.toString();
  const thumbnailLocalPath = path.join(
    MEDIA_DATA_FOLDER_PATH,
    'youtube-video',
    infoJson.id,
    safeTitle + '.jpg'
  );
  try {
    await downloadFile({ url: thumbnailUrlCleaned, destinationPath: thumbnailLocalPath });
    logger.info(`Downloaded thumbnail for ${infoJson.fulltitle} to ${thumbnailLocalPath}`);
  } catch (error) {
    logger.error(error);
  }
  infoJson.thumbnail_local = thumbnailLocalPath;
  return infoJson;
}

async function writeDescription(infoJson: YoutubeVideoInfoJson) {
  const safeTitle = sanitizeFileName(infoJson.fulltitle);

  const descriptionLocalPath = path.join(
    MEDIA_DATA_FOLDER_PATH,
    'youtube-video',
    infoJson.id,
    safeTitle + '.description'
  );

  try {
    await writeFile(descriptionLocalPath, infoJson.description, 'utf-8');
    logger.info(`Wrote description for ${infoJson.fulltitle} to ${descriptionLocalPath}`);
  } catch (error) {
    logger.error(error);
  }

  return infoJson;
}

export async function downloadFromYtdlp(downloadOptions: DownloadOptions) {
  const store = await getStoreManager();

  if (downloadOptions.source === ('youtube-video' as Source)) {
    const { url, source, selectedFormat, downloadSections, selectedDownloadFolder } =
      downloadOptions;
    console.log({ url, source, selectedFormat, downloadSections });
    const mediaInfo = downloadOptions.mediaInfo as YoutubeVideoInfoJson;
    const infoJsonPath = getInfoJsonPath(url, source);
    const formatId = selectedFormat.format_id!;
    let targetDownloadFileName = `${mediaInfo.fulltitle} [${selectedFormat.resolution}] [${selectedFormat.format_id}]`;

    const jsRuntimePath = `quickjs:${store.get('jsRuntimePath')}`;
    const downloadCommandBase = YTDLP_EXE_PATH;
    const downloadCommandArgs = [
      '--js-runtimes',
      jsRuntimePath,
      '--load-info-json',
      infoJsonPath,
      '-f',
      formatId.includes('+') ? formatId : formatId.concat('+ba'),
      '--newline'
    ];

    // force-keyframes-at-cuts
    if (downloadSections.forceKeyframesAtCuts) {
      downloadCommandArgs.push('--force-keyframes-at-cuts');
    }

    // start + end
    if (downloadSections.startTime && downloadSections.endTime) {
      downloadCommandArgs.push(
        '--download-sections',
        `*${downloadSections.startTime}-${downloadSections.endTime}`
      );
      targetDownloadFileName =
        targetDownloadFileName + `[${downloadSections.startTime} - ${downloadSections.endTime}]`;
    }

    // only start
    if (downloadSections.startTime && !downloadSections.endTime) {
      downloadCommandArgs.push('--download-sections', `*${downloadSections.startTime}`);
      targetDownloadFileName = targetDownloadFileName + `[${downloadSections.startTime} - ]`;
    }

    // only end
    if (!downloadSections.startTime && downloadSections.endTime) {
      downloadCommandArgs.push('--download-sections', `*00:00:00-${downloadSections.endTime}`);
      targetDownloadFileName = targetDownloadFileName + `[00:00:00 - ${downloadSections.endTime}]`;
    }

    // output filename
    targetDownloadFileName = targetDownloadFileName + '.%(ext)s';
    targetDownloadFileName = sanitizeFileName(targetDownloadFileName, '_');
    makeDirs(selectedDownloadFolder);
    const targetDownloadFilePath = path.join(selectedDownloadFolder, targetDownloadFileName);
    downloadCommandArgs.push('-o', targetDownloadFilePath);
    const completeCommand = downloadCommandBase.concat(' ').concat(downloadCommandArgs.join(' '));
    logger.info(`Starting download for ${downloadOptions.url}\nCommand: ${completeCommand}`);

    const downloadManager = DownloadManager.getInstance();

    const newDownload: NewDownloadsHistoryItem = {
      id: downloadOptions.downloadId,
      thumbnail: mediaInfo.thumbnail,
      title: mediaInfo.fulltitle,
      url: url,
      source: source,
      thumbnail_local: mediaInfo.thumbnail_local || '',
      uploader: mediaInfo.uploader,
      uploader_url: mediaInfo.uploader_url,
      start_time: downloadSections.startTime,
      end_time: downloadSections.endTime,
      duration: mediaInfo.duration_string,
      download_progress: 0,
      download_progress_string: '',
      command: completeCommand,
      download_status: 'downloading',
      download_completed_at: '',
      format: selectedFormat.resolution + ' - ' + selectedFormat.format_id!,
      added_at: new Date().toISOString()
    };

    downloadManager.addDownload(newDownload, downloadCommandBase, downloadCommandArgs);
  }
}
