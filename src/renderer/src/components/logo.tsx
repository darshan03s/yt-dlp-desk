import { Source } from '@/shared/types';
import { IconMusic, IconPlaylist, IconVideo } from '@tabler/icons-react';

type LogoProps = {
  source: Source;
};

const Logo = ({ source }: LogoProps) => {
  if (
    source === 'youtube-video' ||
    source === 'twitter-video' ||
    source === 'instagram-video' ||
    source === 'reddit-video' ||
    source === 'dailymotion-video'
  ) {
    return <IconVideo className="size-4" />;
  }

  if (source === 'youtube-playlist') {
    return <IconPlaylist className="size-4" />;
  }

  if (source === 'youtube-music' || source === 'youtube-music-playlist') {
    return <IconMusic className="size-4" />;
  }

  return null;
};

export default Logo;
