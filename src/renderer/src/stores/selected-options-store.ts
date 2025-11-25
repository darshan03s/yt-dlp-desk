import { YoutubeFormat } from '@/shared/types/info-json/youtube-video';
import { create } from 'zustand';

export interface SelectedFormat extends Partial<YoutubeFormat> {}

export interface DownloadSections {
  startTime: string;
  endTime: string;
  forceKeyframesAtCuts: boolean;
}

interface SelectedOptionsStore {
  selectedFormat: SelectedFormat;
  downloadSections: DownloadSections;
  setSelectedFormat: (data: SelectedFormat) => void;
  setDownloadSections: (data: Partial<DownloadSections>) => void;
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

  downloadSections: {
    startTime: '',
    endTime: '',
    forceKeyframesAtCuts: false
  },

  setSelectedFormat: (data) =>
    set({
      selectedFormat: data
    }),

  setDownloadSections: (data) =>
    set((state) => ({
      downloadSections: {
        ...state.downloadSections,
        ...data
      }
    }))
}));
