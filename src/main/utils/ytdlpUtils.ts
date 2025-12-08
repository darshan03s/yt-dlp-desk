import { spawn } from 'node:child_process';
import { mainWindow, MEDIA_DATA_FOLDER_PATH, YTDLP_EXE_PATH } from '..';
import path from 'node:path';
import { URL } from 'node:url';
import { downloadFile, pathExists, readJson, sanitizeFileName, writeJson } from './fsUtils';
import { LiveFromStartFormats, MediaInfoJson } from '@shared/types/info-json';
import { Source } from '@shared/types';
import logger from '@shared/logger';
import { writeFile } from 'node:fs/promises';
import { getStoreManager } from '@main/store';
import { DownloadManager } from '@main/downloadManager';
import { NewDownloadHistoryItem } from '@main/types/db';
import { DownloadOptions } from '@shared/types/download';
import { getYoutubePlaylistId, getYouTubeVideoId } from '@shared/utils';

function getInfoJsonPath(url: string, source: Source): string {
  if (source === 'youtube-video') {
    const videoId = getYouTubeVideoId(url);
    const infoJsonPath = path.join(
      MEDIA_DATA_FOLDER_PATH,
      source,
      videoId!,
      videoId + '.info.json'
    );
    return infoJsonPath;
  }

  if (source === 'youtube-playlist') {
    const playlistId = getYoutubePlaylistId(url);
    const infoJsonPath = path.join(
      MEDIA_DATA_FOLDER_PATH,
      source,
      playlistId!,
      playlistId + '.info.json'
    );
    return infoJsonPath;
  }
  return '';
}

export async function getInfoJson(
  url: string,
  source: Source,
  refetch?: boolean
): Promise<MediaInfoJson | null> {
  const infoJsonPath = getInfoJsonPath(url, source);
  if (source === 'youtube-video') {
    if (refetch) {
      logger.info(`Re-fetching info-json for ${url}`);
      return await createInfoJson(url, source, infoJsonPath);
    }
    if (await pathExists(infoJsonPath)) {
      const expireTime = await getExpireTime(infoJsonPath);
      if (new Date().toISOString() > expireTime!) {
        logger.info(`Video Links expired for ${url} on ${new Date(expireTime!)}`);
        logger.info(`Re-creating info-json for ${url}`);
        return (await createInfoJson(url, source, infoJsonPath)) as MediaInfoJson;
      } else {
        logger.info(`Video Links for ${url} expire at ${new Date(expireTime!)}`);
        return await readJson<MediaInfoJson>(infoJsonPath);
      }
    } else {
      return await createInfoJson(url, source, infoJsonPath);
    }
  }

  if (source === 'youtube-playlist') {
    if (refetch) {
      logger.info(`Re-fetching info-json for ${url}`);
      return await createInfoJson(url, source, infoJsonPath);
    }
    if (await pathExists(infoJsonPath)) {
      return await readJson<MediaInfoJson>(infoJsonPath);
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
): Promise<MediaInfoJson | null> {
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

    if (source === 'youtube-playlist') {
      infoJsonCommandArgs.push('--flat-playlist');
    }

    const completeCommand = infoJsonCommandBase.concat(' ').concat(infoJsonCommandArgs.join(' '));
    logger.info(`Creating info-json for ${url}\nCommand: ${completeCommand}`);
    const child = spawn(infoJsonCommandBase, infoJsonCommandArgs);

    child.on('error', reject);

    child.on('close', async (code) => {
      if (code !== 0) return resolve(null);

      logger.info(`Created info json for ${url}`);

      if (source === 'youtube-video') {
        let infoJson = await readJson<MediaInfoJson>(infoJsonPath);
        infoJson = await addCreatedAt(infoJson);
        infoJson = await addExpiresAt(infoJson);
        infoJson = await downloadThumbnail(infoJson, source, url);
        infoJson = await writeDescription(infoJson);
        if (infoJson.is_live) {
          infoJson = await addLiveFromStartFormats(url, infoJson);
        }

        await writeJson(infoJsonPath, infoJson);

        return resolve(infoJson);
      }
      if (source === 'youtube-playlist') {
        let infoJson = await readJson<MediaInfoJson>(infoJsonPath);
        infoJson = await addCreatedAt(infoJson);
        infoJson = await downloadThumbnail(infoJson, source, url);

        await writeJson(infoJsonPath, infoJson);

        return resolve(infoJson);
      }

      resolve(null);
    });
  });
}

