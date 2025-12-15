import { DownloadSections, ExtraOptions } from '@/shared/types/download';
import { MediaFormat } from '@/shared/types/info-json';
import { create } from 'zustand';

export interface SelectedFormat extends Partial<MediaFormat> {}

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

const initialSelectedFormatState: SelectedFormat = {
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
};

const initialDownloadSectionsState: DownloadSections = {
  startTime: '',
  endTime: '',
  forceKeyframesAtCuts: false
};

const initialExtraOptionsState: ExtraOptions = {
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
  selectedFormat: initialSelectedFormatState,

  downloadSections: initialDownloadSectionsState,

  selectedDownloadFolder: '',

  extraOptions: initialExtraOptionsState,

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
      extraOptions: initialExtraOptionsState
    }))
}));
