import { create } from 'zustand';
import { type AppSettings } from '@/shared/types';

interface SettingsStore extends AppSettings {
  setSettings: (settings: Partial<AppSettings>) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  appVersion: '',
  defaultFormat: '',
  downloadsFolder: '',
  ffmpegPath: '',
  ffmpegVersion: '',
  mediaDataFolder: '',
  platform: '',
  userDownloadsFolder: '',
  ytdlpPath: '',
  ytdlpVersion: '',
  jsRuntimePath: '',
  downloadTemplate: '',
  rememberPreviousDownloadsFolder: false,
  cookiesFilePath: '',
  setSettings: (settings) => set((state) => ({ ...state, ...settings }))
}));
