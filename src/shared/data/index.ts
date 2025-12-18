import { Source } from '@shared/types';

export const allowedSources = [
  'youtube-video',
  'youtube-playlist',
  'youtube-music',
  'youtube-music-playlist',
  'twitter-video',
  'instagram-video',
  'reddit-video',
  'dailymotion-video',
  'pinterest-video',
  'rumble-video'
] as const;

export const mediaSources: readonly Source[] = [
  'youtube-video',
  'youtube-music',
  'twitter-video',
  'instagram-video',
  'reddit-video',
  'dailymotion-video',
  'pinterest-video',
  'rumble-video'
];

export const playlistSources: readonly Source[] = ['youtube-playlist', 'youtube-music-playlist'];

export const SERVER_PORT = 12277;
export const SERVER_BASE_URL = 'http://localhost';

export const DEFAULT_MAX_CONCURRENT_DOWNLOADS = 2;
export const MAX_ALLOWED_CONCURRENT_DOWNLOADS = 5;

export const SUPPORTED_COOKIE_BROWSERS = [
  'brave',
  'chrome',
  'chromium',
  'edge',
  'firefox',
  'opera',
  'safari',
  'vivaldi',
  'whale'
] as const;