async function addLiveFromStartFormats(url: string, infoJson: MediaInfoJson) {
  const store = await getStoreManager();
  const jsRuntimePath = `quickjs:${store.get('jsRuntimePath')}`;
  const baseCommand = YTDLP_EXE_PATH;
  const args = ['--js-runtimes', jsRuntimePath, '-F', url, '--live-from-start'];

  return new Promise<MediaInfoJson>((resolve) => {
    let formatsString: string;
    const child = spawn(baseCommand, args);

    child.stdout.on('data', (data) => {
      const line = data.toString() as string;
      if (line.includes('Available formats')) {
        formatsString = line;
      }
    });

    child.on('close', async (code) => {
      if (code === 0) {
        if (formatsString.length === 0) {
          infoJson.live_from_start_formats = [];
          logger.error(`Live from start formats not found`);
          return resolve(infoJson);
        }
        const parsedFormats = await parseLiveFromStartFormatsString(formatsString);
        infoJson.live_from_start_formats = parsedFormats;
        logger.info(`Added live from start formats`);
        return resolve(infoJson);
      } else {
        infoJson.live_from_start_formats = [];
        logger.error(`Something went wrong while adding live from start formats`);
        resolve(infoJson);
      }
    });
  });
}

async function parseLiveFromStartFormatsString(formatsString: string) {
  const lines = formatsString.split('\n').slice(3);
  const parsedFormats: LiveFromStartFormats[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    const parts = line.split('|').map((p) => p.trim());
    if (parts.length < 3) continue;

    const left = parts[0].split(/\s+/);
    const format_id = left[0];
    const ext = left[1];
    let resolution = left[2] ?? 'unknown';
    resolution = resolution === 'audio' ? 'audio only' : resolution;
    const fps = Number(left[3]) || 0;

    const right = parts[2].split(/\s+/);

    let vcodec = right[0] ?? 'none';
    vcodec = vcodec.includes('audio') ? 'none' : vcodec;

    let acodec = 'none';

    for (const token of right) {
      if (/mp4a/.test(token)) {
        acodec = token;
        break;
      }
      if (token === 'audio') acodec = 'audio only';
      if (token === 'video') acodec = 'none';
      if (token === 'only' && acodec.endsWith(' ')) acodec += 'only';
    }

    parsedFormats.push({
      format_id,
      format: `${format_id} - ${resolution}`,
      ext,
      resolution,
      fps,
      vcodec,
      acodec
    });
  }

  return parsedFormats;
}

async function addCreatedAt(infoJson: MediaInfoJson) {
  infoJson.created_at = new Date().toISOString();
  return infoJson;
}

async function addExpiresAt(infoJson: MediaInfoJson) {
  const format = infoJson.formats.find((f) => f.vcodec !== 'none' && f.url);

  if (!format?.url) {
    infoJson.expires_at = new Date().toISOString();
    return infoJson;
  }

  const url = format.url;

  // query param: ?expire=1764870570079
  const queryMatch = url.match(/[?&]expire=(\d+)/)?.[1];

  // path segment: /expire/1764870570079/
  const pathMatch = url.match(/\/expire\/(\d+)/)?.[1];

  const expireParam = queryMatch ?? pathMatch;

  if (!expireParam) {
    // default 15 min
    infoJson.expires_at = new Date(Date.now() + 1000 * 60 * 15).toISOString();
    return infoJson;
  }

  infoJson.expires_at = new Date(Number(expireParam) * 1000).toISOString();
  return infoJson;
}

async function getExpireTime(infoJsonPath: string) {
  const json = await readJson<MediaInfoJson>(infoJsonPath);
  return json.expires_at;
}

async function downloadThumbnail(infoJson: MediaInfoJson, source: Source, url: string) {
  const safeTitle = sanitizeFileName(infoJson.fulltitle ?? infoJson.title);
  let thumbnailUrl: URL | null = null;
  if (source === 'youtube-video') {
    thumbnailUrl = new URL(infoJson.thumbnail);
  }
  if (source === 'youtube-playlist') {
    thumbnailUrl = new URL(infoJson.thumbnails.at(-1)!.url);
  }
  if (!thumbnailUrl) {
    logger.info(`Thumbnail url not available for ${url}`);
    return infoJson;
  }
  thumbnailUrl!.search = '';
  const thumbnailUrlCleaned = thumbnailUrl!.toString();
  const thumbnailLocalPath = path.join(
    MEDIA_DATA_FOLDER_PATH,
    source,
    infoJson.id,
    safeTitle + '.jpg'
  );
  try {
    await downloadFile({ url: thumbnailUrlCleaned, destinationPath: thumbnailLocalPath });
    logger.info(
      `Downloaded thumbnail for ${infoJson.fulltitle ?? infoJson.title} to ${thumbnailLocalPath}`
    );
  } catch (error) {
    logger.error(error);
  }
  infoJson.thumbnail_local = thumbnailLocalPath;
  return infoJson;
}

