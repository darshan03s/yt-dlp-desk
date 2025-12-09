import { Source } from '@/shared/types';
import youtubeLogo from '../assets/youtube-logo.svg';
import youtubeMusicLogo from '../assets/youtube-music-logo.svg';

export function Logo(source: Source) {
  if (source === 'youtube-video') {
    return youtubeLogo;
  }
  if (source === 'youtube-playlist') {
    return youtubeLogo;
  }
  if (source === 'youtube-music') {
    return youtubeMusicLogo;
  }
  if (source === 'youtube-music-playlist') {
    return youtubeMusicLogo;
  }
  return '';
}
