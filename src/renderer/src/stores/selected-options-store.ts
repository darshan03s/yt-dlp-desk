import { DownloadSections, ExtraOptions } from '@/shared/types/download';
import { YoutubeFormat } from '@/shared/types/info-json/youtube-video';
import { create } from 'zustand';

export interface SelectedFormat extends Partial<YoutubeFormat> {}

interface SelectedOptionsStore {
  selectedFormat: SelectedFormat;
  downloadSections: DownloadSections;
  selectedDownloadFolder: string;
  extraOptions: ExtraOptions;
  setSelectedFormat: (data: SelectedFormat) => void;
  setDownloadSections: (data: Partial<DownloadSections>) => void;
  setExtraOptions: (data: Partial<ExtraOptions>) => void;
  resetExtraOptions: () => void;
}

const initialExtraOptions: ExtraOptions = {
  embedThumbnail: false,
  embedChapters: false,
  embedSubs: false,
  embedMetadata: false,
  writeDescription: false,
  writeComments: false,
  writeThumbnail: false,
  writeSubs: false,
  writeAutoSubs: false,
  liveFromStart: false
};

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

  selectedDownloadFolder: '',

  extraOptions: initialExtraOptions,

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
    })),

  setExtraOptions: (data) =>
    set((state) => ({
      extraOptions: {
        ...state.extraOptions,
        ...data
      }
    })),

  resetExtraOptions: () =>
    set(() => ({
      extraOptions: initialExtraOptions
    }))
}));
