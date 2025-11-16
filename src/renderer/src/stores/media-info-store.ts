import { Source } from '@/shared/types';
import { create } from 'zustand';

interface MediaInfoStore {
  url: string;
  source: Source | string;
  mediaInfo: object;
}

export const useMediaInfoStore = create<MediaInfoStore>(() => ({
  url: '',
  source: '',
  mediaInfo: {}
}));