async function writeDescription(infoJson: MediaInfoJson) {
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
    const { url, source, selectedFormat, downloadSections, selectedDownloadFolder, extraOptions } =
      downloadOptions;
    console.log({ url, source, selectedFormat, downloadSections, extraOptions });
    const mediaInfo = downloadOptions.mediaInfo as MediaInfoJson;
    const infoJsonPath = getInfoJsonPath(url, source);
    const formatId = selectedFormat.format_id!;
    let targetDownloadFileName = `${mediaInfo.fulltitle} [${selectedFormat.resolution}] [${selectedFormat.format_id}]`;

    const jsRuntimePath = `quickjs:${store.get('jsRuntimePath')}`;
    const downloadCommandBase = YTDLP_EXE_PATH;
    const downloadCommandArgs = ['--js-runtimes', jsRuntimePath, '--newline'];

    const hasAudio = selectedFormat.acodec && selectedFormat.acodec !== 'none';

    if (hasAudio) {
      // format already has audio
      downloadCommandArgs.push('-f');
      downloadCommandArgs.push(formatId);
    } else {
      // no audio → append bestaudio
      downloadCommandArgs.push('-f');
      downloadCommandArgs.push(formatId + '+ba');
    }

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

    if (extraOptions.embedThumbnail) {
      downloadCommandArgs.push('--embed-thumbnail');
    }

    if (extraOptions.embedChapters) {
      downloadCommandArgs.push('--embed-chapters');
    }

    if (extraOptions.embedSubs) {
      downloadCommandArgs.push('--embed-subs');
    }

    if (extraOptions.embedMetadata) {
      downloadCommandArgs.push('--embed-metadata');
    }

    if (extraOptions.writeDescription) {
      downloadCommandArgs.push('--write-description');
    }

    if (extraOptions.writeComments) {
      downloadCommandArgs.push('--write-comments');
    }

    if (extraOptions.writeThumbnail) {
      downloadCommandArgs.push('--write-thumbnail');
    }

    if (extraOptions.writeSubs) {
      downloadCommandArgs.push('--write-subs');
    }

    if (extraOptions.writeAutoSubs) {
      downloadCommandArgs.push('--write-auto-subs');
    }

    if (extraOptions.liveFromStart) {
      downloadCommandArgs.push('--live-from-start');
    }

    downloadCommandArgs.push('--no-quiet');
    downloadCommandArgs.push('--progress');
    downloadCommandArgs.push('--print');
    downloadCommandArgs.push('after_move:filepath');

    if (extraOptions.liveFromStart) {
      downloadCommandArgs.push(url);
    } else {
      downloadCommandArgs.push('--load-info-json');
      downloadCommandArgs.push(infoJsonPath);
    }

    // output filename
    targetDownloadFileName = targetDownloadFileName + '.%(ext)s';
    targetDownloadFileName = sanitizeFileName(targetDownloadFileName, '_');
    const targetDownloadFilePath = path.join(selectedDownloadFolder, targetDownloadFileName);
    downloadCommandArgs.push('-o', targetDownloadFilePath);
    const completeCommand = downloadCommandBase.concat(' ').concat(downloadCommandArgs.join(' '));

    if (store.get('rememberPreviousDownloadsFolder')) {
      const currentDownloadsFolder = store.get('downloadsFolder');
      if (currentDownloadsFolder !== selectedDownloadFolder) {
        store.set('downloadsFolder', selectedDownloadFolder);
        const updatedSettings = store.getAll();
        mainWindow.webContents.send('settings:updated', updatedSettings);
      }
    }

    logger.info(`Starting download for ${downloadOptions.url}\nCommand: ${completeCommand}`);

    const downloadManager = DownloadManager.getInstance();

    const newDownload: NewDownloadHistoryItem = {
      id: downloadOptions.downloadId,
      thumbnail: mediaInfo.thumbnail ?? '',
      title: mediaInfo.fulltitle ?? mediaInfo.title ?? 'N/A',
      url: url,
      source: source,
      thumbnail_local: mediaInfo.thumbnail_local || '',
      uploader: mediaInfo.uploader ?? mediaInfo.channel ?? 'N/A',
      uploader_url: mediaInfo.uploader_url ?? mediaInfo.channel_url ?? '',
      start_time: downloadSections.startTime,
      end_time: downloadSections.endTime,
      duration: mediaInfo.duration_string ?? 'N/A',
      download_progress: 0,
      download_progress_string: '',
      command: completeCommand,
      complete_output: '',
      download_path: '',
      download_status: 'downloading',
      download_completed_at: '',
      download_command_base: downloadCommandBase,
      download_command_args: JSON.stringify(downloadCommandArgs),
      format: selectedFormat.resolution + ' - ' + selectedFormat.format_id!,
      added_at: new Date().toISOString()
    };

    downloadManager.addDownload(newDownload, downloadCommandBase, downloadCommandArgs);
  }
}
