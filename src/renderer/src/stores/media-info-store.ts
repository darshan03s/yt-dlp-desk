import { Source } from '@/shared/types';
import { YoutubePlaylist } from '@/shared/types/info-json/youtube-playlist';
import { YoutubeVideo } from '@/shared/types/info-json/youtube-video';
import { create } from 'zustand';

interface MediaInfoStore {
  url: string;
  source: Source | string;
  mediaInfo: YoutubeVideo | YoutubePlaylist | object;
}

export const useMediaInfoStore = create<MediaInfoStore>(() => ({
  url: '',
  source: '',
  mediaInfo: {}
}));
