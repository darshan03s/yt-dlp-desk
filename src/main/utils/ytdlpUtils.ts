import { spawn } from 'node:child_process';
import { FFMPEG_FOLDER_PATH, mainWindow, MEDIA_DATA_FOLDER_PATH, YTDLP_EXE_PATH } from '..';
import path from 'node:path';
import {
  downloadFile,
  pathExists,
  pathExistsSync,
  readJson,
  removeEmoji,
  sanitizeFileName,
  writeJson
} from './fsUtils';
import { LiveFromStartFormats, MediaInfoJson } from '@shared/types/info-json';
import { Source } from '@shared/types';
import logger from '@shared/logger';
import { writeFile } from 'node:fs/promises';
import { DownloadManager } from '@main/downloadManager';
import { NewDownloadHistoryItem } from '@main/types/db';
import { DownloadOptions } from '@shared/types/download';
import {
  getDailymotionId,
  getInstagramId,
  getRedditId,
  getTweetId,
  getYoutubeMusicId,
  getYoutubePlaylistId,
  getYouTubeVideoId
} from '@shared/utils';
import Settings from '@main/settings';

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

  if (source === 'youtube-playlist' || source === 'youtube-music-playlist') {
    const playlistId = getYoutubePlaylistId(url);
    const infoJsonPath = path.join(
      MEDIA_DATA_FOLDER_PATH,
      source,
      playlistId!,
      playlistId + '.info.json'
    );
    return infoJsonPath;
  }

  if (source === 'youtube-music') {
    const musicId = getYoutubeMusicId(url);
    const infoJsonPath = path.join(
      MEDIA_DATA_FOLDER_PATH,
      source,
      musicId!,
      musicId + '.info.json'
    );
    return infoJsonPath;
  }

  if (source === 'twitter-video') {
    const tweetId = getTweetId(url);
    const infoJsonPath = path.join(
      MEDIA_DATA_FOLDER_PATH,
      source,
      tweetId!,
      tweetId + '.info.json'
    );
    return infoJsonPath;
  }
  if (source === 'instagram-video') {
    const instagramId = getInstagramId(url);
    const infoJsonPath = path.join(
      MEDIA_DATA_FOLDER_PATH,
      source,
      instagramId!,
      instagramId + '.info.json'
    );
    return infoJsonPath;
  }
  if (source === 'reddit-video') {
    const redditId = getRedditId(url);
    const infoJsonPath = path.join(
      MEDIA_DATA_FOLDER_PATH,
      source,
      redditId!,
      redditId + '.info.json'
    );
    return infoJsonPath;
  }
  if (source === 'dailymotion-video') {
    const dmId = getDailymotionId(url);
    const infoJsonPath = path.join(MEDIA_DATA_FOLDER_PATH, source, dmId!, dmId + '.info.json');
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
  if (refetch) {
    logger.info(`Re-fetching info-json for ${url}`);
    return await createInfoJson(url, source, infoJsonPath);
  }
  if (
    source === 'youtube-video' ||
    source === 'youtube-music' ||
    source === 'instagram-video' ||
    source === 'dailymotion-video'
  ) {
    if (await pathExists(infoJsonPath)) {
      const expireTime = await getExpireTime(infoJsonPath);
      if (new Date().toISOString() > expireTime!) {
        logger.info(`Links expired for ${url} on ${new Date(expireTime!)}`);
        logger.info(`Re-creating info-json for ${url}`);
        return (await createInfoJson(url, source, infoJsonPath)) as MediaInfoJson;
      } else {
        logger.info(`Links for ${url} expire at ${new Date(expireTime!)}`);
        return await readJson<MediaInfoJson>(infoJsonPath);
      }
    } else {
      return await createInfoJson(url, source, infoJsonPath);
    }
  }

  if (
    source === 'youtube-playlist' ||
    source === 'youtube-music-playlist' ||
    source === 'twitter-video' ||
    source === 'reddit-video'
  ) {
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
  const settings = Settings.getInstance();

  return await new Promise((resolve, reject) => {
    const jsRuntimePath = `quickjs:${settings.get('jsRuntimePath')}`;
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

    if (
      settings.get('cookiesFilePath').length > 0 &&
      pathExistsSync(settings.get('cookiesFilePath'))
    ) {
      infoJsonCommandArgs.push('--cookies');
      infoJsonCommandArgs.push(settings.get('cookiesFilePath'));
    }

    if (source === 'youtube-playlist' || source === 'youtube-music-playlist') {
      infoJsonCommandArgs.push('--flat-playlist');
    }

    const completeCommand = infoJsonCommandBase.concat(' ').concat(infoJsonCommandArgs.join(' '));
    logger.info(`Creating info-json for ${url}\nCommand: ${completeCommand}`);
    const child = spawn(infoJsonCommandBase, infoJsonCommandArgs);

    child.on('error', reject);

    child.stdout.setEncoding('utf-8');
    child.stderr.setEncoding('utf-8');

    child.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    child.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
      if (data.includes('ERROR')) {
        if (data.includes('No video formats found')) {
          mainWindow.webContents.send('yt-dlp:error', 'No video formats found');
        }
        if (data.includes('HTTPError')) {
          mainWindow.webContents.send('yt-dlp:error', 'HTTP Error');
        } else {
          mainWindow.webContents.send('yt-dlp:error', data);
        }
      }
    });

    child.on('close', async (code) => {
      if (code !== 0) return resolve(null);

      logger.info(`Created info json for ${url}`);

      if (source === 'youtube-video' || source === 'youtube-music') {
        let infoJson = await readJson<MediaInfoJson>(infoJsonPath);
        infoJson = await addCreatedAt(infoJson);
        infoJson = await downloadThumbnail(infoJson, source, url);
        infoJson = await addExpiresAt(infoJson, source);
        infoJson = await writeDescription(infoJson, source);
        if (infoJson.is_live) {
          infoJson = await addLiveFromStartFormats(url, infoJson);
        }

        await writeJson(infoJsonPath, infoJson);

        return resolve(infoJson);
      }
      if (source === 'youtube-playlist' || source === 'youtube-music-playlist') {
        let infoJson = await readJson<MediaInfoJson>(infoJsonPath);
        infoJson = await addCreatedAt(infoJson);
        infoJson = await downloadThumbnail(infoJson, source, url);

        await writeJson(infoJsonPath, infoJson);

        return resolve(infoJson);
      }

      if (source === 'twitter-video' || source === 'reddit-video') {
        let infoJson = await readJson<MediaInfoJson>(infoJsonPath);
        infoJson = await addCreatedAt(infoJson);
        infoJson = await downloadThumbnail(infoJson, source, url);
        infoJson = await writeDescription(infoJson, source);

        await writeJson(infoJsonPath, infoJson);

        return resolve(infoJson);
      }

      if (source === 'instagram-video' || source === 'dailymotion-video') {
        let infoJson = await readJson<MediaInfoJson>(infoJsonPath);
        infoJson = await addCreatedAt(infoJson);
        infoJson = await downloadThumbnail(infoJson, source, url);
        infoJson = await addExpiresAt(infoJson, source);
        infoJson = await writeDescription(infoJson, source);

        await writeJson(infoJsonPath, infoJson);

        return resolve(infoJson);
      }

      resolve(null);
    });
  });
}

