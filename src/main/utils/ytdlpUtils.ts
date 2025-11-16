import { spawn } from 'node:child_process';
import { MEDIA_DATA_FOLDER_PATH } from '..';
import path from 'node:path';
import { URL } from 'node:url';
import { pathExists, readJson, writeJson } from './fsUtils';
import { YoutubeVideo } from '../../shared/types/info-json/youtube-video';
import { Source } from '../../shared/types';
import { YoutubePlaylist } from '../../shared/types/info-json/youtube-playlist';
import logger from '../../shared/logger';

async function addExpireTime(infoJsonPath: string) {
  const json = await readJson<YoutubeVideo>(infoJsonPath);
  const format = json.formats.find((format) => format.vcodec !== 'none' && format.manifest_url);
  const expireTimestamp = format?.manifest_url.split('/')[7];
  const expireTimestampISOString = new Date(Number(expireTimestamp) * 1000).toISOString();
  json.expire_time = expireTimestampISOString;
  await writeJson(infoJsonPath, json);
}

async function getExpireTime(infoJsonPath: string) {
  const json = await readJson<YoutubeVideo>(infoJsonPath);
  return json.expire_time;
}

export async function createInfoJson(
  url: string,
  source: Source,
  infoJsonPath: string
): Promise<YoutubeVideo | YoutubePlaylist | null> {
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
        await addExpireTime(infoJsonPath);
        const result = await readJson<YoutubeVideo>(infoJsonPath);
        return resolve(result);
      }

      resolve(null);
    });
  });
}

export async function getInfoJson(
  url: string,
  source: Source
): Promise<YoutubeVideo | YoutubePlaylist | null> {
  if (source === 'youtube-video') {
    const videoId = new URL(url).searchParams.get('v') as string;
    const infoJsonPath = path.join(MEDIA_DATA_FOLDER_PATH, source, videoId, videoId + '.info.json');
    if (await pathExists(infoJsonPath)) {
      const expireTime = await getExpireTime(infoJsonPath);
      if (new Date().toISOString() > expireTime) {
        return (await createInfoJson(url, source, infoJsonPath)) as YoutubeVideo;
      } else {
        return await readJson<YoutubeVideo>(infoJsonPath);
      }
    } else {
      return await createInfoJson(url, source, infoJsonPath);
    }
  }
  return null;
}
