import { getStoreManager } from '@main/store';
import logger from '@shared/logger';
import { Api, AppSettings, Source } from '@shared/types';
import { exec } from 'child_process';
import { promisify } from 'util';
const execPromise = promisify(exec);

export async function getYtdlpFromSettings() {
  const store = await getStoreManager();
  const ytdlpPath = store.get('settings.ytdlpPath') as string;
  const ytdlpVersion = store.get('settings.ytdlpVersion') as string;

  return {
    ytdlpPath,
    ytdlpVersion
  };
}

export async function getFfmpegFromSettings() {
  const store = await getStoreManager();
  const ffmpegPath = store.get('settings.ffmpegPath') as string;
  const ffmpegVersion = store.get('settings.ffmpegVersion') as string;

  return {
    ffmpegPath,
    ffmpegVersion
  };
}

export async function getSettings(): Promise<AppSettings> {
  const store = await getStoreManager();
  return store.get('settings') as AppSettings;
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
  return version;
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
  if (url.includes('youtube') || (url.includes('youtu.be') && !url.includes('playlist'))) {
    return 'youtube-video';
  } else if (url.includes('youtube') || (url.includes('youtu.be') && url.includes('playlist'))) {
    return 'youtube-playlist';
  }
  return null;
}

function getYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'youtu.be') {
      return parsed.pathname.slice(1);
    }
    if (parsed.hostname === 'www.youtube.com' || parsed.hostname === 'youtube.com') {
      return parsed.searchParams.get('v');
    }
    return null;
  } catch {
    return null;
  }
}

export function getNormalizedUrl(source: Source, url: string) {
  if (source === 'youtube-video') {
    const videoId = getYouTubeVideoId(url);
    return `https://www.youtube.com/watch?v=${videoId}`;
  }
  return '';
}