async function addLiveFromStartFormats(url: string, infoJson: MediaInfoJson) {
  const settings = Settings.getInstance();
  const jsRuntimePath = `quickjs:${settings.get('jsRuntimePath')}`;
  const baseCommand = YTDLP_EXE_PATH;
  const args = ['--js-runtimes', jsRuntimePath, '-F', url, '--live-from-start'];

  if (
    settings.get('cookiesFilePath').length > 0 &&
    pathExistsSync(settings.get('cookiesFilePath'))
  ) {
    args.push('--cookies');
    args.push(settings.get('cookiesFilePath'));
  }

  const completeCommand = baseCommand.concat(' ').concat(args.join(' '));

  console.log(`Live from start command: \n${completeCommand}`);

  return new Promise<MediaInfoJson>((resolve) => {
    let formatsString: string;
    const child = spawn(baseCommand, args);

    child.stdout.setEncoding('utf-8');
    child.stderr.setEncoding('utf-8');

    child.stdout.on('data', (data) => {
      console.log(data);
      if (data.includes('Available formats')) {
        formatsString = data;
      }
    });

    child.stderr.on('data', (data) => {
      console.log(data);
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
        logger.info(`Added live from start formats for ${url}`);
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

  logger.info(`Live from start formats found: ${parsedFormats.length}`);
  return parsedFormats;
}

async function addCreatedAt(infoJson: MediaInfoJson) {
  infoJson.created_at = new Date().toISOString();
  return infoJson;
}

async function addExpiresAt(infoJson: MediaInfoJson, source?: Source) {
  if (source === 'youtube-video') {
    const format = infoJson.formats.find((f) => f.vcodec !== 'none' && f.url);

    if (!format?.url) {
      logger.info('Format not available to add expire time');
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
      logger.info(`No expire param found for: ${url}}`);
      infoJson.expires_at = new Date(Date.now() + 1000 * 60 * 15).toISOString();
      return infoJson;
    }

    logger.info(`Adding expire time from expire param`);
    infoJson.expires_at = new Date(Number(expireParam) * 1000).toISOString();
    return infoJson;
  } else if (source === 'instagram-video' || source === 'dailymotion-video') {
    // 6 hour
    logger.info(`Adding default expire time for ${source}`);
    infoJson.expires_at = new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString();
    return infoJson;
  }
  // 15 min
  logger.info(`Adding default expire time for ${source}`);
  infoJson.expires_at = new Date(Date.now() + 1000 * 60 * 15).toISOString();
  return infoJson;
}

async function getExpireTime(infoJsonPath: string) {
  const json = await readJson<MediaInfoJson>(infoJsonPath);
  return json.expires_at;
}

async function downloadThumbnail(infoJson: MediaInfoJson, source: Source, url: string) {
  const safeTitle = sanitizeFileName(infoJson.fulltitle ?? infoJson.title);

  const thumbnailLocalPath = path.join(
    MEDIA_DATA_FOLDER_PATH,
    source,
    infoJson.id,
    safeTitle + '.jpg'
  );

  const urls: string[] = [];
  if (infoJson.thumbnail) urls.push(infoJson.thumbnail);

  if (Array.isArray(infoJson.thumbnails)) {
    for (const t of [...infoJson.thumbnails].reverse()) {
      if (t?.url) urls.push(t.url);
    }
  }

  for (const thumbnailUrl of urls) {
    try {
      const res = await fetch(thumbnailUrl, { method: 'HEAD' });

      if (!res.ok) {
        logger.warn(`Thumbnail HEAD failed (${res.status}) for ${thumbnailUrl}, trying next`);
        continue;
      }

      await downloadFile({ url: thumbnailUrl, destinationPath: thumbnailLocalPath });

      logger.info(
        `Downloaded thumbnail for ${infoJson.fulltitle ?? infoJson.title} from ${thumbnailUrl}`
      );
      infoJson.thumbnail_local = thumbnailLocalPath;
      return infoJson;
    } catch (err) {
      logger.warn(err);
      continue;
    }
  }

  logger.error(`All thumbnail URLs failed for ${url}`);
  return infoJson;
}

async function writeDescription(infoJson: MediaInfoJson, source: Source) {
  const safeTitle = sanitizeFileName(infoJson.fulltitle ?? infoJson.title);

  const descriptionLocalPath = path.join(
    MEDIA_DATA_FOLDER_PATH,
    source,
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
  const settings = Settings.getInstance();
  const { url, source, selectedFormat, downloadSections, selectedDownloadFolder, extraOptions } =
    downloadOptions;

  if (
    source === 'youtube-video' ||
    source === 'youtube-music' ||
    source === 'twitter-video' ||
    source === 'instagram-video' ||
    source === 'reddit-video' ||
    source === 'dailymotion-video'
  ) {
    console.log({ url, source, selectedFormat, downloadSections, extraOptions });
    const mediaInfo = downloadOptions.mediaInfo as MediaInfoJson;
    const infoJsonPath = getInfoJsonPath(url, source);
    const formatId = selectedFormat.format_id!;
    let targetDownloadFileName = `${removeEmoji(mediaInfo.fulltitle ?? mediaInfo.title, '_')} [${selectedFormat.resolution}] [${selectedFormat.format_id}]`;

    const jsRuntimePath = `quickjs:${settings.get('jsRuntimePath')}`;
    const downloadCommandBase = YTDLP_EXE_PATH;
    const downloadCommandArgs = ['--js-runtimes', jsRuntimePath, '--newline'];

    downloadCommandArgs.push('--ffmpeg-location');
    downloadCommandArgs.push(FFMPEG_FOLDER_PATH);

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
      downloadCommandArgs.push('--download-sections', `*${downloadSections.startTime}-`);
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

    if (
      settings.get('cookiesFilePath').length > 0 &&
      (await pathExists(settings.get('cookiesFilePath')))
    ) {
      downloadCommandArgs.push('--cookies');
      downloadCommandArgs.push(settings.get('cookiesFilePath'));
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
    const targetDownloadFileNameWithoutExt = sanitizeFileName(targetDownloadFileName, '_');
    const targetDownloadFilePathWithoutExt = path.join(
      selectedDownloadFolder,
      targetDownloadFileNameWithoutExt
    );
    targetDownloadFileName = targetDownloadFileNameWithoutExt + '.%(ext)s';
    const targetDownloadFilePath = path.join(selectedDownloadFolder, targetDownloadFileName);
    downloadCommandArgs.push('-o', targetDownloadFilePath);
    const completeCommand = downloadCommandBase.concat(' ').concat(downloadCommandArgs.join(' '));

    if (settings.get('rememberPreviousDownloadsFolder')) {
      const currentDownloadsFolder = settings.get('downloadsFolder');
      if (currentDownloadsFolder !== selectedDownloadFolder) {
        settings.set('downloadsFolder', selectedDownloadFolder);
        const updatedSettings = settings.getAll();
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
      download_path: targetDownloadFilePathWithoutExt,
      download_status: 'downloading',
      download_completed_at: '',
      download_command_base: downloadCommandBase,
      download_command_args: JSON.stringify(downloadCommandArgs),
      format: selectedFormat.resolution + ' - ' + selectedFormat.format_id!,
      added_at: new Date().toISOString()
    };

    downloadManager.addDownload(newDownload);
  }
}
