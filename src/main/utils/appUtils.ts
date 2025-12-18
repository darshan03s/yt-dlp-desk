import Settings from '@main/settings';
import logger from '@shared/logger';
import { Api, AppSettings, Source } from '@shared/types';
import {
  getDailymotionId,
  getInstagramId,
  getRedditId,
  getRumbleId,
  getYoutubeMusicId,
  getYoutubePlaylistId,
  getYouTubeVideoId
} from '@shared/utils';
import { ChildProcess, exec } from 'child_process';
import { app } from 'electron';
import { readdir } from 'fs/promises';
import path from 'path';
import { promisify } from 'util';
import { listFolderItems } from './fsUtils';
const execPromise = promisify(exec);

export async function getYtdlpFromSettings() {
  const settings = Settings.getInstance();
  const ytdlpPath = settings.get('ytdlpPath') as string;
  const ytdlpVersion = settings.get('ytdlpVersion') as string;

  return {
    ytdlpPath,
    ytdlpVersion
  };
}

export async function getFfmpegFromSettings() {
  const settings = Settings.getInstance();
  const ffmpegPath = settings.get('ffmpegPath') as string;
  const ffmpegVersion = settings.get('ffmpegVersion') as string;

  return {
    ffmpegPath,
    ffmpegVersion
  };
}

export async function getSettings(): Promise<AppSettings> {
  const settings = Settings.getInstance();
  return settings.getAll();
}

async function getAppPath(appName: string) {
  try {
    let command: string;
    if (process.platform === 'win32') {
      command = `(Get-Command ${appName}).Source`;
      const { stdout } = await execPromise(command, { shell: 'powershell.exe' });
      return { found: true, path: stdout.trim() };
    } else {
      command = `which ${appName}`;
      const { stdout } = await execPromise(command);
      return { found: true, path: stdout.trim() };
    }
  } catch (error) {
    logger.error(error);
    return { found: false, path: null };
  }
}

async function appExistsInPc(appName: string) {
  const { found } = await getAppPath(appName);
  return found;
}

export async function getYtdlpVersionFromPc(ytdlpPath: string = 'yt-dlp') {
  const { stdout } = await execPromise(`${ytdlpPath} --version`);
  return stdout.trim();
}

export async function getFfmpegVersionFromPc(ffmpegPath: string = 'ffmpeg') {
  const { stdout } = await execPromise(`${ffmpegPath} -version`);
  const match = stdout.match(/ffmpeg version\s+(\d+(?:\.\d+)?)/);
  const version = match ? match[1] : null;
  return version ?? 'N/A';
}

export async function getYtdlpFromPc(): ReturnType<Api['confirmYtdlp']> {
  if (await appExistsInPc('yt-dlp')) {
    return {
      ytdlpPathInPc: (await getAppPath('yt-dlp')).path,
      ytdlpVersionInPc: await getYtdlpVersionFromPc()
    };
  } else {
    return {
      ytdlpPathInPc: null,
      ytdlpVersionInPc: null
    };
  }
}

export async function getFfmpegFromPc(): ReturnType<Api['confirmFfmpeg']> {
  if (await appExistsInPc('ffmpeg')) {
    return {
      ffmpegPathInPc: (await getAppPath('ffmpeg')).path,
      ffmpegVersionInPc: await getFfmpegVersionFromPc()
    };
  } else {
    return {
      ffmpegPathInPc: null,
      ffmpegVersionInPc: null
    };
  }
}

