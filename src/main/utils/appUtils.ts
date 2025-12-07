import { getStoreManager } from '@main/store';
import logger from '@shared/logger';
import { Api, AppSettings, Source } from '@shared/types';
import { ChildProcess, exec } from 'child_process';
import { promisify } from 'util';
const execPromise = promisify(exec);

export async function getYtdlpFromSettings() {
  const store = await getStoreManager();
  const ytdlpPath = store.get('ytdlpPath') as string;
  const ytdlpVersion = store.get('ytdlpVersion') as string;

  return {
    ytdlpPath,
    ytdlpVersion
  };
}

export async function getFfmpegFromSettings() {
  const store = await getStoreManager();
  const ffmpegPath = store.get('ffmpegPath') as string;
  const ffmpegVersion = store.get('ffmpegVersion') as string;

  return {
    ffmpegPath,
    ffmpegVersion
  };
}

export async function getSettings(): Promise<AppSettings> {
  const store = await getStoreManager();
  return store.getAll();
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
  if (url.includes('youtube') || (url.includes('youtu.be') && !url.includes('playlist'))) {
    return 'youtube-video';
  } else if (url.includes('youtube') || (url.includes('youtu.be') && url.includes('playlist'))) {
    return 'youtube-playlist';
  }
  return null;
}

export function getYouTubeVideoId(url: string): string | null {
  let videoId: string | null = null;
  try {
    const parsed = new URL(url);
    // shortened url
    if (parsed.hostname === 'youtu.be') {
      videoId = parsed.pathname.slice(1);
    }
    if (parsed.hostname === 'www.youtube.com' || parsed.hostname === 'youtube.com') {
      // url with watch?v
      if (parsed.pathname.includes('watch')) videoId = parsed.searchParams.get('v');
      // shorts and embed url
      if (parsed.pathname.includes('shorts') || parsed.pathname.includes('embed'))
        videoId = parsed.pathname.split('/')[2];
    }
    console.log({ url, videoId });
    return videoId;
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

export function terminateProcess(process: ChildProcess) {
  const pid = process.pid;
  exec(`taskkill /PID ${pid} /T /F`);
}
