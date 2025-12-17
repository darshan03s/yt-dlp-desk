import { Source } from './types';

export function getMediaId(url: string, source: Source): string | null {
  if (source === 'youtube-video') return getYouTubeVideoId(url);
  if (source === 'youtube-playlist') return getYoutubePlaylistId(url);
  if (source === 'youtube-music') return getYoutubeMusicId(url);
  if (source === 'youtube-music-playlist') return getYoutubePlaylistId(url);
  if (source === 'twitter-video') return getTweetId(url);
  if (source === 'instagram-video') return getInstagramId(url);
  if (source === 'reddit-video') return getRedditId(url);
  if (source === 'dailymotion-video') return getDailymotionId(url);
  if (source === 'pinterest-video') return getPinterestId(url);
  return null;
}

export function getYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    // shortened url
    if (parsed.hostname === 'youtu.be') {
      return parsed.pathname.slice(1);
    }
    if (parsed.hostname === 'www.youtube.com' || parsed.hostname === 'youtube.com') {
      // url with watch?v
      if (parsed.pathname.includes('watch')) return parsed.searchParams.get('v');
      // shorts and embed url
      if (parsed.pathname.includes('shorts') || parsed.pathname.includes('embed'))
        return parsed.pathname.split('/')[2];
    }
    return null;
  } catch {
    return null;
  }
}

export function getYoutubePlaylistId(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get('list');
  } catch {
    return null;
  }
}

export function getYoutubeMusicId(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get('v');
  } catch {
    return null;
  }
}

export function getTweetId(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.pathname.split('/').at(-1)!;
  } catch {
    return null;
  }
}

export function getInstagramId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.pathname.startsWith('/p')) {
      return parsed.pathname.split('/')[2]!;
    }
    if (parsed.pathname.startsWith('/reels') || parsed.pathname.startsWith('/reel')) {
      return parsed.pathname.split('/')[2]!;
    }
    if (!parsed.pathname.startsWith('/reel') && parsed.pathname.includes('/reel')) {
      return parsed.pathname.split('/')[3]!;
    }
    return null;
  } catch {
    return null;
  }
}

export function getRedditId(url: string): string | null {
  const parsed = new URL(url);
  if (parsed.pathname.startsWith('/r')) {
    return parsed.pathname.split('/')[4];
  }
  if (parsed.pathname.startsWith('/comments')) {
    return parsed.pathname.split('/')[2];
  }
  return null;
}

export function getDailymotionId(url: string): string | null {
  const parsed = new URL(url);
  if (parsed.pathname.startsWith('/video')) {
    return parsed.pathname.split('/')[2];
  }
  if (parsed.pathname.startsWith('/')) {
    return parsed.pathname.split('/')[1];
  }
  return null;
}

export function getPinterestId(url: string): string | null {
  const parsed = new URL(url);
  if (parsed.pathname.startsWith('/pin')) {
    return parsed.pathname.split('/')[2];
  }
  if (parsed.pathname.startsWith('/')) {
    return parsed.pathname.split('/')[1];
  }
  return null;
}

export const AUDIO_EXTS = new Set([
  '.mp3',
  '.m4a',
  '.aac',
  '.wav',
  '.flac',
  '.alac',
  '.ogg',
  '.oga',
  '.opus',
  '.amr',
  '.aiff',
  '.aif',
  '.aifc',
  '.wv',
  '.wma',
  '.mp2',
  '.mp1',
  '.mka',
  '.ra',
  '.rm',
  '.dsf',
  '.dff'
]);

export function isAudio(filePath: string): boolean {
  const clean = filePath.toLowerCase();
  return Array.from(AUDIO_EXTS).some((ext) => clean.endsWith(ext));
}

export const VIDEO_EXTS = new Set([
  '.mp4',
  '.mkv',
  '.webm',
  '.mov',
  '.avi',
  '.wmv',
  '.flv',
  '.f4v',
  '.m4v',
  '.mpeg',
  '.mpg',
  '.mp2v',
  '.3gp',
  '.3g2',
  '.mts',
  '.m2ts',
  '.ts',
  '.vob',
  '.ogv',
  '.rm',
  '.rmvb'
]);

export function isVideo(filePath: string): boolean {
  const clean = filePath.toLowerCase();
  return Array.from(VIDEO_EXTS).some((ext) => clean.endsWith(ext));
}
