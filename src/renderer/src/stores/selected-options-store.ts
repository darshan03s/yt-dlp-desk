import { YoutubeFormat } from '@/shared/types/info-json/youtube-video';
import { create } from 'zustand';

export interface SelectedFormat extends Partial<YoutubeFormat> {}

interface SelectedOptionsStore {
  selectedFormat: SelectedFormat;
  setSelectedFormat: (data: SelectedFormat) => void;
}

export const useSelectedOptionsStore = create<SelectedOptionsStore>((set) => ({
  selectedFormat: {
    ext: '',
    format: '',
    resolution: '',
    fps: 0,
    acodec: '',
    vcodec: '',
    filesize_approx: 0,
    format_id: '',
    format_note: '',
    width: 0,
    height: 0
  },

  setSelectedFormat: (data) =>
    set({
      selectedFormat: data
    })
}));
