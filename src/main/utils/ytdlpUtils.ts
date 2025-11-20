import { spawn } from 'node:child_process';
import { MEDIA_DATA_FOLDER_PATH } from '..';
import path from 'node:path';
import { URL } from 'node:url';
import { downloadFile, pathExists, readJson, sanitizeFileName, writeJson } from './fsUtils';
import { YoutubeVideoInfoJson } from '@shared/types/info-json/youtube-video';
import { Source } from '@shared/types';
import { YoutubePlaylistInfoJson } from '@shared/types/info-json/youtube-playlist';
import logger from '@shared/logger';
import { writeFile } from 'node:fs/promises';

export async function getInfoJson(
  url: string,
  source: Source
): Promise<YoutubeVideoInfoJson | YoutubePlaylistInfoJson | null> {
  if (source === 'youtube-video') {
    const videoId = new URL(url).searchParams.get('v') as string;
    const infoJsonPath = path.join(MEDIA_DATA_FOLDER_PATH, source, videoId, videoId + '.info.json');
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
  return await new Promise((resolve, reject) => {
    const child = spawn('yt-dlp', [
      '--skip-download',
      '--write-info-json',
      '-o',
      infoJsonPath.split('.info.json')[0],
      url
    ]);

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
  const format = infoJson.formats.find((format) => format.vcodec !== 'none' && format.manifest_url);
  const expireTimestamp = format?.manifest_url.split('/')[7];
  const expireTimestampISOString = new Date(Number(expireTimestamp) * 1000).toISOString();
  infoJson.expires_at = expireTimestampISOString;
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