export function getSourceFromUrl(url: string): Source | null {
  const parsedUrl = new URL(url);
  if (parsedUrl.hostname.includes('www.youtube.com')) {
    if (!parsedUrl.searchParams.get('v') && parsedUrl.searchParams.get('list')) {
      return 'youtube-playlist';
    }
    if (parsedUrl.searchParams.get('v')) {
      return 'youtube-video';
    }
    if (parsedUrl.pathname.includes('shorts')) {
      return 'youtube-video';
    }
  }
  if (parsedUrl.hostname.includes('youtu.be')) {
    return 'youtube-video';
  }
  if (parsedUrl.hostname.includes('music.youtube.com')) {
    if (!parsedUrl.searchParams.get('v') && parsedUrl.searchParams.get('list')) {
      return 'youtube-music-playlist';
    }
    if (parsedUrl.searchParams.get('v')) {
      return 'youtube-music';
    }
  }
  if (parsedUrl.hostname.includes('x.com')) {
    return 'twitter-video';
  }
  if (parsedUrl.hostname.includes('instagram.com')) {
    return 'instagram-video';
  }
  if (parsedUrl.hostname.includes('reddit.com')) {
    return 'reddit-video';
  }
  if (parsedUrl.hostname.includes('dailymotion.com') || parsedUrl.hostname.includes('dai.ly')) {
    return 'dailymotion-video';
  }
  if (parsedUrl.hostname.includes('pinterest.com') || parsedUrl.hostname.includes('pin.it')) {
    return 'pinterest-video';
  }
  if (parsedUrl.hostname.includes('rumble.com')) {
    return 'rumble-video';
  }
  return null;
}

export function getNormalizedUrl(source: Source, url: string) {
  if (source === 'youtube-video') {
    const videoId = getYouTubeVideoId(url);
    return `https://www.youtube.com/watch?v=${videoId}`;
  }
  if (source === 'youtube-playlist') {
    const playlistId = getYoutubePlaylistId(url);
    return `https://youtube.com/playlist?list=${playlistId}`;
  }
  if (source === 'youtube-music') {
    const musicId = getYoutubeMusicId(url);
    return `https://music.youtube.com/watch?v=${musicId}`;
  }
  if (source === 'youtube-music-playlist') {
    const playlistId = getYoutubePlaylistId(url);
    return `https://music.youtube.com/playlist?list=${playlistId}`;
  }
  if (source === 'twitter-video') {
    const parsed = new URL(url);
    parsed.search = '';
    return parsed.toString();
  }
  if (source === 'instagram-video') {
    const parsed = new URL(url);
    if (parsed.pathname.startsWith('/p')) {
      const id = getInstagramId(url);
      return `https://www.instagram.com/p/${id}`;
    }
    if (parsed.pathname.startsWith('/reels')) {
      const id = getInstagramId(url);
      return `https://www.instagram.com/reels/${id}`;
    }
    if (parsed.pathname.startsWith('/reel')) {
      const id = getInstagramId(url);
      return `https://www.instagram.com/reel/${id}`;
    }
    if (!parsed.pathname.startsWith('/reel') && parsed.pathname.includes('/reel')) {
      const id = getInstagramId(url);
      return `https://www.instagram.com/reel/${id}`;
    }
  }
  if (source === 'reddit-video') {
    const id = getRedditId(url);
    return `https://www.reddit.com/comments/${id}`;
  }
  if (source === 'dailymotion-video') {
    const id = getDailymotionId(url);
    return `https://www.dailymotion.com/video/${id}`;
  }
  if (source === 'pinterest-video') {
    return url;
  }
  if (source === 'rumble-video') {
    const id = getRumbleId(url);
    return `https://rumble.com/${id}.html`;
  }
  return '';
}

export function terminateProcess(process: ChildProcess) {
  const pid = process.pid;
  exec(`taskkill /PID ${pid} /T /F`);
}

export async function getAllInfoJsonFiles(
  rootDir: string,
  currentDir: string = rootDir
): Promise<string[]> {
  const entries = await readdir(currentDir, { withFileTypes: true });

  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        return getAllInfoJsonFiles(rootDir, fullPath);
      }

      if (entry.isFile() && entry.name.endsWith('.json')) {
        return path.relative(rootDir, fullPath);
      }

      return [];
    })
  );

  return files.flat();
}

export async function getFirefoxProfiles() {
  const roamingAppDataPath = app.getPath('appData');
  const firefoxProfilesFolder = path.join(roamingAppDataPath, 'Mozilla', 'Firefox', 'Profiles');
  const profilesList = await listFolderItems(firefoxProfilesFolder);
  return profilesList;
}
