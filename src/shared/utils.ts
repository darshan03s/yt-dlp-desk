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
    return videoId;
  } catch {
    return null;
  }
}

export function getYoutubePlaylistId(url: string): string | null {
  let playlistId: string | null = null;
  try {
    const parsed = new URL(url);
    playlistId = parsed.searchParams.get('list');
    return playlistId;
  } catch {
    return null;
  }
}

export function getYoutubeMusicId(url: string): string | null {
  let musicId: string | null = null;
  try {
    const parsed = new URL(url);
    musicId = parsed.searchParams.get('v');
    return musicId;
  } catch {
    return null;
  }
}

export function getTweetId(url: string): string | null {
  let tweetId: string | null = null;
  try {
    const parsed = new URL(url);
    tweetId = parsed.pathname.split('/').at(-1)!;
    return tweetId;
  } catch {
    return null;
  }
}

export function getInstagramId(url: string): string | null {
  let instagramId: string | null = null;
  try {
    const parsed = new URL(url);
    if (parsed.pathname.startsWith('/p')) {
      instagramId = parsed.pathname.split('/')[2]!;
      return instagramId;
    }
    if (parsed.pathname.startsWith('/reels') || parsed.pathname.startsWith('/reel')) {
      instagramId = parsed.pathname.split('/')[2]!;
      return instagramId;
    }
    if (!parsed.pathname.startsWith('/reel') && parsed.pathname.includes('/reel')) {
      instagramId = parsed.pathname.split('/')[3]!;
      return instagramId;
    }
    return null;
  } catch {
    return null;
  }
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
